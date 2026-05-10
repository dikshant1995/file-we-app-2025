import pdfplumber
import re

def hdfc_audit_2025(pdf_path):
    print(f"Auditing: {pdf_path}")
    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[0]
        W = page.width
        words = page.extract_words()
        
        # 1. Header Scan
        headers = [w for w in words if w['text'].upper() in ["WITHDRAWAL", "DEPOSIT", "CLOSING"]]
        print(f"--- HEADERS (W={W}) ---")
        for h in headers:
            mid = (h['x0']+h['x1'])/2
            print(f"  {h['text']:<15} | x0:{h['x0']:>6.1f} | x1:{h['x1']:>6.1f} | rel_mid:{mid/W:.3f}")

        # 2. Transaction Rows Scan
        print("\n--- SAMPLE TXN ROWS ---")
        row_count = 0
        for w in sorted(words, key=lambda x: (x['top'], x['x0'])):
            # Date starts row
            if re.match(r'^\d{2}/\d{2}/\d{2}$', w['text']) and w['x0'] < 100:
                line = [sw for sw in words if abs(sw['top'] - w['top']) < 2]
                print(f"Row {row_count+1} at y={w['top']:.1f}")
                for sw in sorted(line, key=lambda x: x['x0']):
                    mid_x = (sw['x0'] + sw['x1']) / 2
                    print(f"    {sw['text']:<25} | mid_rel: {mid_x/W:.3f}")
                row_count += 1
                if row_count >= 10: break

if __name__ == "__main__":
    hdfc_audit_2025(r"d:\update bl\till uco 1\Acct Statement_XX9619_26112025 (2).pdf")
