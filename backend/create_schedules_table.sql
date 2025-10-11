-- Create professional_schedules table
-- Run this script in your MySQL database to add the schedule functionality

USE freelancing_appointments;

-- Create the professional_schedules table
CREATE TABLE IF NOT EXISTS professional_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    professional_id INT NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE,
    
    -- Unique constraint to ensure one schedule per day per professional
    UNIQUE KEY unique_professional_day (professional_id, day_of_week)
);

-- Add indexes for better performance
CREATE INDEX idx_professional_schedules_professional_id ON professional_schedules(professional_id);
CREATE INDEX idx_professional_schedules_day_of_week ON professional_schedules(day_of_week);
CREATE INDEX idx_professional_schedules_available ON professional_schedules(is_available);

-- Insert sample data (optional - uncomment if you want sample data)
/*
INSERT INTO professional_schedules (professional_id, day_of_week, start_time, end_time, is_available) VALUES
(1, 'monday', '09:00:00', '17:00:00', TRUE),
(1, 'tuesday', '09:00:00', '17:00:00', TRUE),
(1, 'wednesday', '09:00:00', '17:00:00', TRUE),
(1, 'thursday', '09:00:00', '17:00:00', TRUE),
(1, 'friday', '09:00:00', '17:00:00', TRUE),
(1, 'saturday', '10:00:00', '15:00:00', TRUE),
(1, 'sunday', '09:00:00', '17:00:00', FALSE);
*/

-- Verify the table was created
SELECT 'professional_schedules table created successfully!' as status;
SHOW TABLES LIKE 'professional_schedules';
DESCRIBE professional_schedules;
