import sys
import pdfplumber
import re
from pdf_extractor import UnifiedBankBrain

file_path = "d:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/update bl/CENTRAL BANK ERROR.pdf"
with pdfplumber.open(file_path) as pdf:
    brain = UnifiedBankBrain(pdf)
    brain.detect_layout()
    # bypass math audit
    all_rows = []
    gates = brain.knowledge["CENTRAL"]["gates"]
    for page in pdf.pages[:1]:
        words = sorted(page.extract_words(), key=lambda x: (x["top"], x["x0"]))
        lines_w, current_line, last_y = [], [], -1
        for w in words:
            if last_y == -1 or abs(w["top"] - last_y) < 3: current_line.append(w)
            else:
                lines_w.append(sorted(current_line, key=lambda x: x["x0"])); current_line = [w]
            last_y = w["top"]
        if current_line: lines_w.append(sorted(current_line, key=lambda x: x["x0"]))
        
        for lw in lines_w:
            dr_w = [w for w in lw if 510 <= (w["x0"]+w["x1"])/2 < 610]
            cr_w = [w for w in lw if 610 <= (w["x0"]+w["x1"])/2 < 700]
            bal_w = [w for w in lw if 700 <= (w["x0"]+w["x1"])/2 < 850]
            
            dr_str = " ".join([w["text"] for w in dr_w])
            cr_str = " ".join([w["text"] for w in cr_w])
            bal_str = " ".join([w["text"] for w in bal_w])
            
            date_str = " ".join([w["text"] for w in lw[:2]])
            if re.search(r"\d{2}/\d{2}/\d{4}", date_str):
                print(f"Dr: {dr_str} | Cr: {cr_str} | Bal: {bal_str}")

