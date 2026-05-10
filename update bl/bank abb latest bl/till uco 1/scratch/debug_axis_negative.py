import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from pdf_extractor import UnifiedBankBrain
import pdfplumber

def debug_axis():
    pdf_path = "d:/update bl/bank abb latest bl/till uco 1/AXIS 1.pdf"
    with pdfplumber.open(pdf_path) as pdf:
        brain = UnifiedBankBrain(pdf)
        brain.detect_layout()
        print(f"Bank Type: {brain.bank_type}")
        print(f"Named Pillars: {brain.named_pillars}")
        print(f"Pillars: {brain.pillars}")
        
        results = brain.extract()
        ds3 = results["ds3"]
        
        print("\nFirst 10 rows:")
        for i, r in enumerate(ds3[:10]):
            print(f"Row {i}: Date={r['Date']}, Dr={r['Dr']}, Cr={r['Cr']}, Balance={r['Balance']}, Narr={r['Narration'][:30]}")

if __name__ == "__main__":
    debug_axis()
