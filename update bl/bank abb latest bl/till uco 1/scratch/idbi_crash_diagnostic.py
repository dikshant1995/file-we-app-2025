import io
import os
import sys
import traceback
# Ensure we can import from the backend
sys.path.append(os.getcwd())

def diagnostic_crash_test(pdf_path):
    print(f"\n>>> [DIAGNOSTIC] EXECUTING CRASH TEST ON: {pdf_path}")
    from backend.pdf_extractor import parse_bank_statement
    
    try:
        with open(pdf_path, 'rb') as f:
            pdf_bytes = f.read()
            
        print(">>> Calling parse_bank_statement...")
        res = parse_bank_statement(pdf_bytes)
        print(">>> SUCCESS: Extraction completed without exception.")
        print(f">>> Rows: {len(res[0]) if res else 0}")
        
    except Exception as e:
        print("\n!!! [CRASH DETECTED] !!!")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {str(e)}")
        print("\nTraceback:")
        traceback.print_exc()

if __name__ == "__main__":
    target = r'd:\update bl\bank abb latest bl\till uco 1\idbi limit acc.pdf'
    diagnostic_crash_test(target)
