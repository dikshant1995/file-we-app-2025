import sys
import pdfplumber
from pdf_extractor import UnifiedBankBrain

file_path = "d:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/update bl/UCO error.pdf"
with pdfplumber.open(file_path) as pdf:
    brain = UnifiedBankBrain(pdf)
    brain.detect_layout()
    # Mocking knowledge
    brain.knowledge["UCO"] = {
        "cleaning": [],
        "gates": {"Date": (20, 70), "Narr": (80, 240), "Dr": (330, 410), "Cr": (430, 500), "Bal": (520, 580)}
    }
    brain.bank_type = "UCO"
    res = brain.extract()
    d3 = res["ds3"]
    print(f"Extracted {len(d3)} rows.")
    for r in d3[:5]: print(r)
    for r in d3[-5:]: print(r)

