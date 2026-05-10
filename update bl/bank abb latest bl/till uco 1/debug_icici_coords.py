import pdfplumber
import json
import re

file_path = r"D:\update bl\till uco 1\limit acc icici (1).pdf"

with pdfplumber.open(file_path) as pdf:
    first_page = pdf.pages[0]
    words = first_page.extract_words()
    
    print(f"--- COORDINATE AUDIT for {file_path} ---")
    
    # Let's find words that look like Sl No or Dates
    for w in words:
        if w['top'] > 740 and w['top'] < 750: # Focusing on one row we found
            print(f"Text: '{w['text']}' | x0: {w['x0']:.1f} | x1: {w['x1']:.1f} | rel_x: {((w['x0']+w['x1'])/(2*pdf.pages[0].width)):.3f}")
