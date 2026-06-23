import sys
import pdfplumber
from pdf_extractor import UnifiedBankBrain

file_path = "d:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/update bl/CENTRAL BANK ERROR.pdf"
with pdfplumber.open(file_path) as pdf:
    brain = UnifiedBankBrain(pdf)
    brain.detect_layout()
    # Mock extract without math audit
    res = brain.extract()

