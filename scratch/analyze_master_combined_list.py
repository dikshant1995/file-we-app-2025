import openpyxl
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

fpath = r"C:\Users\user\OneDrive\Desktop\company category\ALL COMPANY IN ONE LIST.xlsx"

print("==========================================================================")
print("📌 DETAILED ANALYSIS OF 'ALL COMPANY IN ONE LIST.xlsx'")
print("==========================================================================\n")

if not os.path.exists(fpath):
    print("File not found!")
    sys.exit(1)

wb = openpyxl.load_workbook(fpath, data_only=True, read_only=True)
ws = wb['Sheet1']

header = None
bank_col_idx = None
cat_col_idx = None
comp_col_idx = None

bank_categories_map = {} # { bank_name: { category_name: count } }
total_records = 0

for row in ws.iter_rows(values_only=True):
    if not any(row):
        continue
    row_str = [str(c).strip() if c is not None else "" for c in row]
    
    if header is None:
        header = row_str
        print(f"Header Columns: {header}\n")
        for idx, col_name in enumerate(header):
            col_lower = col_name.lower()
            if 'bank' in col_lower:
                bank_col_idx = idx
            elif 'cat' in col_lower:
                cat_col_idx = idx
            elif 'name' in col_lower or 'company' in col_lower:
                comp_col_idx = idx
        
        if bank_col_idx is None:
            bank_col_idx = 2
        if cat_col_idx is None:
            cat_col_idx = 1
        continue
    
    total_records += 1
    bank_name = row_str[bank_col_idx] if bank_col_idx < len(row_str) and row_str[bank_col_idx] else "Unknown Bank"
    category_val = row_str[cat_col_idx] if cat_col_idx < len(row_str) and row_str[cat_col_idx] else "Uncategorized"
    
    if bank_name not in bank_categories_map:
        bank_categories_map[bank_name] = {}
    
    bank_categories_map[bank_name][category_val] = bank_categories_map[bank_name].get(category_val, 0) + 1

wb.close()

print(f"Total Companies in Master List: {total_records:,}")
print(f"Total Partner Banks Identified: {len(bank_categories_map)}\n")

print("==========================================================================")
print("🏛️ BANK-BY-BANK SPECIFIC CATEGORY BREAKDOWN IN MASTER LIST")
print("==========================================================================\n")

for bname, cat_dict in sorted(bank_categories_map.items()):
    bank_total = sum(cat_dict.values())
    print(f"🏦 BANK: {bname} (Total Companies: {bank_total:,})")
    sorted_cats = sorted(cat_dict.items(), key=lambda x: x[1], reverse=True)
    for cat_name, cnt in sorted_cats:
        print(f"   - Category '{cat_name}': {cnt:,} companies")
    print("-" * 60)

