import sys
import pdfplumber

file_path = "d:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/update bl/UCO error.pdf"
with pdfplumber.open(file_path) as pdf:
    for page in pdf.pages[:1]:
        words = sorted(page.extract_words(), key=lambda x: (x["top"], x["x0"]))
        lines = []
        current_line = []
        last_y = -1
        for w in words:
            if last_y == -1 or abs(w["top"] - last_y) < 3:
                current_line.append(w)
            else:
                lines.append(sorted(current_line, key=lambda x: x["x0"]))
                current_line = [w]
            last_y = w["top"]
        if current_line:
            lines.append(sorted(current_line, key=lambda x: x["x0"]))
        
        start = False
        for lw in lines:
            text = " ".join([w["text"] for w in lw])
            if "Date" in text and "Balance" in text:
                start = True
                print(f"HEADER: {text}")
                for w in lw:
                    print(f"  [{w['x0']:.1f}-{w['x1']:.1f}] {w['text']}")
                continue
            if start and lw:
                print(f"ROW: {text}")
                for w in lw:
                    print(f"  [{w['x0']:.1f}-{w['x1']:.1f}] {w['text']}")
                break
