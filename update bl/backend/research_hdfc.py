import pdfplumber
import re

def hdfc_deep_audit(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[0]
        W = page.width
        words = page.extract_words()
        
        # 1. Detect Table Column Headers specifically to get absolute ground truth
        headers = [w for w in words if w['text'].upper() in ["WITHDRAWAL", "DEPOSIT", "CLOSING"]]
        print(f"--- HEADER COORDINATES (W={W}) ---")
        for h in headers:
            mid = (h['x0']+h['x1'])/2
            print(f"Header: {h['text']:<15} | x0: {h['x0']:>6.1f} | x1: {h['x1']:>6.1f} | rel_mid: {mid/W:.3f}")

        # 2. Pick any transaction row (starts with date)
        print("\n--- SAMPLE ROWS ---")
        rows_found = 0
        for w in sorted(words, key=lambda x: (x['top'], x['x0'])):
            if re.match(r'^\d{2}/\d{2}/\d{2}$', w['text']) and w['x0'] < 100:
                line = [sw for sw in words if abs(sw['top'] - w['top']) < 2]
                print(f"Row at y={w['top']:.1f}")
                for sw in sorted(line, key=lambda x: x['x0']):
                    mid_x = (sw['x0'] + sw['x1']) / 2
                    print(f"  {sw['text']:<20} | mid_rel: {mid_x/W:.3f}")
                rows_found += 1
                if rows_found >= 3: break

if __name__ == "__main__":
    hdfc_deep_audit(r"d:\update bl\till uco 1\Acct Statement_XX7958_24082023.pdf")
