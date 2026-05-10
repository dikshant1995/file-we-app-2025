import sys
import os
import io

# Add backend to path
sys.path.append(r'd:\update bl\bank abb latest bl\till uco 1\backend')
from pdf_extractor import parse_bank_statement

def test_indusind_fix():
    files = [
        r'd:\update bl\bank abb latest bl\till uco 1\IndusInd.pdf',
        r'd:\update bl\bank abb latest bl\till uco 1\INDUSIND 1.pdf',
        r'd:\update bl\bank abb latest bl\till uco 1\indusind bank new pdf.pdf'
    ]
    
    for f in files:
        print(f"\n--- TESTING FILE: {os.path.basename(f)} ---")
        try:
            with open(f, 'rb') as pdf_file:
                content = pdf_file.read()
                ds1, ds2, ds3, meta = parse_bank_statement(content)
                
                print(f"Account Name: {meta.get('account_name')}")
                print(f"Account Type: {meta.get('account_type')}")
                print(f"Total Rows: {len(ds1)}")
                
                if ds1:
                    max_bal = max(abs(r['Balance']) for r in ds1)
                    print(f"Max Absolute Balance: {max_bal:,.2f}")
                    
                    if max_bal > 1000000000: # 100 Crore
                        print(">>> WARNING: Astronomical balance detected! Possible mashup.")
                    else:
                        print(">>> SUCCESS: Balances are within reasonable limits.")
                    
                    # Print first few rows
                    for r in ds3[:3]:
                        print(f"  {r['Date']} | {r['Balance']:>12,.2f} | {r['Narration'][:40]}")
                else:
                    print(">>> FAILED: No rows extracted.")
        except Exception as e:
            print(f">>> ERROR: {str(e)}")

if __name__ == "__main__":
    test_indusind_fix()
