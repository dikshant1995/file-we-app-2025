import pdfplumber
import re
from collections import Counter

def analyze_idbi_layout(pdf_path):
    print(f">>> [GEOMETRIC ANALYSIS] IDBI Limit Account: {pdf_path}")
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages[:3]): # First 3 pages
            print(f"\n--- Page {i+1} ---")
            words = page.extract_words()
            
            # 1. Cluster Analysis: Find most frequent decimal X-coordinates
            x_centers = []
            for w in words:
                txt = w['text'].replace(",", "")
                # Detect potential financial values (decimals or mid-sized integers)
                if re.search(r'\d+\.\d{2}', txt) or (re.match(r'^\d+$', txt) and 4 <= len(txt) <= 8):
                    x_centers.append(round((w['x0'] + w['x1']) / 2))
            
            pillars = [p[0] for p in Counter(x_centers).most_common(5)]
            print(f"Financial Pillars Found at X: {sorted(pillars)}")
            
            # 2. Sample Rows: Print words with coordinates
            # Group by Y and show the vertical split if it exists
            rows = {}
            for w in words:
                if 200 < w['top'] < 800: # Main content area
                    rows.setdefault(int(w['top']), []).append(w)
            
            sorted_ys = sorted(rows.keys())
            for idx, y in enumerate(sorted_ys[:20]): # Show first 20 lines
                row_words = sorted(rows[y], key=lambda x: x['x0'])
                line = " ".join([f"[{w['text']}](x:{int(w['x0'])})" for w in row_words])
                print(f"Y:{y} | {line}")
                
                # Check for "Look-Down" opportunity
                if idx + 1 < len(sorted_ys):
                    next_y = sorted_ys[idx+1]
                    if next_y - y < 20: # Close vertical proximity
                        pass # Potential split line

if __name__ == "__main__":
    analyze_idbi_layout(r"d:\update bl\bank abb latest bl\till uco 1\idbi limit acc.pdf")
