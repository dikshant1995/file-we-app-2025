import os
import sys
import pdfplumber
from collections import Counter
import re

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from pdf_extractor import UnifiedBankBrain

def diagnose_axis_new():
    pdf_path = "axis new.pdf"
    with pdfplumber.open(pdf_path) as pdf:
        brain = UnifiedBankBrain(pdf)
        brain.detect_layout()
        print(f"Bank Type: {brain.bank_type}")
        print(f"All Pillars: {brain.pillars}")
        print(f"Named Pillars: {brain.named_pillars}")
        
        # Look at the first few words to see the X coordinates
        p = pdf.pages[0]
        words = p.extract_words()
        for w in words:
            if re.match(r'^-?[\d,]+\.\d{2}$', w['text'].replace(",","")) or re.match(r'^\d{3}$', w['text']):
                print(f"Text: {w['text']:>15} | X0: {w['x0']:>8.2f} | X1: {w['x1']:>8.2f} | Center: {(w['x0']+w['x1'])/2:>8.2f}")

if __name__ == "__main__":
    diagnose_axis_new()
