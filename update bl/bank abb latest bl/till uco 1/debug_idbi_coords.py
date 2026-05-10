import pdfplumber
import re

def debug_idbi():
    print(">>> [DIAGNOSTIC] Mapping IDBI Coordinates...")
    with pdfplumber.open('idbi limit acc.pdf') as pdf:
        page = pdf.pages[0]
        words = sorted(page.extract_words(), key=lambda x: (x['top'], x['x0']))
        
        # Look for the 'Balance' header first
        for w in words:
            if "Balance" in w['text']:
                print(f"FOUND HEADER: '{w['text']}' at X0={w['x0']}, X1={w['x1']}, Top={w['top']}")

        # Print anything that looks like a decimal number on the first few rows
        row_count = 0
        last_y = -1
        for w in words:
            if last_y == -1 or abs(w['top'] - last_y) > 3:
                row_count += 1
                last_y = w['top']
            
            if row_count > 10 and row_count < 25: # Focus on transaction area
                if re.search(r'\d+\.\d{2}', w['text']):
                    print(f"Row {row_count} | Value: {w['text']} | X-Center: {(w['x0']+w['x1'])/2} | X0: {w['x0']}")

if __name__ == "__main__":
    debug_idbi()
