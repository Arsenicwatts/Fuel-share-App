<?php
$host = 'localhost';
$db = 'fuelshare_db';
$user = 'root';
$pass = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Add columns to users table
    $sql = "ALTER TABLE users ADD COLUMN failed_login_attempts INT DEFAULT 0, ADD COLUMN locked_until DATETIME DEFAULT NULL;";
    $conn->exec($sql);
    echo "Migration successful: Added failed_login_attempts and locked_until.\n";
} catch (PDOException $e) {
    if ($e->getCode() == '42S21') {
        echo "Columns already exist.\n";
    } else {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
?>
