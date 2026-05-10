import sys
import os
sys.path.append(os.getcwd())
from backend.pdf_extractor import parse_bank_statement

def verify_laxmi_2(pdf_path):
    print(f"Testing File: {os.path.basename(pdf_path)}")
    with open(pdf_path, 'rb') as f:
        data = parse_bank_statement(f.read())
        rows = data.get('dataset_1', [])
        print(f"Total Rows: {len(rows)}")
        for i, r in enumerate(rows[:30]):
            print(f"R{i+1:<2}: Date: {r['Date']}, Dr: {r['Dr']:>10.2f}, Cr: {r['Cr']:>10.2f}, Bal: {r['Balance']:>10.2f}")

if __name__ == "__main__":
    verify_laxmi_2(r"d:\update bl\till uco 1\Acct Statement_XX9619_26112025 (2).pdf")
