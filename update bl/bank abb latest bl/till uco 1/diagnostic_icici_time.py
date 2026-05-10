import pdfplumber
import re

file_path = r"D:\update bl\till uco 1\limit acc icici (1).pdf"

with pdfplumber.open(file_path) as pdf:
    page = pdf.pages[0]
    words = page.extract_words()
    
    print(f"--- COORDINATE AUDIT for {file_path} ---")
    
    srnos = [w for w in words if re.match(r'^\d+$', w['text']) and w['x0'] < 120]
    times = [w for w in words if re.search(r'\d{2}:\d{2}:\d{2}', w['text'])]
    
    print("SRNO TOKENS (First 5):")
    for w in srnos[:5]:
        print(f"  '{w['text']}' | x0: {w['x0']:.1f} | top: {w['top']:.1f}")
        
    print("\nTIME TOKENS (First 5):")
    for w in times[:5]:
        print(f"  '{w['text']}' | x0: {w['x0']:.1f} | top: {w['top']:.1f}")
