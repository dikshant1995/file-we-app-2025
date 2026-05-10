import os
import sys
# Add project root to sys.path
sys.path.append(os.getcwd())
from backend.pdf_extractor import parse_bank_statement

def test_idbi_extraction():
    pdf_path = r"d:\update bl\bank abb latest bl\till uco 1\idbi limit acc.pdf"
    if not os.path.exists(pdf_path):
        print(f"Error: PDF not found at {pdf_path}")
        return

    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    print(">>> Starting IDBI Extraction...")
    try:
        ds1, ds2, ds3, meta = parse_bank_statement(pdf_bytes)
        print(f"\nMetadata: {meta}")
        print(f"Total Rows Extracted: {len(ds1)}")
        
        if ds1:
            print("\nRow 1 Details:")
            print(ds3[0])
            print(f"Row 1 Balance: {ds3[0]['Balance']}")
            
        print("\nPage 1 Results Summary:")
        p1_rows = [r for r in ds3 if r["Date"].startswith("2025-02")]
        print(f"Rows found for Feb 2025: {len(p1_rows)}")
        for r in p1_rows[:10]:
            print(f"  {r['Date']} | {r['Balance']} | {r['Narration'][:50]}...")
            
    except Exception as e:
        print(f"Error during extraction: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_idbi_extraction()
