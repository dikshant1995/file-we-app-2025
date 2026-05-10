import os
from moviepy import VideoFileClip

video_path = r"C:\Users\Dikshant\Downloads\Recording 2026-05-08 173441.mp4"
if os.path.exists(video_path):
    print(f"File exists. Size: {os.path.getsize(video_path)} bytes")
    try:
        clip = VideoFileClip(video_path)
        print(f"Duration: {clip.duration} seconds")
        print(f"FPS: {clip.fps}")
        print(f"Size: {clip.size}")
        audio_clip = clip.audio
        if audio_clip is not None:
            print("Audio track is present.")
        else:
            print("No audio track found.")
        clip.close()
    except Exception as e:
        print(f"Error loading video: {e}")
else:
    print("File does not exist.")
