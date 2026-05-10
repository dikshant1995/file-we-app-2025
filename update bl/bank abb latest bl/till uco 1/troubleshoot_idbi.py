import pdfplumber
import re
from collections import Counter

def troubleshoot_idbi_brain(pdf_path):
    print(f"\n>>> [BRAIN DEBUG] Troubleshooting: {pdf_path}")
    with pdfplumber.open(pdf_path) as pdf:
        p = pdf.pages[0]
        words = p.extract_words()
        
        # 1. PILLAR CHECK
        x_centers = []
        for w in words:
            # Check what numbers are being rejected or accepted
            cleaned = w['text'].replace(",","")
            if re.match(r'^-?[\d,]+\.\d{2}$', cleaned):
                x_centers.append(round((w['x0'] + w['x1'])/2))
            elif any(c.isdigit() for c in cleaned):
                # Print rejected numbers to see why they don't match DNA
                pass

        pillars = [p[0] for p in Counter(x_centers).most_common(5)]
        print(f"Detected Financial DNA at X: {pillars}")
        
        # 2. DATE CHECK
        date_regex = re.compile(r'^(?:\d+\s+)?\d{1,2}[/\- ]+(?:\d{1,2}|[A-Za-z]{3})[/\- ]+\d{2,4}')
        
        lines, current_line, last_y = [], [], -1
        for w in sorted(words, key=lambda x: (x['top'], x['x0'])):
            if last_y == -1 or abs(w['top'] - last_y) < 3: current_line.append(w)
            else:
                lines.append(current_line); current_line = [w]
            last_y = w['top']
        
        print("\n--- LINE ANALYSIS ---")
        for lw in lines[:30]:
            line_txt = " ".join([w['text'] for w in lw])
            if "2024" in line_txt or "2025" in line_txt:
                match = date_regex.match(line_txt)
                print(f"Match: {'YES' if match else 'NO '} | Text: {line_txt[:80]}")

if __name__ == "__main__":
    troubleshoot_idbi_brain("idbi limit acc.pdf")
