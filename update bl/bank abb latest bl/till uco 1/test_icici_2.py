import pdfplumber
import io
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from pdf_extractor import extract_icici_corporate_statement

def test_icici_2():
    pdf_path = r"d:\update bl\till uco 1\icic 2.pdf"
    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}")
        return

    with pdfplumber.open(pdf_path) as pdf:
        first_page_text = pdf.pages[0].extract_text()
        result = extract_icici_corporate_statement(pdf, first_page_text)
        
        print(f"Account Name: {result['metadata']['account_name']}")
        print(f"Number of Transactions: {len(result['dataset_1'])}")
        
        # Display first 5 rows
        for i, row in enumerate(result['dataset_1'][:5]):
            print(f"Row {i+1}: Date={row['Date']}, Dr={row['Dr']}, Cr={row['Cr']}, Bal={row['Balance']}")

if __name__ == "__main__":
    test_icici_2()
