import pdfplumber
import sys

def audit_idbi_rows(pdf_path):
    print(f">>> [FINAL AUDIT] Analyzing: {pdf_path}")
    with pdfplumber.open(pdf_path) as pdf:
        p = pdf.pages[0]
        words = p.extract_words()
        # Look for the transaction rows (usually below y=400)
        for w in words:
            if w['top'] > 400 and w['top'] < 450:
                print(f"{w['text']:<20} | X0: {int(w['x0']):<5} | Top: {int(w['top']):<5}")

if __name__ == "__main__":
    audit_idbi_rows("idbi limit acc.pdf")
