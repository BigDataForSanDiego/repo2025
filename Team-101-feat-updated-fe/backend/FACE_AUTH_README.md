# Face Authentication Integration Guide

## Overview
This integration adds facial recognition capabilities to the ReLink platform using DeepFace and OpenCV, enabling participants to register and login using their face as a biometric identifier.

## Architecture

### Components
1. **face_recognition.py** - Core facial recognition service
   - `encode_face()` - Extracts face embeddings using DeepFace Facenet model
   - `verify_face()` - Compares face against stored encoding
   - `capture_and_verify_face()` - Webcam capture with live verification

2. **routers/auth.py** - Updated authentication endpoints
   - `/auth/register` - Register participant with optional face encoding
   - `/auth/login` - Login via QR code or face recognition

3. **Demo Scripts**
   - `face_auth_demo.py` - Interactive registration/login demo
   - `webcam_login.py` - Standalone webcam login client

## Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Note: First run will download DeepFace models (~100MB)
```

## Database Schema
The `participants` table already includes:
```sql
face_encoding TEXT NULL  -- Stores JSON with face embedding vector
```

## API Usage

### Register Participant with Face
```python
POST /auth/register
{
  "org_id": 1,
  "display_name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "preferred_contact": "SMS",
  "face_image": "base64_encoded_image_data"
}
```

### Login with Face
```python
POST /auth/login
{
  "face_image": "base64_encoded_image_data"
}
```

### Login with QR Code
```python
POST /auth/login
{
  "qr_uid": "participant_qr_code"
}
```

## Configuration

Edit `face_recognition.py` to adjust:
```python
DISTANCE_THRESHOLD = 0.4  # Lower = stricter matching (0.0-1.0)
VERIFY_THRESHOLD = 3      # Consecutive verifications needed
```

## Testing

### Run Demo Script
```bash
python face_auth_demo.py
```

### Run Webcam Login
```bash
python webcam_login.py
```

### Manual Testing
```python
import requests
import base64

# Capture face image
with open("test_face.jpg", "rb") as f:
    face_b64 = base64.b64encode(f.read()).decode()

# Register
response = requests.post("http://localhost:8000/auth/register", json={
    "org_id": 1,
    "display_name": "Test User",
    "face_image": face_b64
})

# Login
response = requests.post("http://localhost:8000/auth/login", json={
    "face_image": face_b64
})
```

## Security Considerations

### Current Implementation
- Face embeddings stored as JSON in database
- Uses Facenet model (128-dimensional embeddings)
- Euclidean distance for similarity matching
- No liveness detection (anti-spoofing)

### Production Enhancements Needed
1. **Anti-Spoofing**: Add liveness detection to prevent photo attacks
2. **Encryption**: Encrypt face_encoding column at rest
3. **Rate Limiting**: Limit login attempts per IP
4. **Audit Logging**: Log all face authentication attempts
5. **Multi-Factor**: Combine face + PIN for high-security operations
6. **Privacy**: Add consent management and data retention policies

## Integration with Your Code

Your original code can be adapted as follows:

```python
from app.face_recognition import encode_face, verify_face

# During registration
face_encoding = encode_face(face_image_b64)
participant.face_encoding = face_encoding

# During login
for participant in participants:
    verified, distance = verify_face(login_face_b64, participant.face_encoding)
    if verified:
        # Login successful
        break
```

## Troubleshooting

### Webcam Not Opening
- Check camera permissions
- Ensure no other app is using the camera
- Try different camera index: `cv2.VideoCapture(1)`

### Face Not Detected
- Ensure good lighting
- Face camera directly
- Remove glasses/masks if needed
- Adjust `minNeighbors` parameter in cascade classifier

### Low Accuracy
- Increase `DISTANCE_THRESHOLD` for more lenient matching
- Ensure consistent lighting during registration and login
- Use higher quality camera
- Capture multiple angles during registration

### Performance Issues
- DeepFace downloads models on first run (~100MB)
- Face encoding takes 1-3 seconds per image
- Consider caching or async processing for production

## Future Enhancements

1. **Multiple Face Angles**: Store 3-5 face encodings per person
2. **Continuous Authentication**: Re-verify periodically during session
3. **Fallback Methods**: QR code → Face → PIN → Password
4. **Mobile Integration**: React Native camera component
5. **Edge Deployment**: Run face recognition on device for privacy
6. **Analytics Dashboard**: Track authentication success rates

## Support

For issues or questions:
- Check logs in console output
- Verify API is running: `http://localhost:8000/docs`
- Test with demo script first before integrating
