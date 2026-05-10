import pdfplumber
import sys

def map_idbi_precise(pdf_path):
    print(f">>> [GATES] Precision Mapping IDBI: {pdf_path}")
    with pdfplumber.open(pdf_path) as pdf:
        p = pdf.pages[0]
        words = p.extract_words()
        # Look at the header row (typically top < 400)
        # We need exact X0 and X1 for S.No, Txn Date, Value Date
        print(f"{'TEXT':<20} | {'X0':<5} | {'X1':<5} | {'TOP':<5}")
        print("-" * 50)
        for w in words:
            if w['top'] > 360 and w['top'] < 400:
                print(f"{w['text']:<20} | {int(w['x0']):<5} | {int(w['x1']):<5} | {int(w['top']):<5}")

if __name__ == "__main__":
    map_idbi_precise("idbi limit acc.pdf")
