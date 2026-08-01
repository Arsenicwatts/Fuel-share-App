<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'localhost';
$db = 'fuelshare_db';
$user = 'root';
$pass = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(["error" => "DB Connection Failed: " . $e->getMessage()]));
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// ======================== AUTH ========================

if ($method === 'POST' && $action === 'signup') {
    $data = json_decode(file_get_contents("php://input"));
    if (!$data || !isset($data->name, $data->email, $data->password)) {
        echo json_encode(["error" => "Invalid payload"]);
        exit();
    }

    // Validate email format
    if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["error" => "Invalid email format."]);
        exit();
    }

    // Validate password length
    if (strlen($data->password) < 6) {
        echo json_encode(["error" => "Password must be at least 6 characters."]);
        exit();
    }

    $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
    $stmt->execute([$data->email]);
    if ($stmt->fetch()) {
        echo json_encode(["error" => "An account with this email already exists!"]);
        exit();
    }

    // Hash the password securely using bcrypt
    $hashedPassword = password_hash($data->password, PASSWORD_BCRYPT);

    $stmt = $conn->prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)");
    $stmt->execute([$data->name, $data->email, $hashedPassword]);
    $user_id = $conn->lastInsertId();

    echo json_encode(["id" => $user_id, "name" => $data->name, "email" => $data->email]);
    exit();
}

