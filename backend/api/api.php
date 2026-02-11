<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$host = 'localhost';
$db = 'fuelshare_db';
$user = 'root';
$pass = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die(json_encode(["error" => "DB Connection Failed"]));
}

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get_rides') {
    $stmt = $conn->prepare("
        SELECT r.*, u.name as driver_name, v.model as vehicle_model 
        FROM rides r 
        JOIN users u ON r.driver_id = u.user_id 
        JOIN vehicles v ON r.vehicle_id = v.vehicle_id
        WHERE r.status = 'Open'
    ");
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'create_ride') {
    $data = json_decode(file_get_contents("php://input"));
    
    // Path to your python script
    $pythonPath = "C:\\xampp\\htdocs\\fuelshare-backend\\scripts\\fuel_engine.py"; 
    $cmd = "python \"$pythonPath\" --distance {$data->distance} --mileage {$data->mileage} --capacity {$data->capacity}";
    
    $output = shell_exec($cmd);
    $logic = json_decode($output);

    if($logic) {
        $sql = "INSERT INTO rides (driver_id, vehicle_id, start_location, end_location, distance_km, start_time, base_fuel_price, calculated_cost_per_seat) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $data->driver_id, $data->vehicle_id, $data->start_location, $data->end_location, 
            $data->distance, $data->start_time, $logic->fuel_price, $logic->cost_per_seat
        ]);
        echo json_encode(["message" => "Ride Created", "cost" => $logic->cost_per_seat]);
    } else {
        echo json_encode(["error" => "Calculation Failed"]);
    }
}
?>