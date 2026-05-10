import pdfplumber
import sys
import os

# Mock the parse_date and clean_amount if needed, or just import them
sys.path.append(r'd:\update bl\bank abb latest bl\till uco 1\backend')
from pdf_extractor import parse_date, clean_amount

pdf_path = r'd:\update bl\bank abb latest bl\till uco 1\IDFC TESTNG.pdf'

with pdfplumber.open(pdf_path) as pdf:
    for i, page in enumerate(pdf.pages):
        print(f"--- Debugging Page {i+1} ---")
        words = page.extract_words()
        if not words: continue
        
        table_top_y = 0
        page_lines, current_line, last_y = [], [], -1
        sorted_words = sorted(words, key=lambda x: (x['top'], x['x0']))
        for w in sorted_words:
            if last_y == -1 or abs(w['top'] - last_y) < 3.5: current_line.append(w)
            else:
                page_lines.append(current_line); current_line = [w]
            last_y = w['top']
        if current_line: page_lines.append(current_line)
        
        found_header = False
        for lw in page_lines:
            line_txt = " ".join([w['text'] for w in lw]).upper()
            if "TRANSACTION" in line_txt and "PARTICULARS" in line_txt and "BALANCE" in line_txt:
                table_top_y = lw[0]['bottom'] + 2
                print(f"Header found at y={table_top_y}")
                found_header = True
                break
        
        if not found_header:
            print("HEADER NOT FOUND on this page")
        
        # Check first few rows
        row_count = 0
        for lw in page_lines:
            if lw[0]['top'] < table_top_y: continue
            line_txt = " ".join([w['text'] for w in lw])
            if "Jan-2025" in line_txt:
                row_count += 1
                if row_count <= 2:
                    print(f"Match candidate row: {line_txt} (top={lw[0]['top']})")
        
        print(f"Page {i+1} row count (Jan-2025 only): {row_count}")
