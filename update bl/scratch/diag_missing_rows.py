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
    res = brain.extract()
    ds1 = res["ds1"]
    
    print(f"Total Rows: {len(ds1)}")
    for i, row in enumerate(ds1[:10]):
        print(f"Row {i}: {row}")
