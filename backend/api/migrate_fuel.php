<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$host = 'localhost';
$db = 'fuelshare_db';
$user = 'root';
$pass = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Alter fuel_type to include CNG
    $sql = "ALTER TABLE vehicles MODIFY fuel_type ENUM('Petrol', 'Diesel', 'Electric', 'CNG') DEFAULT 'Petrol'";
    $conn->exec($sql);
    echo "Successfully updated fuel_type ENUM in vehicles table!\n";

} catch (PDOException $e) {
    echo "Connection or Execution failed: " . $e->getMessage() . "\n";
}
?>
