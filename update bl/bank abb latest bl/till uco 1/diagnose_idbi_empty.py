import io, re
import pdfplumber

def diagnose_idbi(pdf_path):
    print(f">>> [DIAGNOSTIC] Analyzing IDBI Extraction Path: {pdf_path}")
    with pdfplumber.open(pdf_path) as pdf:
        first_page = pdf.pages[0]
        words = first_page.extract_words()
        words = sorted(words, key=lambda x: (x['top'], x['x0']))
        
        lines, current_line, last_y = [], [], -1
        for w in words:
            if last_y == -1 or abs(w['top'] - last_y) < 3: current_line.append(w)
            else: 
                lines.append(current_line); current_line = [w]
            last_y = w['top']
        if current_line: lines.append(current_line)

        print(f"Total Lines Clustered: {len(lines)}")
        
        for i, lw in enumerate(lines):
            # Only look at potential transaction area
            if i < 40 or i > 60: continue 
            
            potential_date_tokens = [w for w in lw if w['x0'] < 400]
            print(f"\nLine {i} Tokens: {' '.join([w['text'] for w in lw])}")
            
            date_anchor = None
            max_score = -999
            
            for w in potential_date_tokens:
                text = w['text'].strip()
                score = 0
                if re.match(r'\d{2}/\d{2}/\d{2,4}', text): score += 50
                if ":" in text: score -= 100
                if re.match(r'^\d{1,3}$', text): score -= 30
                
                if score > 0:
                    print(f"  TOKEN: [{text:^12}] | Score: {score} | X0: {int(w['x0'])}")
                
                if score > max_score and score > 0:
                    max_score = score
                    date_anchor = text

            if date_anchor:
                print(f"  SUCCESS: Locked onto Date [{date_anchor}] at Score {max_score}")
            else:
                print(f"  FAILURE: No valid date anchor found for this line.")

if __name__ == "__main__":
    diagnose_idbi("idbi limit acc.pdf")
