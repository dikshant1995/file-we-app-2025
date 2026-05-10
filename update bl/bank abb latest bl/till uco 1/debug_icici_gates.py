import pdfplumber
import re

file_path = r"D:\update bl\till uco 1\limit acc icici (1).pdf"

with pdfplumber.open(file_path) as pdf:
    page = pdf.pages[0]
    words = sorted(page.extract_words(), key=lambda x: (x['top'], x['x0']))
    
    for w in words:
        if "09:48:39" in w['text'] or "10:02:08" in w['text']:
            print(f"TIME TOKEN: '{w['text']}' | x0: {w['x0']:.1f} | x1: {w['x1']:.1f} | top: {w['top']:.1f}")
        # Also check the Sr No again
        if w['text'] == '1' or w['text'] == '2':
            print(f"SRNO TOKEN: '{w['text']}' | x0: {w['x0']:.1f} | x1: {w['x1']:.1f} | top: {w['top']:.1f}")
