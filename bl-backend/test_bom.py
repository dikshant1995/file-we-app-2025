import sys
import os
sys.path.append(os.getcwd())
from backend.pdf_extractor import parse_bank_statement

def test_bom(pdf_path):
    print(f"Testing BOM Extraction: {os.path.basename(pdf_path)}")
    with open(pdf_path, 'rb') as f:
        data = parse_bank_statement(f.read())
        
        print("\n--- Metadata ---")
        for k, v in data['metadata'].items():
            print(f"{k}: {v}")
            
        rows = data.get('dataset_3', [])
        print(f"\nTotal Rows Extracted: {len(rows)}")
        print("\n--- First 10 Rows ---")
        for i, r in enumerate(rows[:10]):
            print(f"R{i+1:<2}: Date: {r['Date']}, Dr: {r['Dr']:>10.2f}, Cr: {r['Cr']:>10.2f}, Bal: {r['Balance']:>10.2f}")
            print(f"    Narr: {r['Narration'][:80]}...")

if __name__ == "__main__":
    test_bom(r"d:\update bl\till uco 1\bom testing.pdf")
