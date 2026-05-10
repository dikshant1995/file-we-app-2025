import os
import sys
import json
sys.path.append(os.path.join(os.getcwd(), "backend"))
from pdf_extractor import parse_bank_statement

def test():
    with open("icici 1.pdf", "rb") as f:
        res = parse_bank_statement(f.read())
    
    with open("icici_test_results.json", "w") as f:
        json.dump(res, f, indent=2)
    print(f"Extraction successful. Total rows: {len(res['dataset_3'])}")

if __name__ == "__main__":
    test()
