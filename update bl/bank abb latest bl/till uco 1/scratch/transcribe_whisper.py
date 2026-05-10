import os
import whisper

audio_path = r"d:\update bl\bank abb latest bl\till uco 1\scratch\audio.mp3"
output_text_path = r"d:\update bl\bank abb latest bl\till uco 1\scratch\transcript.txt"

if os.path.exists(audio_path):
    print("Loading Whisper model...")
    # Load the lightweight tiny model for fast CPU transcription
    model = whisper.load_model("tiny")
    print("Transcribing audio... (This may take a minute on CPU)")
    
    # Transcribe with timestamp segments and Hinglish language hint
    result = model.transcribe(audio_path, language="hi")
    
    print("Writing transcript to file...")
    with open(output_text_path, "w", encoding="utf-8") as f:
        f.write(f"FULL TRANSCRIPT FOR: {audio_path}\n")
        f.write("="*50 + "\n\n")
        for segment in result["segments"]:
            start = segment["start"]
            end = segment["end"]
            text = segment["text"]
            f.write(f"[{int(start//60):02d}:{int(start%60):02d} - {int(end//60):02d}:{int(end%60):02d}] {text}\n")
            
    print(f"Transcription complete! Saved to {output_text_path}")
else:
    print("Audio file does not exist.")
