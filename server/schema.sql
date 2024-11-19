-- Create the 'regym' database
CREATE DATABASE regym;

-- Use the 'regym' database
USE regym;

-- Create the 'users' table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,         -- Unique user ID
    name VARCHAR(255),                         -- User's first name
    surnames VARCHAR(255),                     -- User's last name
    email VARCHAR(255) UNIQUE NOT NULL,        -- User's email, must be unique and not null
    password VARCHAR(255)                      -- User's password (hashed for security)
);

INSERT INTO users (name, surnames, email, password) 
    VALUES ('Daniel', 'Borge Puga', 'danielborgepuga@gmail.com', 'passReGym');

-- Create the 'sessions' table
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,         -- Unique session ID
    user_id INT,                               -- Foreign key to the 'users' table
    session_date DATE NOT NULL,                -- Date of the session
    start_time TIME NOT NULL,                  -- Session start time
    end_time TIME NOT NULL,                    -- Session end time
    duration TIME AS (TIMEDIFF(end_time, start_time)), -- Duration of session calculated automatically
    FOREIGN KEY (user_id) REFERENCES users(id) -- Establishing relationship with 'users' table
);

INSERT INTO sessions (user_id, session_date, start_time, end_time) 
    VALUES (1, CURDATE(), '10:00:00', '11:30:00');

-- Create the 'exercise' table
CREATE TABLE exercise (
    id INT AUTO_INCREMENT PRIMARY KEY,          -- Unique exercise ID
    session_id INT,                             -- Foreign key to the 'sessions' table
    exercise_name VARCHAR(255) NOT NULL,        -- Name of the exercise (e.g., bench press, squat)
    start_time TIME NOT NULL,                   -- Start time of the exercise
    end_time TIME NOT NULL,                     -- End time of the exercise
    duration TIME AS (TIMEDIFF(end_time, start_time)), -- Duration of the exercise (auto-calculated)
    FOREIGN KEY (session_id) REFERENCES sessions(id)   -- Foreign key relationship with 'sessions' table
);

INSERT INTO exercise (session_id, exercise_name, start_time, end_time) 
    VALUES (1, 'Press Banca', '10:00:00', '11:30:00');

-- Create the 'sets' table
CREATE TABLE sets (
    id INT AUTO_INCREMENT PRIMARY KEY,      -- Unique set ID
    exercise_id INT,                        -- Foreign key to the 'exercise' table
    set_number INT NOT NULL,                -- Set number (e.g., 1, 2, 3)
    weight DECIMAL(5,2) NOT NULL,           -- Weight used for the set (with two decimal places, e.g., 100.50 kg)
    reps INT NOT NULL,                      -- Number of repetitions in the set
    FOREIGN KEY (exercise_id) REFERENCES exercise(id) -- Foreign key relationship with 'exercise' table
);

INSERT INTO sets (exercise_id, set_number, weight, reps) 
    VALUES 
    (1, 1, 100.00, 10),
    (1, 2, 100.00, 8),
    (1, 3, 90.00, 8);

