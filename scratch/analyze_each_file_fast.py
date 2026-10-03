import openpyxl
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\user\OneDrive\Desktop\company category"

files = [
    "Piramal Company list.pdf",
    "axis com cat.xlsx",
    "AXIS FINANCE COM LIST.xlsx",
    "bandhan cat.xlsx",
    "ICICI COM LIST NEW.xlsx",
    "IDFC COMPANY CAT.xlsx",
    "indusind com list.xlsx",
    "KOTAK COM LIST.xlsx",
    "L&T COM LIST.xlsx",
    "poonawala com list.xlsx",
    "ALL COMPANY IN ONE LIST.xlsx"
]

print("==========================================================================", flush=True)
print("📌 DETAILED ANALYSIS OF ALL 11 FILES IN 'company category' FOLDER", flush=True)
print("==========================================================================\n", flush=True)

# 1. Analyze PDF File
pdf_path = os.path.join(folder, "Piramal Company list.pdf")
if os.path.exists(pdf_path):
    print("--------------------------------------------------------------------------", flush=True)
    print("📁 [FILE 1/11] Piramal Company list.pdf", flush=True)
    print("--------------------------------------------------------------------------", flush=True)
    try:
        import pypdf
        reader = pypdf.PdfReader(pdf_path)
        print(f"Total PDF Pages: {len(reader.pages)}", flush=True)
        # Extract text sample from first 5 pages
        first_text = ""
        categories_found = set()
        for i in range(min(10, len(reader.pages))):
            t = reader.pages[i].extract_text()
            first_text += t + "\n"
        print(f"Sample Text Preview:\n{first_text[:500]}...", flush=True)
    except Exception as e:
        print(f"Error analyzing Piramal PDF: {e}", flush=True)

# 2. Analyze Excel files one by one
for idx, fname in enumerate(files[1:], 2):
    fpath = os.path.join(folder, fname)
    print("\n--------------------------------------------------------------------------", flush=True)
    print(f"📁 [FILE {idx}/11] {fname}", flush=True)
    print("--------------------------------------------------------------------------", flush=True)
    if not os.path.exists(fpath):
        print("File not found!", flush=True)
        continue
    
    try:
        wb = openpyxl.load_workbook(fpath, data_only=True, read_only=True)
        print(f"Sheet names: {wb.sheetnames}", flush=True)
        for sname in wb.sheetnames:
            ws = wb[sname]
            header = None
            col_samples = {}
            unique_cats = set()
            count = 0
            
            for row in ws.iter_rows(values_only=True):
                if not any(row):
                    continue
                row_str = [str(c).strip() if c is not None else "" for c in row]
                if header is None:
                    header = row_str
                    continue
                count += 1
                if count <= 5:
                    col_samples[count] = row_str[:6]
                
                # Check column indices for category
                for cell in row_str:
                    if cell in ['CAT A', 'CAT B', 'CAT C', 'CAT D', 'Super A', 'Super A+', 'CAT A+', 'CAT G', 'Government', 'Open Market', 'ACE PLUS', 'ACE', 'PREFERRED', 'STANDARD', 'NEGATIVE', 'CAT A1', 'CAT A2', 'CAT A3', 'Listed', 'Unlisted', 'GOVT']:
                        unique_cats.add(cell)
                    elif len(cell) < 25 and ('CAT' in cell.upper() or 'TIER' in cell.upper() or 'ACE' in cell.upper() or 'GOVT' in cell.upper() or 'SUPER' in cell.upper() or 'GRADE' in cell.upper()):
                        unique_cats.add(cell)
            
            print(f"  • Sheet '{sname}': {count:,} records", flush=True)
            print(f"  • Headers: {header[:8]}", flush=True)
            print(f"  • Sample Rows (First 3):", flush=True)
            for k in range(1, min(4, len(col_samples) + 1)):
                print(f"     Row {k}: {col_samples[k]}", flush=True)
            print(f"  • Categories / Tiers Found ({len(unique_cats)} distinct):", flush=True)
            sorted_cats = sorted(list(unique_cats))
            print(f"     {sorted_cats[:30]}", flush=True)
        wb.close()
    except Exception as e:
        print(f"Error processing {fname}: {e}", flush=True)

