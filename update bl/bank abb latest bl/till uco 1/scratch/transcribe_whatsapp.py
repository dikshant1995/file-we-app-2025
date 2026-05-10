import os
import sys
import speech_recognition as sr
from moviepy.audio.io.AudioFileClip import AudioFileClip
from pydub import AudioSegment
from pydub.utils import make_chunks

sys.stdout.reconfigure(encoding='utf-8')

video_path = r"C:\Users\Dikshant\Downloads\WhatsApp Audio 2026-05-08 at 21.53.57.mp4"
temp_wav_path = r"d:\update bl\bank abb latest bl\till uco 1\scratch\whatsapp_temp.wav"
output_path = r"d:\update bl\bank abb latest bl\till uco 1\scratch\whatsapp_transcript.txt"

print("Step 1: Extracting audio from WhatsApp audio container (mp4)...")
try:
    clip = AudioFileClip(video_path)
    clip.write_audiofile(temp_wav_path, fps=16000, nbytes=2, codec='pcm_s16le', ffmpeg_params=["-ac", "1"])
    clip.close()
    print("Audio extraction successful!")
except Exception as e:
    print(f"Error extracting audio: {e}")
    sys.exit(1)

print("Step 2: Processing and segmenting audio...")
audio = AudioSegment.from_file(temp_wav_path)
chunk_length_ms = 20000 
chunks = make_chunks(audio, chunk_length_ms)

recognizer = sr.Recognizer()

with open(output_path, "w", encoding="utf-8") as f:
    f.write("WhatsApp Audio Transcript:\n\n")

print("Step 3: Transcribing chunk by chunk...")
for i, chunk in enumerate(chunks):
    start_sec = i * 20
    end_sec = (i + 1) * 20
    start_time = f"{start_sec // 60:02d}:{start_sec % 60:02d}"
    end_time = f"{end_sec // 60:02d}:{end_sec % 60:02d}"
    
    chunk_name = f"temp_wa_chunk_{i}.wav"
    chunk.export(chunk_name, format="wav")
    
    with sr.AudioFile(chunk_name) as source:
        audio_data = recognizer.record(source)
        try:
            text = recognizer.recognize_google(audio_data, language="hi-IN")
            line = f"[{start_time} - {end_time}] {text}\n"
            print(line.encode('utf-8', errors='ignore').decode('utf-8'))
            with open(output_path, "a", encoding="utf-8") as f:
                f.write(line)
        except sr.UnknownValueError:
            try:
                text = recognizer.recognize_google(audio_data, language="en-IN")
                line = f"[{start_time} - {end_time}] (EN-IN) {text}\n"
                print(line.encode('utf-8', errors='ignore').decode('utf-8'))
                with open(output_path, "a", encoding="utf-8") as f:
                    f.write(line)
            except sr.UnknownValueError:
                line = f"[{start_time} - {end_time}] (unrecognized)\n"
                print(line)
                with open(output_path, "a", encoding="utf-8") as f:
                    f.write(line)
        except sr.RequestError as e:
            print(f"API Error: {e}")
            break
            
    os.remove(chunk_name)

if os.path.exists(temp_wav_path):
    os.remove(temp_wav_path)

print("Transcription completed successfully!")
