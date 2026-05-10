import sys
import os
import pdfplumber

# Force load the backend
sys.path.append(r'd:\update bl\bank abb latest bl\till uco 1\backend')
import pdf_extractor
from pdf_extractor import UniversalStatementBrain

def verify_polish(name, path):
    print(f"\n--- [TRIAL] {name} ---")
    print(f"File: {os.path.abspath(path)}")
    
    with pdfplumber.open(path) as pdf:
        brain = UniversalStatementBrain(pdf)
        brain.detect_layout()
        res = brain.extract()
        
        print(f"RESULT - Bank Identified: {brain.bank_type}")
        print(f"RESULT - Account Name:   {res['metadata'].get('account_name')}")
        
        if res['ds3']:
            print(f"RESULT - First Narration: {res['ds3'][0]['Narration']}")
            print(f"RESULT - Row Count:      {len(res['ds3'])}")

# Run Trials
try:
    verify_polish('HDFC Standard', r'd:\update bl\bank abb latest bl\till uco 1\hdfc.pdf')
    verify_polish('ICICI Detailed', r'd:\update bl\bank abb latest bl\till uco 1\icici 1.pdf')
except Exception as e:
    print(f"Verification Failed: {e}")
