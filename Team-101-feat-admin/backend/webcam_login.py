import cv2
import base64
import requests
from deepface import DeepFace
import numpy as np

API_URL = "http://localhost:8000/auth/login"
DISTANCE_THRESHOLD = 0.4
VERIFY_THRESHOLD = 3
MAX_ATTEMPTS = 100

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def capture_face_and_login():
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return
    
    print("Press 'q' to quit or 'c' to capture and login")
    
    attempts = 0
    verify_count = 0
    
    while attempts < MAX_ATTEMPTS:
        ret, frame = cap.read()
        
        if not ret:
            print("Error: Failed to capture image")
            break
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            cv2.putText(frame, f"Attempts: {verify_count}/{VERIFY_THRESHOLD}", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        cv2.imshow('Face Login - Press C to capture', frame)
        
        key = cv2.waitKey(1) & 0xFF
        
        if key == ord('q'):
            break
        elif key == ord('c') and len(faces) > 0:
            # Capture face and attempt login
            x, y, w, h = faces[0]
            face_region = frame[y:y+h, x:x+w]
            
            # Encode to base64
            _, buffer = cv2.imencode('.jpg', face_region)
            face_b64 = base64.b64encode(buffer).decode('utf-8')
            
            # Send to API
            try:
                response = requests.post(API_URL, json={"face_image": face_b64})
                result = response.json()
                
                if result.get("success"):
                    print(f"\n✓ {result.get('message')}")
                    print(f"Participant: {result['participant']['display_name']}")
                    cap.release()
                    cv2.destroyAllWindows()
                    return
                else:
                    verify_count += 1
                    print(f"✗ Attempt {verify_count}: {result.get('message')}")
                    
                    if verify_count >= MAX_ATTEMPTS:
                        print("\nMax attempts reached. Please use QR code login.")
                        break
            except Exception as e:
                print(f"Error: {e}")
        
        attempts += 1
    
    cap.release()
    cv2.destroyAllWindows()
    print("\nLogin cancelled or failed.")

if __name__ == "__main__":
    capture_face_and_login()
