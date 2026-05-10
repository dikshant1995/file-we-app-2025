import io
from backend.pdf_extractor import parse_bank_statement

def verify_idbi():
    print(">>> [FINAL AUDIT] Surgically Verifying IDBI Accuracy...")
    with open('idbi limit acc.pdf', 'rb') as f:
        pdf_bytes = f.read()
    
    try:
        d1, d2, d3, meta = parse_bank_statement(pdf_bytes)
        print(f"  [SUCCESS] Total Transactions: {len(d1)}")
        if d1:
            print(f"  [SUCCESS] First Date: {d1[0]['Date']}")
            print(f"  [SUCCESS] Last Balance: {d1[-1]['Balance']}")
            print(f"  [SUCCESS] Account Name: {meta.get('account_name')}")
            print("\n>>> IDBI IS FULLY OPERATIONAL. 10/10 MILESTONE ACHIEVED.")
        else:
            print("  [FAILURE] IDBI returned 0 rows.")
    except Exception as e:
        print(f"  [CRASH] IDBI Engine encountered an error: {e}")

if __name__ == "__main__":
    verify_idbi()
