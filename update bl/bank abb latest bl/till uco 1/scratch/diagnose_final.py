import sys
import os
import importlib

# Ensure the correct backend path is prioritized
backend_path = r'd:\update bl\bank abb latest bl\till uco 1\backend'
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

import pdf_extractor
importlib.reload(pdf_extractor)

from pdf_extractor import parse_bank_statement
print(f">>> [IMPORT_PATH] {pdf_extractor.__file__}")

pdf_path = r'd:\update bl\bank abb latest bl\till uco 1\IDFC TESTNG.pdf'
with open(pdf_path, 'rb') as f:
    pdf_bytes = f.read()

d1, d2, d3, meta = parse_bank_statement(pdf_bytes)
print(f"\n--- Final Audit Results ---")
print(f"Total Rows Found: {len(d1)}")
if d1:
    print(f"Last Row: {d1[-1]}")
