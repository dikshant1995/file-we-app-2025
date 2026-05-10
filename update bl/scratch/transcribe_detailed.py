import os
import sys
import speech_recognition as sr
from pydub import AudioSegment
from pydub.utils import make_chunks

sys.stdout.reconfigure(encoding='utf-8')

audio_path = r"d:\update bl\bank abb latest bl\till uco 1\scratch\audio.wav"
output_path = r"d:\update bl\bank abb latest bl\till uco 1\scratch\transcript_detailed.txt"

audio = AudioSegment.from_file(audio_path)

# Let's chunk the entire audio in 20-second segments to get much higher detail and fewer missed words
chunk_length_ms = 20000 
chunks = make_chunks(audio, chunk_length_ms)

recognizer = sr.Recognizer()

with open(output_path, "w", encoding="utf-8") as f:
    f.write("Detailed 20-Second Segment Transcript:\n\n")

for i, chunk in enumerate(chunks):
    start_sec = i * 20
    end_sec = (i + 1) * 20
    
    # Format time as MM:SS
    start_time = f"{start_sec // 60:02d}:{start_sec % 60:02d}"
    end_time = f"{end_sec // 60:02d}:{end_sec % 60:02d}"
    
    chunk_name = f"temp_chunk_{i}.wav"
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
            # Let's try en-IN if hi-IN fails, sometimes they speak purely in English
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

print("Detailed transcription done.")
