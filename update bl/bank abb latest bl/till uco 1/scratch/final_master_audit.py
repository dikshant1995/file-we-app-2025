import sys
import os
import pdfplumber
import json
import re

# Force load the backend
sys.path.append(r'd:\update bl\bank abb latest bl\till uco 1\backend')
import pdf_extractor
import importlib
importlib.reload(pdf_extractor)
from pdf_extractor import parse_bank_statement, UniversalStatementBrain

def run_head_to_head(name, path, schema_name):
    print(f"\n--- [AUDIT] {name} ---")
    print(f"File: {os.path.basename(path)}")
    
    with open(path, 'rb') as f:
        pdf_bytes = f.read()

    # Pass 1: Universal Brain Result
    with pdfplumber.open(path) as pdf:
        brain = UniversalStatementBrain(pdf)
        brain.detect_layout()
        ub_res = brain.extract()
        ub_rows = ub_res["ds3"]

    # Pass 2: Schema Result (Triggering via parse_bank_statement)
    # We use the dispatcher to see if it catches the specialized schema
    s_rows_d1, s_rows_d2, s_rows_d3, meta = parse_bank_statement(pdf_bytes)
    
    print(f"| Metric       | Universal Brain | Specialized Schema | Match? |")
    print(f"|--------------|-----------------|--------------------|--------|")
    print(f"| Row Count    | {len(ub_rows):<15} | {len(s_rows_d3):<18} | {'YES' if len(ub_rows) == len(s_rows_d3) else 'NO'}    |")
    
    ub_dr = sum(r['Dr'] for r in ub_rows)
    s_dr = sum(r['Dr'] for r in s_rows_d3)
    print(f"| Total Debit  | {ub_dr:<15.2f} | {s_dr:<18.2f} | {'YES' if abs(ub_dr - s_dr) < 1 else 'NO'}    |")

    ub_cr = sum(r['Cr'] for r in ub_rows)
    s_cr = sum(r['Cr'] for r in s_rows_d3)
    print(f"| Total Credit | {ub_cr:<15.2f} | {s_cr:<18.2f} | {'YES' if abs(ub_cr - s_cr) < 1 else 'NO'}    |")
    
    # Accuracy Score
    if len(s_rows_d3) > 0:
        accuracy = min(len(ub_rows), len(s_rows_d3)) / max(len(ub_rows), len(s_rows_d3)) * 100
        print(f"Consistency Score: {accuracy:.1f}%")

# Test Bench Configuration
bench = [
    ("AXIS Pattern 1", r'd:\update bl\bank abb latest bl\till uco 1\AXIS 1.pdf'),
    ("AXIS Pattern 2", r'd:\update bl\bank abb latest bl\till uco 1\AXIS 2.pdf'),
    ("AU Pattern 1", r'd:\update bl\bank abb latest bl\till uco 1\AU 1.pdf'),
    ("AU Pattern 2", r'd:\update bl\bank abb latest bl\till uco 1\AU 2.pdf'),
    ("SBI Pattern 2", r'd:\update bl\bank abb latest bl\till uco 1\SBI 2.pdf'),
    ("IndusInd Pattern 1", r'd:\update bl\bank abb latest bl\till uco 1\INDUSIND 1.pdf'),
    ("IndusInd Pattern 2", r'd:\update bl\bank abb latest bl\till uco 1\indusind bank new pdf.pdf'),
    ("ICICI Detailed", r'd:\update bl\bank abb latest bl\till uco 1\icici 1.pdf'),
    ("HDFC Standard", r'd:\update bl\bank abb latest bl\till uco 1\hdfc.pdf'),
    ("BOM Standard", r'd:\update bl\bank abb latest bl\till uco 1\BOM TESTING.pdf')
]

for name, path in bench:
    try:
        run_head_to_head(name, path, "AUTODETECT")
    except Exception as e:
        print(f"FAILED {name}: {e}")
