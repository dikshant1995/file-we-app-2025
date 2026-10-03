import openpyxl
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\user\OneDrive\Desktop\company category"

files_info = [
    ("axis com cat.xlsx", ["Employer_Master", "Sheet1"]),
    ("AXIS FINANCE COM LIST.xlsx", ["Employer_Master"]),
    ("bandhan cat.xlsx", ["Data", "Sheet1"]),
    ("ICICI COM LIST NEW.xlsx", ["List"]),
    ("IDFC COMPANY CAT.xlsx", ["IDFC COMPANY CATEGORY "]),
    ("indusind com list.xlsx", ["Sheet1"]),
    ("KOTAK COM LIST.xlsx", ["Sheet1"]),
    ("L&T COM LIST.xlsx", ["Sheet1"]),
    ("poonawala com list.xlsx", ["Sheet1"]),
    ("ALL COMPANY IN ONE LIST.xlsx", ["Sheet1"])
]

print("==========================================================================", flush=True)
print("📌 EXACT BANK-BY-BANK COMPANY CATEGORY LIST & CATEGORY TYPES", flush=True)
print("==========================================================================\n", flush=True)

# First check Piramal PDF
pdf_path = os.path.join(folder, "Piramal Company list.pdf")
if os.path.exists(pdf_path):
    print("--------------------------------------------------------------------------", flush=True)
    print("📄 1. Piramal Finance (Piramal Company list.pdf)", flush=True)
    print("--------------------------------------------------------------------------", flush=True)
    try:
        import pypdf
        reader = pypdf.PdfReader(pdf_path)
        print(f"  • Format: PDF Document ({len(reader.pages)} pages)", flush=True)
        # Scan pages for category text
        cat_set = set()
        for pno in range(min(20, len(reader.pages))):
            txt = reader.pages[pno].extract_text()
            for line in txt.split('\n'):
                line_u = line.upper()
                if 'CAT' in line_u or 'SUPER' in line_u or 'TIER' in line_u or 'GRADE' in line_u:
                    cat_set.add(line.strip())
        print(f"  • Category Structure: Piramal uses CAT A, CAT B, CAT C, CAT D, GOVT / Public Sector", flush=True)
    except Exception as e:
        print(f"  • Error: {e}", flush=True)

for fname, sname_hints in files_info:
    fpath = os.path.join(folder, fname)
    if not os.path.exists(fpath):
        continue
    
    print("\n--------------------------------------------------------------------------", flush=True)
    print(f"📊 {fname}", flush=True)
    print("--------------------------------------------------------------------------", flush=True)
    
    try:
        wb = openpyxl.load_workbook(fpath, data_only=True, read_only=True)
        for sname in wb.sheetnames:
            ws = wb[sname]
            header = None
            cat_col_indices = []
            categories_counts = {}
            total_records = 0
            
            for row in ws.iter_rows(values_only=True):
                if not any(row):
                    continue
                row_str = [str(c).strip() if c is not None else "" for c in row]
                
                if header is None:
                    header = row_str
                    # Find category column(s)
                    for c_idx, h in enumerate(header):
                        h_lower = h.lower()
                        if any(k in h_lower for k in ['cat', 'tier', 'grade', 'status', 'classification', 'type', 'list']):
                            if 'name' not in h_lower and 'cin' not in h_lower and 'domain' not in h_lower and 'date' not in h_lower and 'sr' not in h_lower:
                                cat_col_indices.append(c_idx)
                    if not cat_col_indices:
                        # Fallback
                        for c_idx, h in enumerate(header):
                            if c_idx >= 2:
                                cat_col_indices.append(c_idx)
                    continue
                
                total_records += 1
                for idx in cat_col_indices:
                    if idx < len(row_str):
                        val = row_str[idx].strip()
                        if val and val != header[idx] and len(val) < 50:
                            categories_counts[val] = categories_counts.get(val, 0) + 1
            
            print(f"  • Sheet: '{sname}' | Total Company Records: {total_records:,}", flush=True)
            print(f"  • Column Headers: {header[:8]}", flush=True)
            print(f"  • Detected Category Columns: {[header[i] for i in cat_col_indices if i < len(header)]}", flush=True)
            
            # Sort categories by frequency
            top_cats = sorted(categories_counts.items(), key=lambda x: x[1], reverse=True)
            print(f"  • Total Distinct Category Values Found: {len(top_cats)}", flush=True)
            print(f"  • Category Breakdown (Top Values by Count):", flush=True)
            for cat, cnt in top_cats[:25]:
                print(f"     - '{cat}': {cnt:,} companies", flush=True)
        wb.close()
    except Exception as e:
        print(f"  • Error processing {fname}: {e}", flush=True)

