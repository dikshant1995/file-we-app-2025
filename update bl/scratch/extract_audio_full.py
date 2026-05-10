import os
from moviepy import VideoFileClip

video_path = r"C:\Users\Dikshant\Downloads\Recording 2026-05-08 173441.mp4"
output_audio_path = r"d:\update bl\bank abb latest bl\till uco 1\scratch\audio.wav"

if os.path.exists(video_path):
    print("Extracting full audio from video...")
    try:
        clip = VideoFileClip(video_path)
        # We can extract audio directly as mp3 or wav.
        # Since Whisper works great with .mp3 or .wav, let's extract as .mp3 which is faster and smaller
        output_mp3 = output_audio_path.replace(".wav", ".mp3")
        clip.audio.write_audiofile(output_mp3, bitrate="64k")
        print(f"Audio successfully extracted to {output_mp3}")
        clip.close()
    except Exception as e:
        print(f"Error extracting audio: {e}")
else:
    print("Video file does not exist.")
