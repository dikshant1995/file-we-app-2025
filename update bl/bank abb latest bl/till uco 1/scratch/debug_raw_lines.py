import pdfplumber
import sys
import os
import re

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
from pdf_extractor import UnifiedBankBrain

pdf_path = r"d:\update bl\bank abb latest bl\till uco 1\SBI 2.pdf"

with pdfplumber.open(pdf_path) as pdf:
    brain = UnifiedBankBrain(pdf)
    brain.detect_layout()
    # Manual extract steps to debug
    page = pdf.pages[0]
    h_y = 150
    words = sorted(page.extract_words(), key=lambda x: (x.get('top', 0), x.get('x0', 0)))
    raw_lines, current_line, last_y = [], [], -1
    for w in words:
        if w.get('top', 0) < h_y or not w.get('text'): continue
        if last_y == -1 or abs(w['top'] - last_y) < 3.5: current_line.append(w)
        else: 
            raw_lines.append(current_line); current_line = [w]
        last_y = w['top']
    if current_line: raw_lines.append(current_line)
    
    print(f"Found {len(raw_lines)} raw lines on page 1")
    for i, lw in enumerate(raw_lines[:20]):
        print(f"Line {i}: {' '.join([w['text'] for w in lw])}")
