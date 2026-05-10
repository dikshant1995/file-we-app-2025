import pdfplumber
import os

file_path = r'd:\update bl\bank abb latest bl\till uco 1\idbi limit acc.pdf'
with pdfplumber.open(file_path) as pdf:
    print(f"Total Pages: {len(pdf.pages)}")
    for i in range(min(3, len(pdf.pages))):
        print(f"\n--- Page {i+1} ---")
        words = pdf.pages[i].extract_words()
        # Sort by top, then x0
        words = sorted(words, key=lambda x: (x['top'], x['x0']))
        
        # Group into lines
        lines = []
        if words:
            current_line = [words[0]]
            for w in words[1:]:
                if abs(w['top'] - current_line[-1]['top']) < 3:
                    current_line.append(w)
                else:
                    lines.append(current_line)
                    current_line = [w]
            lines.append(current_line)
            
        for line in lines:
            line_text = " ".join([w['text'] for w in line])
            # Print x-coordinates for financial looking tokens
            print(f"{line_text}")
            for w in line:
                if any(c.isdigit() for c in w['text']) and len(w['text']) > 3:
                     # print(f"  [{w['x0']:.1f}-{w['x1']:.1f}]: {w['text']}")
                     pass
