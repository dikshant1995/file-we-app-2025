import re

def find_expert_rules():
    path = r'd:\update bl\bank abb latest bl\till uco 1\backend\pdf_extractor.py'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    print("\n--- EXPERT RULE SEARCH (Axis, IndusInd, BOM) ---")
    
    # 1. Search for Axis
    axis_matches = re.findall(r'.{0,50}AXIS.{0,50}', content, re.IGNORECASE)
    print(f"Axis Matches Found: {len(axis_matches)}")
    for m in axis_matches:
        print(f" - {m.strip()}")

    # 2. Extract IndusInd Metadata Rule
    indus_match = re.search(r'def extract_indusind_statement.*?metadata = \{(.*?)\}', content, re.DOTALL)
    if indus_match:
        print(f"\nIndusInd Metadata Ref: {indus_match.group(1).strip()}")

if __name__ == "__main__":
    find_expert_rules()
