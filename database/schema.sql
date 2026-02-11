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
    status ENUM('Open', 'Full', 'Completed') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES users(user_id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
);