import os
from moviepy import VideoFileClip

video_path = r"C:\Users\Dikshant\Downloads\Recording 2026-05-08 173441.mp4"
output_wav_path = r"d:\update bl\bank abb latest bl\till uco 1\scratch\audio.wav"

if os.path.exists(video_path):
    print("Extracting 16kHz mono WAV using moviepy...")
    try:
        clip = VideoFileClip(video_path)
        # Extract audio with 16000Hz, mono (1 channel) for Whisper compatibility
        clip.audio.write_audiofile(output_wav_path, fps=16000, nbytes=2, codec='pcm_s16le', ffmpeg_params=["-ac", "1"])
        print(f"Audio successfully extracted to {output_wav_path}")
        clip.close()
    except Exception as e:
        print(f"Error extracting audio: {e}")
else:
    print("Video file does not exist.")
