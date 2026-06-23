import sys
import pdfplumber
import re
from pdf_extractor import clean_amount

file_path = "d:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/update bl/UCO error.pdf"

def trace_uco(pdf_path):
    all_rows = []
    date_regex = re.compile(r"^\d{2}-\d{2}-\d{4}$")
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages[-1:]:
            words = sorted(page.extract_words(), key=lambda x: (x["top"], x["x0"]))
            lines_w, current_line, last_y = [], [], -1
            for w in words:
                if last_y == -1 or abs(w["top"] - last_y) < 3: current_line.append(w)
                else:
                    lines_w.append(sorted(current_line, key=lambda x: x["x0"])); current_line = [w]
                last_y = w["top"]
            if current_line: lines_w.append(sorted(current_line, key=lambda x: x["x0"]))
            
            for lw in lines_w:
                date_str = lw[0]["text"]
                if date_regex.match(date_str):
                    dr_words = [w for w in lw if 330 <= (w["x0"]+w["x1"])/2 < 430]
                    cr_words = [w for w in lw if 430 <= (w["x0"]+w["x1"])/2 < 530]
                    bal_words = [w for w in lw if 530 <= (w["x0"]+w["x1"])/2 < 630]
                    
                    dr = clean_amount(" ".join([w["text"] for w in dr_words]))
                    cr = clean_amount(" ".join([w["text"] for w in cr_words]))
                    bal = clean_amount(" ".join([w["text"] for w in bal_words]))
                    print(f"Row {date_str}: Dr={dr}, Cr={cr}, Bal={bal}")

trace_uco(file_path)

