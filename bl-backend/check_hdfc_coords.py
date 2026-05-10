import pdfplumber

def check_coords(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[0]
        W = page.width
        print(f"Page Width (W): {W}")
        words = page.extract_words()
        # Find some transaction-like words
        for w in words:
            if "/" in w['text'] and (w['x0'] < 100): # likely date
                print(f"Date: {w['text']} at x={w['x0']:.1f}")
                # Look for other words on the same line (approx)
                same_line = [sw for sw in words if abs(sw['top'] - w['top']) < 2]
                for sw in sorted(same_line, key=lambda x: x['x0']):
                    print(f"  {sw['text']} at x0={sw['x0']:.1f} (rel={sw['x0']/W:.2f})")
                break

if __name__ == "__main__":
    check_coords(r"d:\update bl\till uco 1\Acct Statement_XX7958_24082023.pdf")
