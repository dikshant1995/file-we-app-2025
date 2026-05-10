import pdfplumber
import sys
import os
import re

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
from pdf_extractor import UnifiedBankBrain

# Target PDF (Canara failure case)
pdf_path = r"d:\update bl\bank abb latest bl\till uco 1\CANARA.pdf"

print(f"\n--- VERIFYING STRICT EXTRACTION ---")
print(f"Target: {pdf_path}")

with pdfplumber.open(pdf_path) as pdf:
    brain = UnifiedBankBrain(pdf)
    brain.detect_layout()
    
    # 1. Check Metadata
    print(f"\n1. Metadata Check:")
    print(f"   Metadata: {brain.metadata}")
    if brain.metadata.get("account_name") == "N/A":
        print("   [PASS] Metadata is properly set to N/A.")
    else:
        print("   [FAIL] Metadata still contains extraction logic.")

    # 2. Extract Data
    res = brain.extract()
    ds3 = res["ds3"]
    
    # 3. Check for Opening Balance Rows
    print(f"\n2. Header Row Check:")
    opening_rows = [r for r in ds3 if "OPENING BALANCE" in r["Narration"].upper()]
    if not opening_rows:
        print(f"   [PASS] No 'OPENING BALANCE' header rows found in dataset.")
    else:
        print(f"   [FAIL] Found {len(opening_rows)} opening balance rows:")
        for r in opening_rows:
            print(f"          {r}")

    # 4. Math Audit
    print(f"\n3. Math Integrity Audit:")
    errors = 0
    if len(ds3) > 1:
        for i in range(1, len(ds3)):
            prev_bal = ds3[i-1]["Balance"]
            curr_bal = ds3[i]["Balance"]
            dr = ds3[i]["Dr"]
            cr = ds3[i]["Cr"]
            calc_bal = round(prev_bal + cr - dr, 2)
            if abs(calc_bal - curr_bal) > 0.01:
                errors += 1
                print(f"   [ERROR] Row {i}: {prev_bal} + {cr} - {dr} = {calc_bal} (Expected {curr_bal})")
    
    if errors == 0:
        print(f"   [PASS] Mathematical integrity preserved across {len(ds3)} rows.")
    else:
        print(f"   [FAIL] Found {errors} mathematical inconsistencies.")

print(f"\n--- VERIFICATION COMPLETE ---")
