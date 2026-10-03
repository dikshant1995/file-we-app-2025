import pypdf
import openpyxl
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

folder = r"C:\Users\user\OneDrive\Desktop\company category"
pdf_path = os.path.join(folder, "Piramal Company list.pdf")
excel_out_path = os.path.join(folder, "Piramal Company list.xlsx")

print("==========================================================================")
print("📌 FULL 100% CONVERSION: 'Piramal Company list.pdf' TO EXCEL (.xlsx)")
print("==========================================================================\n")

if not os.path.exists(pdf_path):
    print(f"Error: PDF file not found at {pdf_path}")
    sys.exit(1)

reader = pypdf.PdfReader(pdf_path)
print(f"Total Pages in PDF: {len(reader.pages)}")

records = []
categories = ['CAT A', 'CAT B', 'CAT C', 'ELITE', 'GOVT']

for page_idx, page in enumerate(reader.pages):
    text = page.extract_text()
    if not text:
        continue
    lines = text.split('\n')
    for line in lines:
        line_str = line.strip()
        if not line_str or 'Proposed Company Category' in line_str or '# of Companies' in line_str or 'Grand Total' in line_str or 'Company Name CIN' in line_str:
            continue
        
        # Check which category ends the line
        found_cat = None
        for cat in ['CAT A', 'CAT B', 'CAT C', 'ELITE', 'GOVT']:
            if line_str.endswith(cat):
                found_cat = cat
                break
        
        if found_cat:
            content = line_str[:-len(found_cat)].strip()
            # Check for CIN (21 chars like U50400MH2018PTC307759 or F01452)
            cin_match = re.search(r'\b([ULF]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}|F\d{5}|F\d{4}|L\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6})\b', content)
            if cin_match:
                comp_name = content[:cin_match.start()].strip()
                cin_val = cin_match.group(1).strip()
            else:
                comp_name = content
                cin_val = ""
            
            if comp_name:
                records.append((comp_name, cin_val, found_cat))

print(f"Total Companies Extracted: {len(records):,}")

# Write to Excel
wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Piramal Company List"
ws.append(["Sr.No", "Company Name", "CIN / LLPIN", "Category"])

for idx, (comp, cin, cat) in enumerate(records, 1):
    ws.append([idx, comp, cin, cat])

wb.save(excel_out_path)
wb.close()

print(f"\n✅ Saved complete Excel file: {excel_out_path}")
