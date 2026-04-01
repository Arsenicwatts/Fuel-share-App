CREATE DATABASE IF NOT EXISTS fuelshare_db;
USE fuelshare_db;

-- Users Table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_driver BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles Table
CREATE TABLE vehicles (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    model VARCHAR(100) NOT NULL,
    mileage FLOAT NOT NULL, -- km/l
    capacity INT NOT NULL,
    fuel_type ENUM('Petrol', 'Diesel', 'Electric') DEFAULT 'Petrol',
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Rides Table
CREATE TABLE rides (
    ride_id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    start_location VARCHAR(255) NOT NULL,
    end_location VARCHAR(255) NOT NULL,
    distance_km FLOAT NOT NULL,
    start_time DATETIME NOT NULL,
    base_fuel_price FLOAT NOT NULL,
    calculated_cost_per_seat FLOAT NOT NULL,
    status ENUM('Open', 'Full', 'Completed', 'Deleted') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE
);

-- Ride Requests Table
CREATE TABLE ride_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    ride_id INT NOT NULL,
    passenger_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(ride_id) ON DELETE CASCADE,
    FOREIGN KEY (passenger_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_request (ride_id, passenger_id)
);

-- Messages Table for Chat in Requests
CREATE TABLE messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    sender_id INT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES ride_requests(request_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Note: To automatically delete completed or deleted rides after 10 minutes,
-- MySQL's Event Scheduler must be ON. You can turn it on by running:
-- SET GLOBAL event_scheduler = ON;

DELIMITER //

CREATE EVENT IF NOT EXISTS clean_old_rides
ON SCHEDULE EVERY 5 MINUTE
DO
BEGIN
    -- Delete rides that have been Marked as 'Completed' or 'Deleted' for more than 10 minutes
    DELETE FROM rides 
    WHERE status IN ('Completed', 'Deleted') 
    AND updated_at < (NOW() - INTERVAL 10 MINUTE);
END//

DELIMITER ;