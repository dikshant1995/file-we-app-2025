
import pdfplumber
import re

pdf_path = r'd:\update bl\bank abb latest bl\till uco 1\indusind bank new pdf.pdf'
date_regex = re.compile(r'\b(?:\d{4}|\d{1,2})[/\-\.\s]+(?:\d{1,2}|[A-Za-z]{3,9})[/\-\.\s]+(?:\d{4}|\d{1,2})\b')

def count_dates():
    total_dates = 0
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                # Count lines starting with a date part or containing a full date
                # In IndusInd, many rows start with YYYY-
                lines = text.split('\n')
                for line in lines:
                    if re.search(r'^\d{4}-', line.strip()) or date_regex.search(line):
                        total_dates += 1
    print(f"Total potential transaction lines found in PDF: {total_dates}")

if __name__ == "__main__":
    count_dates()
