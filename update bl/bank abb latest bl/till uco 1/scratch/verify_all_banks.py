import sys
import os
import pdfplumber

# Force load the backend
sys.path.append(r'd:\update bl\bank abb latest bl\till uco 1\backend')
import pdf_extractor
from pdf_extractor import UniversalStatementBrain

def verify_all_banks(name, path):
    print(f"\n--- [TRIAL] {name} ---")
    if not os.path.exists(path):
        print(f"Skipping: {path} not found.")
        return
        
    with pdfplumber.open(path) as pdf:
        brain = UniversalStatementBrain(pdf)
        brain.detect_layout()
        res = brain.extract()
        
        print(f"RESULT - Bank Identified: {brain.bank_type}")
        print(f"RESULT - Account Name:   {res['metadata'].get('account_name', 'Unknown')}")
        
        if res['ds3']:
            print(f"RESULT - First Narration: {res['ds3'][0]['Narration']}")
            print(f"RESULT - Row Count:      {len(res['ds3'])}")

# Run Universal Authority Trial
try:
    # Test the new Axis and IndusInd logic
    # Note: Using Axis path if available from previous forensic knowledge
    verify_all_banks('ICICI Detailed', r'd:\update bl\bank abb latest bl\till uco 1\icici 1.pdf')
    verify_all_banks('IndusInd', r'd:\update bl\bank abb latest bl\till uco 1\indusind.pdf')
    # verify_all_banks('Axis', r'd:\update bl\bank abb latest bl\till uco 1\axis.pdf')
except Exception as e:
    print(f"Verification Failed: {e}")
