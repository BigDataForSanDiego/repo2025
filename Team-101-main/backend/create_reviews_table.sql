CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    participant_id BIGINT NOT NULL,
    employer_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
    FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE,
    INDEX idx_reviews_participant (participant_id),
    INDEX idx_reviews_employer (employer_id)
);
