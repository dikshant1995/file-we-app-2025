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
    
    # Print the lines roughly halfway down where transactions start
    start_printing = False
    for i, lw in enumerate(lines):
        text = " ".join([w["text"] for w in lw])
        if "Date" in text and "Narration" in text:
            start_printing = True
            print("HEADER FOUND:", text)
            continue
        if start_printing and len(lw) > 0:
            print(f"Row {i}: {text}")
            if i > 50: break

