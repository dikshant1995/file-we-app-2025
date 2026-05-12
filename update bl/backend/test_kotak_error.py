from pdf_extractor import parse_bank_statement
import sys

def test():
    filepath = r"D:\proudct dashboard pl final pl\LATEST UPDATE PL BETA\deploy_to_vercel\file-we-app-2025\update bl\kotak error testing.pdf"
    print(f"Reading file: {filepath}")
    
    with open(filepath, 'rb') as f:
        data = f.read()
        
    d1, d2, d3, meta = parse_bank_statement(data, None)
    
    print("\n--- Extraction Results ---")
    print("Metadata:", meta)
    print(f"Total Rows Found: {len(d3)}")
    
    if len(d3) > 0:
        print("\nSample of first 3 transactions:")
        for i, row in enumerate(d3[:3]):
            print(f"{i+1}: {row}")
    else:
        print("\n!!! NO TRANSACTIONS EXTRACTED !!!")
        
    print("\n--- Checking for Zero Values ---")
    if d3:
        non_zero_bal = [r for r in d3 if float(r.get('Balance', 0)) != 0]
        print(f"Rows with non-zero balances: {len(non_zero_bal)}")
        
        all_zero_bal = [r for r in d3 if float(r.get('Balance', 0)) == 0]
        if all_zero_bal:
            print(f"First 3 zero balance rows:")
            for i, row in enumerate(all_zero_bal[:3]):
                print(f"{i+1}: {row}")

if __name__ == "__main__":
    test()
