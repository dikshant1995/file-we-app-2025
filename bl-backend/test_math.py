import sys
import pdfplumber
from pdf_extractor import UnifiedBankBrain, clean_amount

print(f"clean_amount Test: {clean_amount('1259154.05 DR')}")

file_path = "d:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/update bl/CENTRAL BANK ERROR.pdf"
with pdfplumber.open(file_path) as pdf:
    brain = UnifiedBankBrain(pdf)
    brain.detect_layout()
    res = brain.extract()
    print("EXTRACT RESULTS:")
    for r in res[:2]:
        print(r)

