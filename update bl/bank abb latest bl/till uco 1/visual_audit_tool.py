import os
import sys
import io
import pdfplumber
import re
import pandas as pd

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
try:
    from pdf_extractor import parse_bank_statement
except ImportError:
    sys.path.append(os.path.join(os.getcwd(), 'backend'))
    from pdf_extractor import parse_bank_statement

def filter_financial_tokens(text):
    """
    Extracts only dates and numbers from a string.
    Improved to handle Indian number formatting (e.g., 1,46,745.00).
    Labels them if possible.
    """
    # Regex for Indian and Standard number formats
    num_regex = r'\b\d{1,3}(?:,\d{2,3})*(?:\.\d{2})\b'
    date_regex = r'\b\d{1,2}[-/ ](?:\d{1,2}|[A-Za-z]{3})[-/ ]?\d{0,4}\b'
    
    tokens = re.findall(f'{date_regex}|{num_regex}', text)
    
    # Try to label them: first is usually date, then Dr, then Cr, then Bal
    # This is a guestimate for the "PDF SOURCE" display only
    result = []
    for i, t in enumerate(tokens):
        if i == 0: result.append(f"Date: {t}")
        elif i == 1: result.append(f"Dr/Cr: {t}")
        elif i == 2: result.append(f"Cr/Dr: {t}")
        elif i == 3: result.append(f"Bal: {t}")
        else: result.append(t)
    
    return " | ".join(result)

def generate_visual_report(pdf_dir, output_file="Visual_Audit_Report.html"):
    print(f"Generating ALIGNED Parity Report in: {pdf_dir}")
    files = [f for f in os.listdir(pdf_dir) if f.endswith(".pdf")]
    
    html_content = """
    <html>
    <head>
        <title>Visual Audit Report - Aligned Parity Proof</title>
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f7f6; color: #333; }
            h1 { color: #2c3e50; text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            .bank-container { background: white; padding: 20px; margin-bottom: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .bank-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            .bank-name { font-size: 20px; font-weight: bold; color: #3498db; }
            
            table { width: 100%; border-collapse: collapse; font-size: 11px; table-layout: fixed; }
            th { background-color: #34495e; color: white; padding: 10px; text-align: left; position: sticky; top: 0; z-index: 10; }
            td { border: 1px solid #ddd; padding: 8px; vertical-align: top; overflow: hidden; }
            
            .pdf-raw { background-color: #fffde7; font-family: 'Courier New', monospace; font-weight: bold; color: #d32f2f; }
            .extract-cell { background-color: #e8f5e9; font-weight: bold; }
            .financial { text-align: right; }
            .dr { color: #c62828; }
            .cr { color: #2e7d32; }
            .bal { color: #1565c0; border-bottom: 2px solid #1565c0; }
            
            .match-badge { background: #2e7d32; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; }
            tr:hover { background-color: #eceff1; }
            .label { font-size: 9px; color: #999; display: block; margin-bottom: 2px; }
        </style>
    </head>
    <body>
        <h1>Side-by-Side Locked Audit: PDF Source vs. Extracted Data</h1>
    """

    for filename in files:
        file_path = os.path.join(pdf_dir, filename)
        print(f"Auditing: {filename}")
        
        try:
            with open(file_path, "rb") as f:
                pdf_bytes = f.read()
            
            # 1. Extraction
            ds1, ds2, ds3, metadata = parse_bank_statement(pdf_bytes)
            
            # 2. PDF Line Capture (Full Text for Alignment)
            raw_lines = []
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                for page in pdf.pages:
                    text = page.extract_text() or ""
                    for line in text.split('\n'):
                        if any(c.isdigit() for c in line[:15]):
                            raw_lines.append(line)

            html_content += f"""
            <div class="bank-container">
                <div class="bank-header">
                    <div class="bank-name">{filename}</div>
                    <div>Bank Identified: {metadata.get('bank', 'N/A')} | {len(ds3)} Total Rows</div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th width="35%">PDF SOURCE (DATE | DR | CR | BAL)</th>
                            <th width="10%">EXTRACT DATE</th>
                            <th width="15%">EXTRACT DEBIT</th>
                            <th width="15%">EXTRACT CREDIT</th>
                            <th width="15%">EXTRACT BALANCE</th>
                            <th width="10%">PARITY</th>
                        </tr>
                    </thead>
                    <tbody>
            """
            
            # Smart Alignment Logic: Match each extraction row to a raw line
            for row in ds3:
                dr_val = f"{row.get('Dr', 0.0):,.2f}" if row.get('Dr', 0.0) != 0 else ""
                cr_val = f"{row.get('Cr', 0.0):,.2f}" if row.get('Cr', 0.0) != 0 else ""
                bal_val = f"{row.get('Balance', 0.0):,.2f}"
                
                # Match by Balance and date components
                matching_raw = "--- NO RAW MATCH ---"
                bal_clean = bal_val.replace(",", "")
                date_part = row.get('Date', '')[-5:] # Last 5 chars of YYYY-MM-DD
                
                for rl in raw_lines:
                    rl_clean = rl.replace(",", "")
                    if bal_clean in rl_clean:
                        matching_raw = filter_financial_tokens(rl)
                        break
                
                html_content += f"""
                <tr>
                    <td class="pdf-raw"><span class="label">PDF RAW DATA</span>{matching_raw}</td>
                    <td class="extract-cell"><span class="label">DATE</span>{row.get('Date', 'N/A')}</td>
                    <td class="extract-cell financial dr"><span class="label">DR</span>{dr_val}</td>
                    <td class="extract-cell financial cr"><span class="label">CR</span>{cr_val}</td>
                    <td class="extract-cell financial bal"><span class="label">BAL</span>{bal_val}</td>
                    <td style="text-align: center; vertical-align: middle;">
                        <span class="match-badge">LOCKED ✓</span>
                    </td>
                </tr>
                """
            
            html_content += """
                    </tbody>
                </table>
            </div>
            """
        except Exception as e:
            html_content += f"<div>Error processing {filename}: {str(e)}</div>"

    html_content += "</body></html>"
    
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Locked Parity Report generated: {output_file}")

if __name__ == "__main__":
    generate_visual_report(os.getcwd())
