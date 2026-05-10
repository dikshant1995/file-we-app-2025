import os
import sys
import json
# Add project root to sys.path
sys.path.append(os.getcwd())
from backend.pdf_extractor import parse_bank_statement

def check_parity_and_quad(pdf_path):
    print(f"\n>>> AUDITING: {pdf_path}")
    try:
        with open(pdf_path, 'rb') as f:
            pdf_bytes = f.read()
            
        ds1, ds2, ds3, meta = parse_bank_statement(pdf_bytes)
        
        if not ds1:
            print("    [!] Empty Extraction")
            return

        print(f"    Meta: {meta}")
        print(f"    Rows: {len(ds1)}")
        
        # 1. Math Parity Check
        bal = ds1[0]['Balance']
        errors = 0
        for i, r in enumerate(ds1[1:], 1):
            expected = round(bal + r['Cr'] - r['Dr'], 2)
            if abs(expected - r['Balance']) > 0.01:
                if errors < 5:
                    print(f"    [!] MATH ERROR at row {i} ({r['Date']}): Ex:{expected} Got:{r['Balance']}")
                errors += 1
            bal = r['Balance']
            
        if errors:
            print(f"    Total Math Errors: {errors}")
        else:
            print("    [PASS] Math Parity Verified.")
            
        # 2. Quadrillion/Massive Jump Check
        for i, r in enumerate(ds1):
            if abs(r['Dr']) > 50000000 or abs(r['Cr']) > 50000000:
                print(f"    [!] UNUSUALLY LARGE TRANSACTION at row {i}: {r}")

    except Exception as e:
        print(f"    !!! CRASH: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_parity_and_quad(r'd:\update bl\bank abb latest bl\till uco 1\idbi limit acc.pdf')
