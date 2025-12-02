from sqlalchemy import create_engine, text
from app.config import settings

engine = create_engine(settings.database_url)

sql = """
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    participant_id BIGINT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    employer_id BIGINT NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_participant FOREIGN KEY (participant_id) REFERENCES participants(id),
    CONSTRAINT fk_employer FOREIGN KEY (employer_id) REFERENCES employers(id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_participant ON reviews(participant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_employer ON reviews(employer_id);
"""

with engine.connect() as conn:
    conn.execute(text(sql))
    conn.commit()
    print("✅ Reviews table created successfully")
