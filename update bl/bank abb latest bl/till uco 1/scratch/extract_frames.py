import os
import cv2

video_path = r"C:\Users\Dikshant\Downloads\Recording 2026-05-08 173441.mp4"
output_dir = r"d:\update bl\bank abb latest bl\till uco 1\scratch\frames"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

if os.path.exists(video_path):
    print("Opening video file...")
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    duration = total_frames / fps
    print(f"FPS: {fps}, Total Frames: {total_frames}, Duration: {duration:.2f} seconds")
    
    interval_seconds = 2
    frame_interval = int(fps * interval_seconds)
    
    count = 0
    saved_count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        if count % frame_interval == 0:
            current_sec = int(count / fps)
            filename = os.path.join(output_dir, f"frame_{current_sec:03d}s.jpg")
            # Resize image to lower resolution to save disk space and be faster to load
            # Let's keep a reasonable size, e.g., width 1024
            height, width, _ = frame.shape
            new_width = 1024
            new_height = int(height * (new_width / width))
            resized_frame = cv2.resize(frame, (new_width, new_height))
            
            cv2.imwrite(filename, resized_frame)
            saved_count += 1
            if saved_count % 50 == 0:
                print(f"Saved {saved_count} frames (up to {current_sec}s)...")
                
        count += 1
        
    cap.release()
    print(f"Done! Successfully extracted {saved_count} frames to {output_dir}")
else:
    print("Video file does not exist.")
