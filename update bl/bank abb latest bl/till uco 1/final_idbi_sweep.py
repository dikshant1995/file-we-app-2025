import io, re
import pdfplumber
from datetime import datetime

def final_idbi_sweep(pdf_path):
    print(f">>> [DEEP CORE] Analyzing IDBI Pillars: {pdf_path}")
    with pdfplumber.open(pdf_path) as pdf:
        dataset = []
        for p_idx, page in enumerate(pdf.pages):
            words = page.extract_words()
            words = sorted(words, key=lambda x: (x['top'], x['x0']))
            lines, current_line, last_y = [], [], -1
            for w in words:
                if last_y == -1 or abs(w['top'] - last_y) < 3: current_line.append(w)
                else: 
                    lines.append(current_line); current_line = [w]
                last_y = w['top']
            if current_line: lines.append(current_line)

            for l_idx, lw in enumerate(lines):
                date_anchor, max_score = None, -999
                pt = [w for w in lw if w['x0'] < 400]
                for w in pt:
                    text = w['text'].strip()
                    score = 0
                    if re.match(r'\d{2}/\d{2}/\d{2,4}', text): score += 50
                    if ":" in text: score -= 100
                    if re.match(r'^\d{1,3}$', text): score -= 30
                    if score > max_score and score > 0:
                        max_score, date_anchor = score, text

                if not date_anchor: continue

                # Normalization Trace
                try: iso_date = datetime.strptime(date_anchor, "%d/%m/%Y").strftime("%Y-%m-%d")
                except Exception as e:
                    print(f"  [ERROR] Date Parse Fail: {date_anchor} | {e}")
                    continue

                # Pillar Trace
                bal_tokens = [w for w in lw if w['x0'] >= 480]
                bal_content = "".join([w['text'] for w in bal_tokens])
                
                # Atomizer Trace
                current_bal = None
                if bal_tokens:
                    matches = re.findall(r'-?\d+\.\d{2}', bal_content.replace(",",""))
                    if matches: current_bal = float(matches[-1])
                
                if current_bal is not None:
                    # print(f"  Page {p_idx} Row {l_idx}: {iso_date} | Bal: {current_bal}")
                    dataset.append(current_bal)
                else:
                    print(f"  [WARN] Page {p_idx} Row {l_idx} | Missing balance pillar. Contents: {bal_content}")

    print(f"\nAudit Complete. Total Rows: {len(dataset)}")

if __name__ == "__main__":
    final_idbi_sweep("idbi limit acc.pdf")
