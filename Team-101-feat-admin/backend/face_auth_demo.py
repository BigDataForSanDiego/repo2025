#!/usr/bin/env python3
"""
Face Authentication Demo for ReLink Platform
Demonstrates participant registration and login using facial recognition
"""

import cv2
import base64
import requests
import sys

API_BASE = "http://localhost:8000"
FACE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def capture_face_image():
    """Capture a face image from webcam"""
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open webcam")
        return None
    
    print("\nPosition your face in the frame and press SPACE to capture, Q to quit")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = FACE_CASCADE.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            cv2.putText(frame, "Face detected", (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        cv2.imshow('Capture Face - Press SPACE', frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord(' ') and len(faces) > 0:
            x, y, w, h = faces[0]
            face_img = frame[y:y+h, x:x+w]
            _, buffer = cv2.imencode('.jpg', face_img)
            face_b64 = base64.b64encode(buffer).decode('utf-8')
            cap.release()
            cv2.destroyAllWindows()
            return face_b64
        elif key == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    return None

def register_participant():
    """Register a new participant with face ID"""
    print("\n=== PARTICIPANT REGISTRATION ===")
    
    display_name = input("Enter participant name: ")
    org_id = int(input("Enter organization ID (default: 1): ") or "1")
    phone = input("Enter phone (optional): ") or None
    email = input("Enter email (optional): ") or None
    
    print("\nCapturing face for registration...")
    face_b64 = capture_face_image()
    
    if not face_b64:
        print("Face capture cancelled")
        return
    
    payload = {
        "org_id": org_id,
        "display_name": display_name,
        "phone": phone,
        "email": email,
        "preferred_contact": "NONE",
        "face_image": face_b64
    }
    
    try:
        response = requests.post(f"{API_BASE}/auth/register", json=payload)
        result = response.json()
        
        if result.get("success"):
            print(f"\n✓ Registration successful!")
            print(f"Participant ID: {result['participant']['id']}")
            print(f"QR UID: {result['participant']['qr_uid']}")
            print(f"Name: {result['participant']['display_name']}")
        else:
            print(f"\n✗ Registration failed: {result.get('message')}")
    except Exception as e:
        print(f"\n✗ Error: {e}")

def login_participant():
    """Login participant using face ID"""
    print("\n=== PARTICIPANT LOGIN ===")
    
    print("\nCapturing face for login...")
    face_b64 = capture_face_image()
    
    if not face_b64:
        print("Face capture cancelled")
        return
    
    payload = {"face_image": face_b64}
    
    try:
        response = requests.post(f"{API_BASE}/auth/login", json=payload)
        result = response.json()
        
        if result.get("success"):
            print(f"\n✓ {result.get('message')}")
            print(f"Welcome, {result['participant']['display_name']}!")
            print(f"Participant ID: {result['participant']['id']}")
        else:
            print(f"\n✗ {result.get('message')}")
    except Exception as e:
        print(f"\n✗ Error: {e}")

def main():
    print("=" * 50)
    print("ReLink Face Authentication Demo")
    print("=" * 50)
    
    while True:
        print("\n1. Register new participant")
        print("2. Login participant")
        print("3. Exit")
        
        choice = input("\nSelect option: ")
        
        if choice == "1":
            register_participant()
        elif choice == "2":
            login_participant()
        elif choice == "3":
            print("Goodbye!")
            break
        else:
            print("Invalid option")

if __name__ == "__main__":
    main()
