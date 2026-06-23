import sys
import pdfplumber
import re
from pdf_extractor import clean_amount

file_path = "d:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/update bl/CENTRAL BANK ERROR.pdf"

def test_extract(pdf_path):
    dataset_3 = []
    date_regex = re.compile(r"\b\d{1,2}/\d{1,2}/\d{4}\b")
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages[:1]:
            words = sorted(page.extract_words(), key=lambda x: (x["top"], x["x0"]))
            lines_w, current_line, last_y = [], [], -1
            for w in words:
                if last_y == -1 or abs(w["top"] - last_y) < 3: current_line.append(w)
                else:
                    lines_w.append(sorted(current_line, key=lambda x: x["x0"])); current_line = [w]
                last_y = w["top"]
            if current_line: lines_w.append(sorted(current_line, key=lambda x: x["x0"]))
            
            header_y = 0
            for lw in lines_w:
                text = " ".join([w["text"] for w in lw])
                if "Post Date" in text and "Value Date" in text:
                    header_y = lw[0]["top"]
                    continue
                    
                if header_y == 0 or lw[0]["top"] < header_y + 5:
                    continue
                    
                date_words = [w for w in lw if 40 <= (w["x0"]+w["x1"])/2 < 110]
                date_str = " ".join([w["text"] for w in date_words])
                m = date_regex.search(date_str)
                if m:
                    print(f"MATCH: {m.group(0)}")
                    dataset_3.append({"Date": m.group(0)})
                else:
                    print(f"NO MATCH: {date_str} in row {text}")
    return dataset_3

test_extract(file_path)

