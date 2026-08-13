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

    // Auto-migrate columns if missing
    try {
        $conn->query("SELECT saved_places FROM users LIMIT 1");
    } catch (PDOException $ex) {
        $conn->exec("ALTER TABLE users ADD COLUMN saved_places LONGTEXT DEFAULT NULL");
    }

    try {
        $conn->query("SELECT upi_id FROM users LIMIT 1");
    } catch (PDOException $ex) {
        $conn->exec("ALTER TABLE users ADD COLUMN upi_id VARCHAR(100) DEFAULT NULL, ADD COLUMN department VARCHAR(100) DEFAULT NULL");
    }

    try {
        $conn->query("SELECT notification_id FROM notifications LIMIT 1");
    } catch (PDOException $ex) {
        $conn->exec("
            CREATE TABLE IF NOT EXISTS notifications (
                notification_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'info',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ");
    }
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

    echo json_encode(["id" => $user_id, "name" => $data->name, "email" => $data->email, "saved_places" => "[]"]);
    exit();
}

if ($method === 'POST' && $action === 'login') {
    $data = json_decode(file_get_contents("php://input"));
    if (!$data || !isset($data->email, $data->password)) {
        echo json_encode(["error" => "Invalid payload"]);
        exit();
    }

    $stmt = $conn->prepare("SELECT user_id as id, name, email, phone, bio, upi_id, department, saved_places, password_hash FROM users WHERE email = ?");
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

// ======================== SAVED PLACES ========================

if ($method === 'GET' && $action === 'get_saved_places') {
    $userId = $_GET['user_id'] ?? null;
    $userEmail = $_GET['email'] ?? null;

    if (!$userId && !$userEmail) {
        echo json_encode([]);
        exit();
    }

    if ($userId) {
        $stmt = $conn->prepare("SELECT saved_places FROM users WHERE user_id = ?");
        $stmt->execute([$userId]);
    } else {
        $stmt = $conn->prepare("SELECT saved_places FROM users WHERE email = ?");
        $stmt->execute([$userEmail]);
    }

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $places = ($row && !empty($row['saved_places'])) ? json_decode($row['saved_places'], true) : [];
    echo json_encode(is_array($places) ? $places : []);
    exit();
}

if ($method === 'POST' && $action === 'update_saved_places') {
    $data = json_decode(file_get_contents("php://input"));
    if (!$data || (!isset($data->user_id) && !isset($data->email)) || !isset($data->saved_places)) {
        echo json_encode(["error" => "Invalid payload"]);
        exit();
    }

    $jsonStr = json_encode($data->saved_places);

    if (isset($data->user_id) && $data->user_id) {
        $stmt = $conn->prepare("UPDATE users SET saved_places = ? WHERE user_id = ?");
        $stmt->execute([$jsonStr, $data->user_id]);
    } else {
        $stmt = $conn->prepare("UPDATE users SET saved_places = ? WHERE email = ?");
        $stmt->execute([$jsonStr, $data->email]);
    }

    echo json_encode(["status" => "success", "saved_places" => $data->saved_places]);
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

    // Dispatch notification to driver
    try {
        $rideStmt = $conn->prepare("
            SELECT r.driver_id, r.start_location, r.end_location, u.name as passenger_name 
            FROM rides r, users u 
            WHERE r.ride_id = ? AND u.user_id = ?
        ");
        $rideStmt->execute([$data->ride_id, $data->passenger_id]);
        $info = $rideStmt->fetch(PDO::FETCH_ASSOC);
        if ($info && $info['driver_id'] != $data->passenger_id) {
            $nStmt = $conn->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'seat_request')");
            $nStmt->execute([
                $info['driver_id'],
                "New Seat Request 🚗",
                "{$info['passenger_name']} requested a seat on your ride from {$info['start_location']} to {$info['end_location']}."
            ]);
        }
    } catch (Exception $e) {}

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

    // Dispatch notification to passenger
    try {
        $pStmt = $conn->prepare("
            SELECT req.passenger_id, u.name as driver_name, r.start_location, r.end_location 
            FROM ride_requests req 
            JOIN rides r ON req.ride_id = r.ride_id 
            JOIN users u ON r.driver_id = u.user_id 
            JOIN users p ON req.passenger_id = p.user_id 
            WHERE req.ride_id = ? AND p.email = ?
        ");
        $pStmt->execute([$data->ride_id, $data->passenger_email]);
        $pInfo = $pStmt->fetch(PDO::FETCH_ASSOC);
        if ($pInfo) {
            $statusText = $data->response_status === 'accepted' ? 'accepted 🎉' : 'declined ❌';
            $nType = $data->response_status === 'accepted' ? 'request_accepted' : 'request_declined';
            $nStmt = $conn->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)");
            $nStmt->execute([
                $pInfo['passenger_id'],
                "Seat Request " . ucfirst($data->response_status),
                "Driver {$pInfo['driver_name']} {$statusText} your seat request for {$pInfo['start_location']} to {$pInfo['end_location']}.",
                $nType
            ]);
        }
    } catch (Exception $e) {}

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

    // 1. Get request_id for this ride & passenger
    $reqStmt = $conn->prepare("
        SELECT req.request_id 
        FROM ride_requests req 
        JOIN users u ON req.passenger_id = u.user_id 
        WHERE req.ride_id = ? AND u.email = ?
    ");
    $reqStmt->execute([$data->ride_id, $data->passenger_email]);
    $req = $reqStmt->fetch(PDO::FETCH_ASSOC);

    if (!$req) {
        echo json_encode(["error" => "Seat request not found."]);
        exit();
    }

    // 2. Insert message into messages table
    $msgStmt = $conn->prepare("INSERT INTO messages (request_id, sender_id, text) VALUES (?, ?, ?)");
    $msgStmt->execute([$req['request_id'], $data->sender_id, $data->text]);

    // 3. Dispatch notification to recipient
    try {
        $recStmt = $conn->prepare("
            SELECT r.driver_id, req.passenger_id, u.name as sender_name 
            FROM ride_requests req 
            JOIN rides r ON req.ride_id = r.ride_id 
            JOIN users u ON u.user_id = ?
            WHERE req.request_id = ?
        ");
        $recStmt->execute([$data->sender_id, $req['request_id']]);
        $rec = $recStmt->fetch(PDO::FETCH_ASSOC);

        if ($rec) {
            $recipient_id = ($data->sender_id == $rec['driver_id']) ? $rec['passenger_id'] : $rec['driver_id'];
            $nStmt = $conn->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'chat')");
            $nStmt->execute([
                $recipient_id,
                "New Message from {$rec['sender_name']} 💬",
                mb_strimwidth($data->text, 0, 80, '...')
            ]);
        }
    } catch (Exception $e) {}

    echo json_encode(["success" => true]);
    exit();
}

// ======================== NOTIFICATIONS ========================

if ($method === 'GET' && $action === 'get_notifications') {
    $user_id = $_GET['user_id'] ?? null;
    if (!$user_id) {
        echo json_encode(["notifications" => [], "unread_count" => 0]);
        exit();
    }
    $stmt = $conn->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30");
    $stmt->execute([$user_id]);
    $list = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $unreadCount = 0;
    foreach ($list as $n) {
        if (!$n['is_read']) $unreadCount++;
    }

    echo json_encode(["notifications" => $list, "unread_count" => $unreadCount]);
    exit();
}

if ($method === 'POST' && $action === 'mark_notifications_read') {
    $data = json_decode(file_get_contents("php://input"));
    if (!$data || !isset($data->user_id)) {
        echo json_encode(["error" => "User ID required"]);
        exit();
    }
    $stmt = $conn->prepare("UPDATE notifications SET is_read = TRUE WHERE user_id = ?");
    $stmt->execute([$data->user_id]);
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

// ======================== ECO IMPACT (CO2) ========================

if ($method === 'GET' && $action === 'get_co2_impact') {
    $user_id = $_GET['user_id'] ?? null;
    $email = $_GET['email'] ?? null;

    if (!$user_id && $email) {
        $uStmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
        $uStmt->execute([$email]);
        $uRow = $uStmt->fetch(PDO::FETCH_ASSOC);
        if ($uRow) $user_id = $uRow['user_id'];
    }

    if (!$user_id) {
        echo json_encode(["co2_kg" => 0.0, "total_km" => 0.0, "trees" => 0.0]);
        exit();
    }

    $totalCO2 = 0.0;
    $totalKm = 0.0;

    // Driver rides CO2 savings ONLY when passengers are accepted on the ride
    $driverStmt = $conn->prepare("
        SELECT r.distance_km, COALESCE(v.mileage, 18.0) as mileage, COALESCE(v.fuel_type, 'Petrol') as fuel_type,
               (SELECT COUNT(*) FROM ride_requests WHERE ride_id = r.ride_id AND status = 'accepted') as accepted_riders
        FROM rides r
        LEFT JOIN vehicles v ON r.vehicle_id = v.vehicle_id
        WHERE r.driver_id = ? AND r.status != 'Deleted'
    ");
    $driverStmt->execute([$user_id]);
    $driverRides = $driverStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($driverRides as $dr) {
        $km = floatval($dr['distance_km'] ?: 0);
        $mileage = floatval($dr['mileage'] > 0 ? $dr['mileage'] : 18.0);
        $riders = intval($dr['accepted_riders']);

        if ($riders > 0) {
            $fuelType = strtolower($dr['fuel_type'] ?: 'petrol');
            $emissionFactor = 2.31; // Petrol (kg CO2 per liter)
            if ($fuelType === 'diesel') $emissionFactor = 2.68;
            if ($fuelType === 'electric') $emissionFactor = 0.05;

            $co2PerTrip = ($km / $mileage) * $emissionFactor;
            // Each accepted passenger prevented 1 solo car trip
            $totalCO2 += ($riders * $co2PerTrip);
            $totalKm += ($km * $riders);
        }
    }

    // Passenger rides CO2 savings ONLY when request is accepted
    $passStmt = $conn->prepare("
        SELECT r.distance_km, COALESCE(v.mileage, 18.0) as mileage, COALESCE(v.fuel_type, 'Petrol') as fuel_type
        FROM ride_requests req
        JOIN rides r ON req.ride_id = r.ride_id
        LEFT JOIN vehicles v ON r.vehicle_id = v.vehicle_id
        WHERE req.passenger_id = ? AND req.status = 'accepted' AND r.status != 'Deleted'
    ");
    $passStmt->execute([$user_id]);
    $passengerRides = $passStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($passengerRides as $pr) {
        $km = floatval($pr['distance_km'] ?: 0);
        $mileage = floatval($pr['mileage'] > 0 ? $pr['mileage'] : 18.0);
        $fuelType = strtolower($pr['fuel_type'] ?: 'petrol');

        $emissionFactor = 2.31;
        if ($fuelType === 'diesel') $emissionFactor = 2.68;
        if ($fuelType === 'electric') $emissionFactor = 0.05;

        $totalCO2 += (($km / $mileage) * $emissionFactor);
        $totalKm += $km;
    }

    $co2Kg = round($totalCO2, 1);
    $trees = round($co2Kg / 20.0, 1);

    echo json_encode([
        "co2_kg" => $co2Kg,
        "total_km" => round($totalKm, 1),
        "trees" => $trees
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

    $stmt = $conn->prepare("UPDATE users SET name = ?, phone = ?, bio = ?, upi_id = ?, department = ? WHERE user_id = ?");
    $stmt->execute([
        $data->name ?? '',
        $data->phone ?? '',
        $data->bio ?? '',
        $data->upi_id ?? '',
        $data->department ?? '',
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