import re
import os

def list_bank_functions():
    path = r'd:\update bl\bank abb latest bl\till uco 1\backend\pdf_extractor.py'
    if not os.path.exists(path):
        print("Path not found!")
        return
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        funcs = re.findall(r'def (extract_[a-z0-9_]+)\(', content)
        print("\n--- ALL SPECIALIZED BANK FUNCTIONS ---")
        for fn in sorted(funcs):
            print(f" - {fn}")

if __name__ == "__main__":
    list_bank_functions()
