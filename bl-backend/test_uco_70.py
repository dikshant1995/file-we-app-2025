import sys
import pdfplumber

file_path = "d:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/update bl/UCO error.pdf"

with pdfplumber.open(file_path) as pdf:
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
            if "01-03-2022" in lw[0]["text"]:
                print("ROW: " + " ".join([w["text"] for w in lw]))
                for w in lw:
                    print(f"  [{w['x0']:.1f}-{w['x1']:.1f}] {w['text']}")
