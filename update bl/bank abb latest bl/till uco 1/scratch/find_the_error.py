import os
import sys
import traceback
# Ensure we can import from the backend
sys.path.append(os.getcwd())
from backend.pdf_extractor import parse_bank_statement

def find_the_error():
    targets = [
        'idbi limit acc.pdf',
        'StatementMon Feb 10 13_30_18 GMT+05_30 2025 (2).pdf'
    ]
    
    for filename in targets:
        print(f"\n{'='*60}")
        print(f"TESTING FILE: {filename}")
        print(f"{'='*60}")
        
        try:
            with open(filename, 'rb') as f:
                pdf_bytes = f.read()
            
            print(">>> Calling parse_bank_statement...")
            dataset_1, dataset_2, dataset_3, metadata = parse_bank_statement(pdf_bytes)
            print(f">>> SUCCESS: Extracted {len(dataset_1)} rows.")
            print(f">>> Metadata: {metadata}")
            
        except Exception as e:
            print(f"\n!!! [CRASH DETECTED] in {filename} !!!")
            print(f"Error Type: {type(e).__name__}")
            print(f"Error Message: {str(e)}")
            print("\nTraceback:")
            traceback.print_exc()

if __name__ == "__main__":
    find_the_error()