if ($method === 'POST' && $action === 'login') {
    $data = json_decode(file_get_contents("php://input"));
    if (!$data || !isset($data->email, $data->password)) {
        echo json_encode(["error" => "Invalid payload"]);
        exit();
    }

    $stmt = $conn->prepare("SELECT user_id as id, name, email, phone, bio, password_hash FROM users WHERE email = ?");
    $stmt->execute([$data->email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($data->password, $user['password_hash'])) {
        // Remove password_hash from the response
        unset($user['password_hash']);
        echo json_encode($user);
    } else {
        echo json_encode(["error" => "Invalid email or password."]);
    }
    exit();
}

// ======================== RIDES ========================

if ($method === 'GET' && $action === 'get_rides') {
    // Step 1: Fetch all open rides in a single query
    $stmt = $conn->prepare("
        SELECT r.*, u.name as driver_name, u.email as driver_email, v.model as vehicle_model, v.capacity as available_seats
        FROM rides r 
        JOIN users u ON r.driver_id = u.user_id 
        JOIN vehicles v ON r.vehicle_id = v.vehicle_id
        WHERE r.status = 'Open'
        ORDER BY r.created_at DESC
    ");
    $stmt->execute();
    $rides = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($rides)) {
        echo json_encode([]);
        exit();
    }

    // Step 2: Batch-fetch all requests for all open rides
    $rideIds = array_column($rides, 'ride_id');
    $placeholders = implode(',', array_fill(0, count($rideIds), '?'));

    $reqStmt = $conn->prepare("
        SELECT req.request_id, req.ride_id, req.status, u.email, u.name 
        FROM ride_requests req
        JOIN users u ON req.passenger_id = u.user_id
        WHERE req.ride_id IN ($placeholders)
    ");
    $reqStmt->execute($rideIds);
    $allRequests = $reqStmt->fetchAll(PDO::FETCH_ASSOC);

    // Step 3: Batch-fetch all messages for all requests
    $requestIds = array_column($allRequests, 'request_id');
    $allMessages = [];
    if (!empty($requestIds)) {
        $msgPlaceholders = implode(',', array_fill(0, count($requestIds), '?'));
        $chatStmt = $conn->prepare("
            SELECT m.request_id, m.text, m.created_at as timestamp, u.email as sender, u.name as senderName
            FROM messages m
            JOIN users u ON m.sender_id = u.user_id
            WHERE m.request_id IN ($msgPlaceholders)
            ORDER BY m.created_at ASC
        ");
        $chatStmt->execute($requestIds);
        foreach ($chatStmt->fetchAll(PDO::FETCH_ASSOC) as $msg) {
            $allMessages[$msg['request_id']][] = $msg;
        }
    }

    // Step 4: Assemble the data in-memory
    $requestsByRide = [];
    foreach ($allRequests as &$req) {
        $req['chat'] = $allMessages[$req['request_id']] ?? [];
        $requestsByRide[$req['ride_id']][] = $req;
    }

    foreach ($rides as &$ride) {
        $requests = $requestsByRide[$ride['ride_id']] ?? [];
        $ride['requests'] = $requests;
        $accepted = count(array_filter($requests, fn($r) => $r['status'] === 'accepted'));
        $ride['available_seats'] = max(0, $ride['available_seats'] - $accepted);
    }

    echo json_encode($rides);
    exit();
}

if ($method === 'POST' && $action === 'create_ride') {
    $data = json_decode(file_get_contents("php://input"));

    $distance = floatval($data->distance ?? $data->distance_km ?? 0);
    $cost_per_seat = floatval($data->cost_per_seat ?? $data->calculated_cost_per_seat ?? 0);
    $driver_id = $data->driver_id ?? null;
    $start_location = $data->start_location ?? '';
    $end_location = $data->end_location ?? '';
    $start_time = $data->start_time ?? null;
    $model = $data->model ?? 'Standard Car';
    $mileage = floatval($data->mileage ?? 15.0);
    $capacity = intval($data->capacity ?? 4);

    // Input validation
    if (!$data || !$driver_id || !$start_location || !$end_location || $distance <= 0 || !$start_time) {
        echo json_encode(["error" => "Missing required fields: driver, locations, distance (>0), or departure time."]);
        exit();
    }

    if ($mileage <= 0) $mileage = 15.0;
    if ($capacity <= 0) $capacity = 4;
    if ($cost_per_seat <= 0) {
        $totalFuel = $distance / $mileage;
        $cost_per_seat = round(($totalFuel * 96.72) / $capacity);
    }

    $stmt = $conn->prepare("SELECT vehicle_id FROM vehicles WHERE owner_id = ? AND model = ?");
    $stmt->execute([$driver_id, $model]);
    $vehicle = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($vehicle) {
        $vehicle_id = $vehicle['vehicle_id'];
    } else {
        $stmt = $conn->prepare("INSERT INTO vehicles (owner_id, model, mileage, capacity) VALUES (?, ?, ?, ?)");
        $stmt->execute([$driver_id, $model, $mileage, $capacity]);
        $vehicle_id = $conn->lastInsertId();
    }

    $sql = "INSERT INTO rides (driver_id, vehicle_id, start_location, end_location, start_lat, start_lng, end_lat, end_lng, distance_km, start_time, base_fuel_price, calculated_cost_per_seat) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        $driver_id,
        $vehicle_id,
        $start_location,
        $end_location,
        $data->start_lat ?? null,
        $data->start_lng ?? null,
        $data->end_lat ?? null,
        $data->end_lng ?? null,
        $distance,
        $start_time,
        96.72,
        $cost_per_seat
    ]);

    $ride_id = $conn->lastInsertId();
    echo json_encode(["message" => "Ride Created", "ride_id" => $ride_id]);
    exit();
}

// ======================== SEAT REQUESTS ========================

if ($method === 'POST' && $action === 'request_seat') {
    $data = json_decode(file_get_contents("php://input"));
    if (!$data || !isset($data->ride_id, $data->passenger_id)) {
        echo json_encode(["error" => "Missing ride_id or passenger_id."]);
        exit();
    }
    $stmt = $conn->prepare("INSERT IGNORE INTO ride_requests (ride_id, passenger_id) VALUES (?, ?)");
    $stmt->execute([$data->ride_id, $data->passenger_id]);
    echo json_encode(["success" => true]);
    exit();
}

if ($method === 'POST' && $action === 'cancel_request') {
    $data = json_decode(file_get_contents("php://input"));
    if (!$data || !isset($data->ride_id, $data->passenger_id)) {
        echo json_encode(["error" => "Missing ride_id or passenger_id."]);
        exit();
    }
    $stmt = $conn->prepare("DELETE FROM ride_requests WHERE ride_id = ? AND passenger_id = ?");
    $stmt->execute([$data->ride_id, $data->passenger_id]);
    echo json_encode(["success" => true, "deleted" => $stmt->rowCount()]);
    exit();
}

if ($method === 'POST' && $action === 'respond_request') {
    $data = json_decode(file_get_contents("php://input"));
    if (!$data || !isset($data->ride_id, $data->passenger_email, $data->response_status)) {
        echo json_encode(["error" => "Missing required fields."]);
        exit();
    }

    // Validate status value
    $validStatuses = ['accepted', 'declined'];
    if (!in_array($data->response_status, $validStatuses)) {
        echo json_encode(["error" => "Invalid status. Must be 'accepted' or 'declined'."]);
        exit();
    }

    $stmt = $conn->prepare("
        UPDATE ride_requests req 
        JOIN users u ON req.passenger_id = u.user_id 
        SET req.status = ? 
        WHERE req.ride_id = ? AND u.email = ?
    ");
    $stmt->execute([$data->response_status, $data->ride_id, $data->passenger_email]);
    echo json_encode(["success" => true]);
    exit();
}

// ======================== MESSAGING ========================

if ($method === 'POST' && $action === 'send_message') {
    $data = json_decode(file_get_contents("php://input"));
    if (!$data || !isset($data->ride_id, $data->passenger_email, $data->sender_id, $data->text)) {
        echo json_encode(["error" => "Missing required fields."]);
        exit();
    }

    $reqStmt = $conn->prepare("
        SELECT req.request_id 
        FROM ride_requests req
        JOIN users u ON req.passenger_id = u.user_id
        WHERE req.ride_id = ? AND u.email = ?
    ");
    $reqStmt->execute([$data->ride_id, $data->passenger_email]);
    $req = $reqStmt->fetch(PDO::FETCH_ASSOC);

    if ($req) {
        $stmt = $conn->prepare("INSERT INTO messages (request_id, sender_id, text) VALUES (?, ?, ?)");
        $stmt->execute([$req['request_id'], $data->sender_id, $data->text]);
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["error" => "Request not found"]);
    }
    exit();
}

// ======================== RIDE MANAGEMENT ========================

if ($method === 'POST' && $action === 'delete_ride') {
    $data = json_decode(file_get_contents("php://input"));
    if (!$data || !isset($data->ride_id)) {
        echo json_encode(["error" => "Missing ride_id."]);
        exit();
    }
    $stmt = $conn->prepare("UPDATE rides SET status = 'Deleted' WHERE ride_id = ?");
    $stmt->execute([$data->ride_id]);
    echo json_encode(["success" => true]);
    exit();
}

if ($method === 'POST' && $action === 'complete_ride') {
    $data = json_decode(file_get_contents("php://input"));
    if (!$data || !isset($data->ride_id)) {
        echo json_encode(["error" => "Missing ride_id."]);
        exit();
    }
    $stmt = $conn->prepare("UPDATE rides SET status = 'Completed' WHERE ride_id = ?");
    $stmt->execute([$data->ride_id]);
    echo json_encode(["success" => true]);
    exit();
}

// ======================== MY BOOKINGS ========================

if ($method === 'GET' && $action === 'my_bookings') {
    $user_id = $_GET['user_id'] ?? null;
    if (!$user_id) {
        echo json_encode(["error" => "User ID required"]);
        exit();
    }

    // Rides I CREATED as a driver
    $driverStmt = $conn->prepare("
        SELECT r.ride_id, r.start_location, r.end_location, r.distance_km, r.start_time, 
               r.calculated_cost_per_seat, r.status, r.created_at,
               u.name as driver_name, v.model as vehicle_model, v.capacity,
               'driver' as user_role,
               (SELECT COUNT(*) FROM ride_requests WHERE ride_id = r.ride_id AND status = 'accepted') as confirmed_riders
        FROM rides r
        JOIN users u ON r.driver_id = u.user_id
        JOIN vehicles v ON r.vehicle_id = v.vehicle_id
        WHERE r.driver_id = ? AND r.status != 'Deleted'
        ORDER BY r.start_time DESC
    ");
    $driverStmt->execute([$user_id]);
    $driverRides = $driverStmt->fetchAll(PDO::FETCH_ASSOC);

    // Rides I REQUESTED as a passenger
    $passengerStmt = $conn->prepare("
        SELECT r.ride_id, r.start_location, r.end_location, r.distance_km, r.start_time, 
               r.calculated_cost_per_seat, r.status, r.created_at,
               u.name as driver_name, v.model as vehicle_model, v.capacity,
               'passenger' as user_role,
               req.status as passenger_status
        FROM ride_requests req
        JOIN rides r ON req.ride_id = r.ride_id
        JOIN users u ON r.driver_id = u.user_id
        JOIN vehicles v ON r.vehicle_id = v.vehicle_id
        WHERE req.passenger_id = ? AND r.status != 'Deleted'
        ORDER BY r.start_time DESC
    ");
    $passengerStmt->execute([$user_id]);
    $passengerRides = $passengerStmt->fetchAll(PDO::FETCH_ASSOC);

    // Split into upcoming / past
    $now = new DateTime();
    $driver_upcoming = [];
    $driver_past = [];
    $passenger_upcoming = [];
    $passenger_past = [];

    foreach ($driverRides as $r) {
        $ride_time = new DateTime($r['start_time']);
        if ($r['status'] === 'Completed' || $ride_time < $now) {
            $driver_past[] = $r;
        } else {
            $driver_upcoming[] = $r;
        }
    }

    foreach ($passengerRides as $r) {
        $ride_time = new DateTime($r['start_time']);
        if ($r['status'] === 'Completed' || $ride_time < $now) {
            $passenger_past[] = $r;
        } else {
            $passenger_upcoming[] = $r;
        }
    }

    echo json_encode([
        "driver" => ["upcoming" => $driver_upcoming, "past" => $driver_past],
        "passenger" => ["upcoming" => $passenger_upcoming, "past" => $passenger_past]
    ]);
    exit();
}

// ======================== PROFILE ========================

if ($method === 'POST' && $action === 'update_profile') {
    $data = json_decode(file_get_contents("php://input"));
    if (!$data || !isset($data->id)) {
        echo json_encode(["error" => "User ID required"]);
        exit();
    }

    $stmt = $conn->prepare("UPDATE users SET name = ?, phone = ?, bio = ? WHERE user_id = ?");
    $stmt->execute([
        $data->name ?? '',
        $data->phone ?? '',
        $data->bio ?? '',
        $data->id
    ]);
    echo json_encode(["success" => true]);
    exit();
}

if ($method === 'POST' && $action === 'delete_account') {
    $data = json_decode(file_get_contents("php://input"));
    if (!$data || !isset($data->id)) {
        echo json_encode(["error" => "User ID required"]);
        exit();
    }

    // ON DELETE CASCADE handles all related records automatically
    $conn->prepare("DELETE FROM users WHERE user_id = ?")->execute([$data->id]);

    echo json_encode(["success" => true]);
    exit();
}

// ======================== USER VEHICLES ========================

if ($method === 'GET' && $action === 'user_vehicles') {
    $user_id = $_GET['user_id'] ?? null;
    if (!$user_id) {
        echo json_encode(["error" => "User ID required"]);
        exit();
    }
    $stmt = $conn->prepare("SELECT * FROM vehicles WHERE owner_id = ? ORDER BY vehicle_id DESC LIMIT 1");
    $stmt->execute([$user_id]);
    $vehicle = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($vehicle ?: null);
    exit();
}

echo json_encode(["error" => "Unknown action: $action"]);
?>