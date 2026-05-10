import pdfplumber
import sys

def map_idbi_gates(pdf_path):
    print(f">>> [GATES] Mapping IDBI: {pdf_path}")
    with pdfplumber.open(pdf_path) as pdf:
        p = pdf.pages[0]
        words = p.extract_words()
        # Look at the header row (typically top < 400)
        # Search for S.No, Txn Date, Value Date
        for w in words:
            if w['top'] > 300 and w['top'] < 400:
                print(f"{w['text']:<15} | X0: {int(w['x0']):<5} | X1: {int(w['x1']):<5}")

if __name__ == "__main__":
    map_idbi_gates("idbi limit acc.pdf")
