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

    $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
    $stmt->execute([$data->email]);
    if ($stmt->fetch()) {
        echo json_encode(["error" => "An account with this email already exists!"]);
        exit();
    }

    $stmt = $conn->prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)");
    $stmt->execute([$data->name, $data->email, $data->password]);
    $user_id = $conn->lastInsertId();

    echo json_encode(["id" => $user_id, "name" => $data->name, "email" => $data->email]);
    exit();
}

if ($method === 'POST' && $action === 'login') {
    $data = json_decode(file_get_contents("php://input"));
    $stmt = $conn->prepare("SELECT user_id as id, name, email, phone, bio FROM users WHERE email = ? AND password_hash = ?");
    $stmt->execute([$data->email, $data->password]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo json_encode($user);
    } else {
        echo json_encode(["error" => "Invalid email or password."]);
    }
    exit();
}

// ======================== RIDES ========================

if ($method === 'GET' && $action === 'get_rides') {
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

    foreach ($rides as &$ride) {
        $reqStmt = $conn->prepare("
            SELECT req.request_id, req.status, u.email, u.name 
            FROM ride_requests req
            JOIN users u ON req.passenger_id = u.user_id
            WHERE req.ride_id = ?
        ");
        $reqStmt->execute([$ride['ride_id']]);
        $requests = $reqStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($requests as &$req) {
            $chatStmt = $conn->prepare("
                SELECT m.text, m.created_at as timestamp, u.email as sender, u.name as senderName
                FROM messages m
                JOIN users u ON m.sender_id = u.user_id
                WHERE m.request_id = ?
                ORDER BY m.created_at ASC
            ");
            $chatStmt->execute([$req['request_id']]);
            $req['chat'] = $chatStmt->fetchAll(PDO::FETCH_ASSOC);
        }
        $ride['requests'] = $requests;

        $accepted = count(array_filter($requests, fn($r) => $r['status'] === 'accepted'));
        $ride['available_seats'] = max(0, $ride['available_seats'] - $accepted);
    }

    echo json_encode($rides);
    exit();
}

if ($method === 'POST' && $action === 'create_ride') {
    $data = json_decode(file_get_contents("php://input"));

    $stmt = $conn->prepare("SELECT vehicle_id FROM vehicles WHERE owner_id = ? AND model = ?");
    $stmt->execute([$data->driver_id, $data->model]);
    $vehicle = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($vehicle) {
        $vehicle_id = $vehicle['vehicle_id'];
    } else {
        $stmt = $conn->prepare("INSERT INTO vehicles (owner_id, model, mileage, capacity) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data->driver_id, $data->model, $data->mileage, $data->capacity]);
        $vehicle_id = $conn->lastInsertId();
    }

    $sql = "INSERT INTO rides (driver_id, vehicle_id, start_location, end_location, distance_km, start_time, base_fuel_price, calculated_cost_per_seat) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        $data->driver_id,
        $vehicle_id,
        $data->start_location,
        $data->end_location,
        $data->distance,
        $data->start_time,
        96.72,
        $data->cost_per_seat
    ]);

    $ride_id = $conn->lastInsertId();
    echo json_encode(["message" => "Ride Created", "ride_id" => $ride_id]);
    exit();
}

// ======================== SEAT REQUESTS ========================

if ($method === 'POST' && $action === 'request_seat') {
    $data = json_decode(file_get_contents("php://input"));
    $stmt = $conn->prepare("INSERT IGNORE INTO ride_requests (ride_id, passenger_id) VALUES (?, ?)");
    $stmt->execute([$data->ride_id, $data->passenger_id]);
    echo json_encode(["success" => true]);
    exit();
}

if ($method === 'POST' && $action === 'cancel_request') {
    $data = json_decode(file_get_contents("php://input"));
    $stmt = $conn->prepare("DELETE FROM ride_requests WHERE ride_id = ? AND passenger_id = ?");
    $stmt->execute([$data->ride_id, $data->passenger_id]);
    echo json_encode(["success" => true, "deleted" => $stmt->rowCount()]);
    exit();
}

if ($method === 'POST' && $action === 'respond_request') {
    $data = json_decode(file_get_contents("php://input"));
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
    $stmt = $conn->prepare("UPDATE rides SET status = 'Deleted' WHERE ride_id = ?");
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

    // Delete in order: messages -> ride_requests -> rides -> vehicles -> user
    $conn->prepare("DELETE m FROM messages m JOIN ride_requests req ON m.request_id = req.request_id WHERE req.passenger_id = ?")->execute([$data->id]);
    $conn->prepare("DELETE m FROM messages m JOIN ride_requests req ON m.request_id = req.request_id JOIN rides r ON req.ride_id = r.ride_id WHERE r.driver_id = ?")->execute([$data->id]);
    $conn->prepare("DELETE FROM ride_requests WHERE passenger_id = ?")->execute([$data->id]);
    $conn->prepare("DELETE req FROM ride_requests req JOIN rides r ON req.ride_id = r.ride_id WHERE r.driver_id = ?")->execute([$data->id]);
    $conn->prepare("DELETE FROM rides WHERE driver_id = ?")->execute([$data->id]);
    $conn->prepare("DELETE FROM vehicles WHERE owner_id = ?")->execute([$data->id]);
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