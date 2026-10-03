import openpyxl
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

excel_path = r"C:\Users\user\OneDrive\Desktop\company category\KOTAK COM LIST.xlsx"
json_out_path = os.path.join(os.getcwd(), "public", "data", "kotak_companies.json")

print("==========================================================================")
print("📌 BUILDING KOTAK MAHINDRA BANK COMPANY DATABASE JSON")
print("==========================================================================\n")

if not os.path.exists(excel_path):
    print(f"Error: {excel_path} not found!")
    sys.exit(1)

wb = openpyxl.load_workbook(excel_path, data_only=True, read_only=True)
ws = wb['Sheet1']

header = None
comp_idx = 1
cin_idx = 2
cat_idx = 3
ind_idx = 4

kotak_list = []
category_stats = {}

print(f"Reading {excel_path}...", flush=True)

for idx, row in enumerate(ws.iter_rows(values_only=True)):
    if not any(row):
        continue
    row_str = [str(c).strip() if c is not None else "" for c in row]
    
    if header is None:
        header = row_str
        print(f"Header: {header}", flush=True)
        for i, h in enumerate(header):
            hl = h.lower()
            if 'company' in hl or 'name' in hl: comp_idx = i
            elif 'cin' in hl: cin_idx = i
            elif 'cat' in hl: cat_idx = i
            elif 'ind' in hl: ind_idx = i
        continue
    
    comp_name = row_str[comp_idx] if comp_idx < len(row_str) else ""
    cin_val = row_str[cin_idx] if cin_idx < len(row_str) else ""
    cat_val = row_str[cat_idx] if cat_idx < len(row_str) else "CAT B"
    ind_val = row_str[ind_idx] if ind_idx < len(row_str) else ""
    
    if comp_name:
        item = {
            "companyName": comp_name,
            "category": cat_val
        }
        if cin_val:
            item["cin"] = cin_val
        if ind_val:
            item["industry"] = ind_val
            
        kotak_list.append(item)
        category_stats[cat_val] = category_stats.get(cat_val, 0) + 1

wb.close()

print(f"\nExtracted {len(kotak_list):,} total company records for Kotak Mahindra Bank.")
print("\nCategory Distribution:")
for cat, count in sorted(category_stats.items(), key=lambda x: x[1], reverse=True):
    print(f"  • '{cat}': {count:,} companies")

# Write to public/data/kotak_companies.json
os.makedirs(os.path.dirname(json_out_path), exist_ok=True)
print(f"\nWriting to {json_out_path}...", flush=True)

with open(json_out_path, 'w', encoding='utf-8') as f:
    json.dump(kotak_list, f, indent=None) # Compact JSON to save disk space

file_size_mb = os.path.getsize(json_out_path) / (1024 * 1024)
print(f"✅ Successfully written public/data/kotak_companies.json ({file_size_mb:.2f} MB)")
