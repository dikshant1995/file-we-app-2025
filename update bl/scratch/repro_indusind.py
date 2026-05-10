
import os
import sys

# Add backend to path
sys.path.append(r"d:\update bl\bank abb latest bl\till uco 1\backend")

from pdf_extractor import parse_bank_statement

pdf_path = r"d:\update bl\bank abb latest bl\till uco 1\indusind bank new pdf.pdf"

if not os.path.exists(pdf_path):
    print(f"PDF not found at {pdf_path}")
    sys.exit(1)

with open(pdf_path, "rb") as f:
    pdf_bytes = f.read()

ds1, ds2, ds3, meta = parse_bank_statement(pdf_bytes)

print(f"Bank Identified: {meta.get('bank', 'Unknown')}")
print(f"Metadata: {meta}")
print("\nFirst 5 rows of DS1 (Financial):")
for r in ds1[:5]:
    print(r)

# Check for swapped Dr/Cr if possible
# If the first row is a withdrawal (decreasing balance), Dr should be > 0.
if len(ds1) > 1:
    first = ds1[0]
    second = ds1[1]
    # In Descending order (which we think it might be returning now due to bug):
    # If first is newer, second is older.
    # But ds1 is supposedly chronological (Ascending).
    # If ds1[0] is oldest, ds1[1] is next.
    # Balance trend:
    if ds1[1]['Balance'] > ds1[0]['Balance']:
        # Balance increased -> Cr should be > 0.
        if ds1[1]['Cr'] > 0:
            print("\nAnalysis: Balance increased, Credit assigned. (Correct for Ascending)")
        else:
            print("\nAnalysis: Balance increased, but NO Credit assigned! (ERROR)")
    else:
        # Balance decreased -> Dr should be > 0.
        if ds1[1]['Dr'] > 0:
            print("\nAnalysis: Balance decreased, Debit assigned. (Correct for Ascending)")
        else:
            print("\nAnalysis: Balance decreased, but NO Debit assigned! (ERROR)")

