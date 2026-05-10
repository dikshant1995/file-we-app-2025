import sys
import os

# Add backend to path
sys.path.append(r'd:\update bl\bank abb latest bl\till uco 1\backend')
from pdf_extractor import parse_bank_statement

def test_axis_glitch():
    files = [
        r'd:\update bl\bank abb latest bl\till uco 1\AXIS 1.pdf',
        r'd:\update bl\bank abb latest bl\till uco 1\AXIS 2.pdf',
        r'd:\update bl\bank abb latest bl\till uco 1\axis limit acc.pdf'
    ]
    
    for f in files:
        print(f"\n--- TESTING FILE: {os.path.basename(f)} ---")
        try:
            with open(f, 'rb') as pdf_file:
                content = pdf_file.read()
                ds1, ds2, ds3, meta = parse_bank_statement(content)
                
                print(f"Account Name: {meta.get('account_name')}")
                print(f"Total Rows: {len(ds1)}")
                
                if ds1:
                    glitch_rows = [r for r in ds1 if abs(r['Balance']) > 500000000] # 50 Crore
                    if glitch_rows:
                        print(f">>> CRITICAL: Found {len(glitch_rows)} glitch rows!")
                        for r in glitch_rows[:5]:
                            print(f"  GLITCH: {r['Date']} | {r['Balance']:,.2f}")
                    else:
                        print(">>> SUCCESS: No quadrillion balances found.")
                        # Check some math
                        for r in ds3[:3]:
                            print(f"  Row: {r['Date']} | {r['Balance']:>12,.2f} | {r['Narration'][:40]}")
                else:
                    print(">>> FAILED: No rows extracted.")
        except Exception as e:
            print(f">>> ERROR: {str(e)}")

if __name__ == "__main__":
    test_axis_glitch()
