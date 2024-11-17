import cv2
import numpy as np
from flask import Flask, Response, jsonify
from flask_cors import CORS
import threading
import time

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

detection_results = {
    'red': 0,
    'blue': 0,
    'green': 0,
    'yellow': 0
}

# Initialize the webcam
# Try different indices if 1 doesn't work for webcam
camera_index = 0
cap = cv2.VideoCapture(camera_index)

# If the above doesn't work, try this:
# cap = cv2.VideoCapture(camera_index, cv2.CAP_DSHOW)

if not cap.isOpened():
    print(f"Error: Could not open camera with index {camera_index}")
    print("Trying default camera (index 0)")
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open any camera")
        exit()

# Define color ranges in HSV
color_ranges = {
    'red': ([0, 100, 100], [10, 255, 255]),
    'blue': ([110, 100, 100], [130, 255, 255]),
    'green': ([50, 100, 100], [70, 255, 255]),
    'yellow': ([20, 100, 100], [30, 255, 255])
}

def detect_objects(frame):
    # Convert the frame to HSV
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    
    detected_objects = {}
    
    for color, (lower, upper) in color_ranges.items():
        # Create a mask for the current color
        mask = cv2.inRange(hsv, np.array(lower), np.array(upper))
        
        # Find contours in the mask
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter contours based on area
        min_area = 500
        objects = [cnt for cnt in contours if cv2.contourArea(cnt) > min_area]
        
        detected_objects[color] = objects
    
    return detected_objects

def generate_frames():
    while True:
        success, frame = cap.read()
        if not success:
            break
        else:
            detected_objects = detect_objects(frame)
            
            # Draw bounding boxes around detected objects
            for color, objects in detected_objects.items():
                for obj in objects:
                    x, y, w, h = cv2.boundingRect(obj)
                    if color == 'red':
                        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 0, 255), 2)
                    elif color == 'blue':
                        cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
                    elif color == 'green':
                        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                    elif color == 'yellow':
                        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 255), 2)
            
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/detect')
def detect():
    success, frame = cap.read()
    if not success:
        return jsonify({"error": "Failed to capture frame"}), 500
    
    detected_objects = detect_objects(frame)
    object_counts = {color: len(objects) for color, objects in detected_objects.items()}
    
    return jsonify({
        'object_counts': object_counts,
        'detection_results': detection_results
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)