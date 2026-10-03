import openpyxl
import os
import sys
import glob

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\user\OneDrive\Desktop\company category"

print("==================================================")
print("COMPREHENSIVE COMPANY CATEGORY ANALYSIS REPORT")
print("==================================================\n")

# 1. Analyze PDF File (Piramal Company List)
pdf_path = os.path.join(folder, "Piramal Company list.pdf")
if os.path.exists(pdf_path):
    print("--------------------------------------------------")
    print("FILE 1: Piramal Company list.pdf (PDF Document)")
    print("--------------------------------------------------")
    try:
        import pypdf
        reader = pypdf.PdfReader(pdf_path)
        print(f"Total Pages in PDF: {len(reader.pages)}")
        sample_text = ""
        for pno in range(min(5, len(reader.pages))):
            sample_text += f"\n--- Page {pno+1} ---\n" + reader.pages[pno].extract_text()[:600]
        print(f"Sample PDF Text Preview:\n{sample_text[:1200]}")
    except Exception as e:
        print(f"Error reading Piramal PDF: {e}")

# 2. Analyze Excel Files
excel_files = [
    "ALL COMPANY IN ONE LIST.xlsx",
    "axis com cat.xlsx",
    "AXIS FINANCE COM LIST.xlsx",
    "bandhan cat.xlsx",
    "ICICI COM LIST NEW.xlsx",
    "IDFC COMPANY CAT.xlsx",
    "indusind com list.xlsx",
    "KOTAK COM LIST.xlsx",
    "L&T COM LIST.xlsx",
    "poonawala com list.xlsx"
]

for idx, fname in enumerate(excel_files, 2):
    fpath = os.path.join(folder, fname)
    if not os.path.exists(fpath):
        print(f"File not found: {fname}")
        continue
    print("\n--------------------------------------------------")
    print(f"FILE {idx}: {fname}")
    print("--------------------------------------------------")
    try:
        wb = openpyxl.load_workbook(fpath, data_only=True, read_only=True)
        print(f"Sheets in Workbook: {wb.sheetnames}")
        for sname in wb.sheetnames:
            ws = wb[sname]
            header = None
            category_col_idx = None
            all_cat_values = set()
            total_rows = 0
            
            for r_idx, row in enumerate(ws.iter_rows(values_only=True)):
                if not any(row):
                    continue
                row_str = [str(c).strip() if c is not None else "" for c in row]
                if header is None:
                    header = row_str
                    # Look for category column index
                    for c_idx, h in enumerate(header):
                        h_lower = h.lower()
                        if "cat" in h_lower or "tier" in h_lower or "grade" in h_lower or "status" in h_lower or "classification" in h_lower or "list" in h_lower:
                            category_col_idx = c_idx
                            break
                    if category_col_idx is None:
                        category_col_idx = 2 if len(header) > 2 else 1
                else:
                    total_rows += 1
                    # Collect all column non-empty values for category discovery
                    for c_idx, val in enumerate(row_str):
                        if val and len(val) <= 40 and not val.isdigit() and len(val) > 0:
                            pass
                    if category_col_idx is not None and category_col_idx < len(row_str):
                        val = row_str[category_col_idx].strip()
                        if val and val != header[category_col_idx]:
                            all_cat_values.add(val)
            
            print(f"Sheet '{sname}': Total Company Records = {total_rows}")
            print(f"Header Columns: {header[:8]}")
            print(f"Detected Category Column ({category_col_idx}): {header[category_col_idx] if category_col_idx is not None and category_col_idx < len(header) else 'N/A'}")
            sorted_cats = sorted(list(all_cat_values))
            print(f"Unique Category Values ({len(sorted_cats)} items): {sorted_cats[:30]}")
        wb.close()
    except Exception as e:
        print(f"Error reading {fname}: {e}")

