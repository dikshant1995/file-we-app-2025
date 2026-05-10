import pdfplumber

def check_type(path):
    try:
        with pdfplumber.open(path) as pdf:
            text = pdf.pages[0].extract_text().upper()
            if "SAVING" in text or "CURRENT" in text:
                return "SAVINGS/CURRENT"
            if "CASH CREDIT" in text or "OVERDRAFT" in text or "LIMIT" in text:
                return "LIMIT/OD"
            return "UNKNOWN"
    except:
        return "ERROR"

print(f"AU 2.pdf: {check_type(r'd:\update bl\bank abb latest bl\till uco 1\AU 2.pdf')}")
print(f"SBI 2.pdf: {check_type(r'd:\update bl\bank abb latest bl\till uco 1\SBI 2.pdf')}")
