import os
import sys
import traceback
# Ensure we can import from the backend
sys.path.append(os.getcwd())
from backend.pdf_extractor import parse_bank_statement

def verify_v7():
    targets = [
        'idbi limit acc.pdf',
        'StatementMon Feb 10 13_30_18 GMT+05_30 2025 (2).pdf'
    ]
    
    for filename in targets:
        print(f"\n{'='*60}")
        print(f"VERIFYING V7 ON: {filename}")
        print(f"{'='*60}")
        
        try:
            with open(filename, 'rb') as f:
                pdf_bytes = f.read()
            
            ds1, ds2, ds3, meta = parse_bank_statement(pdf_bytes)
            print(f">>> SUCCESS: Extracted {len(ds1)} rows.")
            print(f">>> Account Name: {meta.get('account_name')}")
            
            if ds1:
                print(f">>> First Row: {ds1[0]}")
                print(f">>> Last Row: {ds1[-1]}")
                # Math Parity Check
                total_dr = sum(r['Dr'] for r in ds1)
                total_cr = sum(r['Cr'] for r in ds1)
                bal_shift = ds1[-1]['Balance'] - ds1[0]['Balance']
                print(f">>> Math Parity (Shift vs Cr-Dr): {bal_shift:.2f} vs {(total_cr - total_dr):.2f}")
            
        except Exception as e:
            traceback.print_exc()

if __name__ == "__main__":
    verify_v7()
