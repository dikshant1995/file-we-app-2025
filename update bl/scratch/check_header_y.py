import pdfplumber
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
from pdf_extractor import UnifiedBankBrain

pdf_path = r"d:\update bl\bank abb latest bl\till uco 1\SBI 2.pdf"

with pdfplumber.open(pdf_path) as pdf:
    brain = UnifiedBankBrain(pdf)
    brain.detect_layout()
    print(f"Detected header_y: {brain.header_y}")
