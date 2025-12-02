-- Update face_encoding column to LONGTEXT to store base64 images
ALTER TABLE participants MODIFY COLUMN face_encoding LONGTEXT;
