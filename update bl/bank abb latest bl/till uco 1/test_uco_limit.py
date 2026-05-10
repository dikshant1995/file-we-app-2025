import sys
import os
import json

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from pdf_extractor import parse_bank_statement
except ImportError:
    # Try different pathing
    sys.path.append('backend')
    from pdf_extractor import parse_bank_statement

def test_uco():
    pdf_path = "limit acc uco.pdf"
    if not os.path.exists(pdf_path):
        print(f"Error: {pdf_path} not found.")
        return

    with open(pdf_path, 'rb') as f:
        pdf_bytes = f.read()

    try:
        result = parse_bank_statement(pdf_bytes)
        
        print("\n--- METADATA ---")
        print(json.dumps(result['metadata'], indent=2))
        
        print(f"\n--- DATASET 1 (First 5 rows) ---")
        for row in result['dataset_1'][:5]:
            print(row)
            
        print(f"\n--- DATASET 1 (Last 5 rows) ---")
        for row in result['dataset_1'][-5:]:
            print(row)
            
        print(f"\nTotal Rows: {len(result['dataset_1'])}")
        
        # Verify Noise Shielding
        for row in result['dataset_3']:
            narr = row['Narration'].upper()
            if "OPENING BALANCE" in narr or "GRAND TOTAL" in narr or "PERIOD FROM" in narr:
                print(f"FAILED Noise Shield for: {narr}")
                
    except Exception as e:
        print(f"Error during extraction: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_uco()
