import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from pdf_extractor import parse_bank_statement

def test_brain_on_boi():
    print(">>> Testing Universal Brain on BOI.pdf (No schema built yet)")
    with open("BOI.pdf", "rb") as f:
        res = parse_bank_statement(f.read())
    
    print(f"\nMetadata: {res['metadata']}")
    print(f"Total Rows Extracted: {len(res['dataset_1'])}")
    
    if len(res['dataset_1']) > 0:
        print("\nFirst 5 Rows Sample:")
        for r in res['dataset_3'][:5]:
            print(r)
        
        # Check for Dr/Cr presence
        cr_rows = [r for r in res['dataset_3'] if r['Cr'] > 0]
        print(f"\nRows with Credits (BTO): {len(cr_rows)}")

if __name__ == "__main__":
    test_brain_on_boi()
