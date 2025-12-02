import base64
import json
import cv2
import numpy as np
import tempfile
import os
from deepface import DeepFace
from typing import Optional, Tuple

def decode_base64_image(face_image_b64: str) -> np.ndarray:
    """Decode base64 image to numpy array"""
    if ',' in face_image_b64:
        image_data = base64.b64decode(face_image_b64.split(',')[1])
    else:
        image_data = base64.b64decode(face_image_b64)
    
    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Invalid image data")
    return img

def encode_face(face_image_b64: str) -> str:
    """Store base64 image directly for DeepFace verification"""
    # Validate image can be decoded
    img = decode_base64_image(face_image_b64)
    
    # Test that face can be detected
    try:
        DeepFace.represent(img, model_name="Facenet512", enforce_detection=True)
    except:
        raise ValueError("No face detected in image")
    
    # Store base64 directly
    return json.dumps({"image": face_image_b64, "model": "Facenet512"})

def verify_face(face_image_b64: str, stored_encoding: str) -> Tuple[bool, float]:
    """Verify face using DeepFace.verify"""
    try:
        stored_data = json.loads(stored_encoding)
        stored_image_b64 = stored_data.get("image")
        
        if not stored_image_b64:
            return False, 1.0
        
        # Decode both images
        img1 = decode_base64_image(face_image_b64)
        img2 = decode_base64_image(stored_image_b64)
        
        # Save to temp files for DeepFace
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as f1:
            cv2.imwrite(f1.name, img1)
            temp1 = f1.name
        
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as f2:
            cv2.imwrite(f2.name, img2)
            temp2 = f2.name
        
        try:
            # Use DeepFace verify
            result = DeepFace.verify(temp1, temp2, model_name="Facenet512", enforce_detection=False)
            verified = result["verified"]
            distance = result["distance"]
            return verified, distance
        finally:
            os.unlink(temp1)
            os.unlink(temp2)
            
    except Exception as e:
        print(f"Verify error: {e}")
        return False, 1.0

def capture_and_verify_face(reference_encoding: str, max_attempts: int = 100) -> Tuple[bool, Optional[str]]:
    """Capture face from webcam and verify against reference"""
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        return False, "Could not open webcam"
    
    attempts = 0
    verify_count = 0
    
    while attempts < max_attempts:
        ret, frame = cap.read()
        if not ret:
            break
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        for (x, y, w, h) in faces:
            face_region = frame[y:y+h, x:x+w]
            
            try:
                # Encode face region to base64
                _, buffer = cv2.imencode('.jpg', face_region)
                face_b64 = base64.b64encode(buffer).decode('utf-8')
                
                # Verify against reference
                verified, distance = verify_face(face_b64, reference_encoding)
                
                if verified:
                    verify_count += 1
                    if verify_count >= VERIFY_THRESHOLD:
                        cap.release()
                        cv2.destroyAllWindows()
                        return True, "Face verified successfully"
                else:
                    verify_count = 0
            except Exception as e:
                print(f"Verification error: {e}")
            
            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
        
        cv2.imshow('Face Verification', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        
        attempts += 1
    
    cap.release()
    cv2.destroyAllWindows()
    return False, "Face not recognized"
