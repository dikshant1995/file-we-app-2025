import pdfplumber

def check_all_uco_headers():
    with pdfplumber.open("limit acc uco.pdf") as pdf:
        for i, page in enumerate(pdf.pages):
            W = page.width
            words = page.extract_words()
            headers = [w for w in words if w['text'].upper() in ['WITHDRAWALS', 'DEPOSITS', 'BALANCE']]
            if headers:
                print(f"Page {i+1} Headers:")
                for h in headers:
                    mid_x = (h['x0'] + h['x1']) / 2
                    print(f"  {h['text']:<15} | x0: {h['x0']:>6.1f} | rel_x: {mid_x/W:.3f}")

if __name__ == "__main__":
    check_all_uco_headers()
