import pdfplumber
import re

def audit_bom(pdf_path):
    print(f"Auditing BOM: {pdf_path}")
    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[0]
        W = page.width
        words = page.extract_words()
        
        # 1. Header Scan (Looking for "Particulars", "Debit", "Credit", "Balance")
        headers = [w for w in words if w['text'].upper() in ["PARTICULARS", "DEBIT", "CREDIT", "BALANCE", "CHANNEL", "TYPE"]]
        print(f"--- HEADERS (W={W}) ---")
        for h in headers:
            mid = (h['x0']+h['x1'])/2
            print(f"  {h['text']:<15} | x0:{h['x0']:>6.1f} | x1:{h['x1']:>6.1f} | rel_mid:{mid/W:.3f}")

        # 2. Sample Row Scan
        print("\n--- SAMPLE ROWS ---")
        row_count = 0
        for w in sorted(words, key=lambda x: (x['top'], x['x0'])):
            # Date starts row (DD/MM/YYYY)
            if re.match(r'^\d{2}/\d{2}/\d{4}$', w['text']) and w['x0'] < 100:
                line = [sw for sw in words if abs(sw['top'] - w['top']) < 3]
                print(f"Row {row_count+1} at y={w['top']:.1f}")
                for sw in sorted(line, key=lambda x: x['x0']):
                    mid_x = (sw['x0'] + sw['x1']) / 2
                    print(f"    {sw['text']:<25} | mid_rel: {mid_x/W:.3f}")
                row_count += 1
                if row_count >= 10: break

if __name__ == "__main__":
    audit_bom(r"d:\update bl\till uco 1\bom testing.pdf")
