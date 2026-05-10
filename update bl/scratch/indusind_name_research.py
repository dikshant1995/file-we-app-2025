import pdfplumber

def get_indusind_name():
    path = r'd:\update bl\bank abb latest bl\till uco 1\IndusInd.pdf'
    with pdfplumber.open(path) as pdf:
        text = pdf.pages[0].extract_text()
        print("\n--- INDUSIND FULL HEADER ---")
        # Print first 2000 chars to find the name
        print(text[:2000])

if __name__ == "__main__":
    get_indusind_name()
