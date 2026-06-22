import sys
import pdfplumber

file_path = "d:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/update bl/AU SMALL ERROR.pdf"
with pdfplumber.open(file_path) as pdf:
    page = pdf.pages[0]
    words = sorted(page.extract_words(), key=lambda x: (x["top"], x["x0"]))
    lines = []
    current_line = []
    last_y = -1
    for w in words:
        if last_y == -1 or abs(w["top"] - last_y) < 3:
            current_line.append(w)
        else:
            lines.append(current_line)
            current_line = [w]
        last_y = w["top"]
    if current_line:
        lines.append(current_line)
    
    for lw in lines:
        text = " ".join([w["text"] for w in lw])
        if "05 Apr 2025 05 Apr 2025" in text:
            print(f"Row Match: {text}")
            for w in lw:
                print(f"[{w['x0']:.1f}-{w['x1']:.1f}] {w['text']}")
            break
