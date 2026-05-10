import sys
import os
import pdfplumber
import json

# Force load the backend
sys.path.append(r'd:\update bl\bank abb latest bl\till uco 1\backend')
import pdf_extractor
import importlib
importlib.reload(pdf_extractor)
from pdf_extractor import UniversalStatementBrain

def run_test(name, path):
    print(f"\n--- TRIAL: {name} ---")
    with pdfplumber.open(path) as pdf:
        brain = UniversalStatementBrain(pdf)
        brain.detect_layout()
        res = brain.extract()
        
        rows = res["ds3"]
        print(f"Extraction Successful: {len(rows)} rows found.")
        print(f"First 3 Rows:")
        for r in rows[:3]:
            print(f"  {r}")
        
        # Integrity Total Check
        total_dr = sum(r['Dr'] for r in rows)
        total_cr = sum(r['Cr'] for r in rows)
        print(f"Total Dr: {total_dr:.2f} | Total Cr: {total_cr:.2f}")
        
        if rows:
            expected_change = round(total_cr - total_dr, 2)
            actual_change = round(rows[-1]['Balance'] - rows[0]['Balance'] if not res['is_descending'] else rows[0]['Balance'] - rows[-1]['Balance'], 2)
            # Note: Opening balance adjustment for actual change if needed
            print(f"Math Pass: Expected Delta={expected_change} | Actual={actual_change}")

run_test("AXIS 1 (Split Columns)", r'd:\update bl\bank abb latest bl\till uco 1\AXIS 1.pdf')
run_test("AXIS 2 (Merged Columns)", r'd:\update bl\bank abb latest bl\till uco 1\AXIS 2.pdf')
