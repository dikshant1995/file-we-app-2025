import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from pdf_extractor import parse_bank_statement

def test_brain_bob_cleaned():
    print(">>> Testing Math-Enforced Brain on bob limit acc.pdf")
    with open("bob limit acc.pdf", "rb") as f:
        res = parse_bank_statement(f.read())
    
    print(f"\nMetadata: {res['metadata']}")
    print(f"Total Rows Extracted: {len(res['dataset_1'])}")
    
    if len(res['dataset_1']) > 1:
        print("\nChecking Row 4 (The one with the 10-digit Ref ID in the screenshot):")
        # In the screenshot, the 4th row had Dr: -70014395856 and Cr: 30000
        # Let's see what the clean Brain says.
        r4 = res['dataset_3'][2] # 0-indexed, row 3 in data
        print(f"Row 3 Summary: {r4}")
        
        # Check if the Dr is now clean (should be 0 because balance shift was +30000)
        if r4['Dr'] == 0:
            print("SUCCESS: Large Ref ID filtered out of Dr column.")
        else:
            print(f"FAILURE: Dr column still contains noise: {r4['Dr']}")

if __name__ == "__main__":
    test_brain_bob_cleaned()
