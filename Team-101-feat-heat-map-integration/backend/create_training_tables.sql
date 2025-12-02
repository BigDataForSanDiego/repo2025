-- Create training sessions table (available trainings for all)
CREATE TABLE IF NOT EXISTS training_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    training_date TIMESTAMP NOT NULL,
    created_by_admin BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_admin) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_training_date (training_date)
);

-- Create training registrations table (participant enrollments)
CREATE TABLE IF NOT EXISTS training_registrations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    participant_id BIGINT NOT NULL,
    training_session_id BIGINT NOT NULL,
    status ENUM('REGISTERED', 'ATTENDED', 'COMPLETED', 'CANCELLED') DEFAULT 'REGISTERED',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
    FOREIGN KEY (training_session_id) REFERENCES training_sessions(id) ON DELETE CASCADE,
    INDEX idx_participant (participant_id),
    INDEX idx_session (training_session_id),
    UNIQUE KEY unique_registration (participant_id, training_session_id)
);

-- Insert sample training sessions (available for all participants)
INSERT INTO training_sessions (title, description, location, training_date, created_by_admin) VALUES
('Dishwashing & Kitchen Prep', 'Learn professional dishwashing and basic food prep skills', 'Downtown Restaurant', '2025-02-10 09:00:00', 1),
('Warehouse Packing Skills', 'Learn to pack boxes, use packing materials, and organize shipments', 'Logistics Center', '2025-02-15 10:00:00', 1),
('Housekeeping Basics', 'Professional cleaning techniques for hotels and offices', 'Training Center', '2025-02-20 14:00:00', 1),
('Grocery Store Stocking', 'Learn shelf organization, product rotation, and inventory basics', 'Local Supermarket', '2025-02-25 08:00:00', 1),
('Basic Carpentry Skills', 'Introduction to hand tools and simple woodworking projects', 'Community Workshop', '2025-03-01 13:00:00', 1);
