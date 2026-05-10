import os
import sys
sys.path.append(os.path.join(os.getcwd(), "backend"))
from pdf_extractor import parse_bank_statement

def test():
    with open("icici 1.pdf", "rb") as f:
        res = parse_bank_statement(f.read())
    
    print(f"Name: {res['metadata']['account_name']}")
    print(f"Total: {len(res['dataset_3'])}")
    for r in res['dataset_3'][:10]:
        print(f"D:{r['Date']} Dr:{r['Dr']} Cr:{r['Cr']} B:{r['Balance']}")
        print(f"N:{r['Narration'][:50]}")

if __name__ == "__main__":
    test()
