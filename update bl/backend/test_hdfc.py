import os
from pdf_extractor import parse_bank_statement

def test_hdfc_extraction():
    # HDFC test files found in workspace
    test_files = [
        r"d:\update bl\till uco 1\Acct Statement_XX7958_24082023.pdf",
        r"d:\update bl\till uco 1\Acct Statement_XX9619_26112025 (2).pdf"
    ]
    
    for file_path in test_files:
        if not os.path.exists(file_path):
            print(f"Skipping {file_path}, not found.")
            continue
            
        print(f"\n--- Testing Extraction for: {os.path.basename(file_path)} ---")
        try:
            with open(file_path, "rb") as f:
                pdf_bytes = f.read()
            
            result = parse_bank_statement(pdf_bytes)
            
            metadata = result.get("metadata", {})
            print(f"Customer Name: {metadata.get('account_name')}")
            print(f"Account Type: {metadata.get('account_type')}")
            
            dataset_1 = result.get("dataset_1", [])
            print(f"Total Transactions Found: {len(dataset_1)}")
            
            if dataset_1:
                print("First 3 Transactions:")
                for i, row in enumerate(dataset_1[:3]):
                    print(f"  {i+1}. Date: {row['Date']}, Dr: {row['Dr']}, Cr: {row['Cr']}, Bal: {row['Balance']}")
                
                # Check for Narration quality
                dataset_2 = result.get("dataset_2", [])
                if dataset_2:
                    print("First 3 Narrations:")
                    for i, row in enumerate(dataset_2[:3]):
                        print(f"  {i+1}. {row['Narration']}")
            
        except Exception as e:
            print(f"Error extracting {file_path}: {e}")

if __name__ == "__main__":
    test_hdfc_extraction()
