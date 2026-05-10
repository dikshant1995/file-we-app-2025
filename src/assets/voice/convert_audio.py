from moviepy import AudioFileClip
import os

input_file = "WhatsApp Audio 2026-04-30 at 15.11.49.mp4"
output_file = "expert_audio.wav"

try:
    print(f"Loading {input_file}...")
    clip = AudioFileClip(input_file)
    print("Converting to WAV (PCM 16-bit)...")
    clip.write_audiofile(output_file, codec='pcm_s16le')
    print(f"Success! Saved as {output_file}")
except Exception as e:
    print(f"Error during conversion: {e}")
finally:
    try: clip.close()
    except: pass
