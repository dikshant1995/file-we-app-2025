import os
import sys
import speech_recognition as sr
from pydub import AudioSegment
from pydub.utils import make_chunks

sys.stdout.reconfigure(encoding='utf-8')

audio_path = r"d:\update bl\bank abb latest bl\till uco 1\scratch\audio.wav"
output_path = r"d:\update bl\bank abb latest bl\till uco 1\scratch\transcript_google.txt"

audio = AudioSegment.from_file(audio_path)

# chunk length in ms (60 seconds)
chunk_length_ms = 60000 
chunks = make_chunks(audio, chunk_length_ms)

recognizer = sr.Recognizer()

with open(output_path, "w", encoding="utf-8") as f:
    f.write("Google Speech Recognition Transcript:\n\n")

for i, chunk in enumerate(chunks):
    chunk_name = f"chunk_{i}.wav"
    chunk.export(chunk_name, format="wav")
    
    with sr.AudioFile(chunk_name) as source:
        audio_data = recognizer.record(source)
        try:
            # Using hi-IN for Hinglish/Hindi
            text = recognizer.recognize_google(audio_data, language="hi-IN")
            start_time = i
            end_time = i + 1
            line = f"[{start_time}:00 - {end_time}:00] {text}\n"
            print(line.encode('utf-8', errors='ignore').decode('utf-8'))
            with open(output_path, "a", encoding="utf-8") as f:
                f.write(line)
        except sr.UnknownValueError:
            line = f"[{start_time}:00 - {end_time}:00] (unrecognized)\n"
            print(line)
            with open(output_path, "a", encoding="utf-8") as f:
                f.write(line)
        except sr.RequestError as e:
            print(f"API Error: {e}")
            break
            
    os.remove(chunk_name)

print("Transcription done.")
