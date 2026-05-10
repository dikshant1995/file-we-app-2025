import sys
import os
import io
import re
import pdfplumber
from datetime import datetime

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from pdf_extractor import parse_bank_statement

def generate_visual_audit():
    pdf_dir = "d:/update bl/bank abb latest bl/till uco 1"
    pdf_files = [f for f in os.listdir(pdf_dir) if f.lower().endswith('.pdf')]
    
    html_content = """
    <html>
    <head>
        <title>V11.0 Visual Parity Audit Report</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #1a1a2e; color: #e1e1e1; padding: 40px; }
            h1 { color: #4ecca3; text-align: center; border-bottom: 2px solid #4ecca3; padding-bottom: 10px; }
            .bank-section { background: #16213e; border-radius: 12px; padding: 25px; margin-bottom: 50px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid #0f3460; }
            .bank-title { font-size: 24px; color: #4ecca3; margin-bottom: 15px; display: flex; justify-content: space-between; }
            .comparison-container { display: flex; gap: 20px; }
            .pdf-view { flex: 1; background: #fff; color: #333; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 11px; white-space: pre-wrap; height: 500px; overflow-y: auto; }
            .excel-view { flex: 1; background: #0f3460; padding: 15px; border-radius: 8px; height: 500px; overflow-y: auto; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #4ecca3; color: #1a1a2e; padding: 8px; text-align: left; position: sticky; top: 0; }
            td { padding: 8px; border-bottom: 1px solid #16213e; font-size: 12px; }
            .match-tag { background: #4ecca3; color: #1a1a2e; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; }
            .status-pass { color: #4ecca3; }
            .status-fail { color: #e94560; }
        </style>
    </head>
    <body>
        <h1>V11.0 VISUAL PARITY AUDIT: PDF vs EXCEL</h1>
        <p style="text-align:center">Forensic Comparison of Mathematical and Visual Extraction Results</p>
    """
    
    for pdf_name in pdf_files:
        pdf_path = os.path.join(pdf_dir, pdf_name)
        print(f"Processing Visual Audit for: {pdf_name}")
        
        try:
            with open(pdf_path, 'rb') as f:
                pdf_bytes = f.read()
            
            # 1. Get Extraction Data
            ds1, ds2, ds3, metadata = parse_bank_statement(pdf_bytes)
            
            # 2. Get PDF Visual Sample (First 2 pages of text)
            pdf_sample = ""
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages[:2]:
                    pdf_sample += f"--- PAGE {page.page_number} ---\n"
                    pdf_sample += page.extract_text() + "\n\n"
            
            status_class = "status-pass" if ds3 else "status-fail"
            status_text = "SUCCESS" if ds3 else "FAILED (No Rows)"
            
            html_content += f"""
            <div class="bank-section">
                <div class="bank-title">
                    <span>{pdf_name}</span>
                    <span class="{status_class}">{status_text}</span>
                </div>
                <div class="comparison-container">
                    <div class="pdf-view">
                        <div style="background:#4ecca3; color:#1a1a2e; padding:5px; margin-bottom:10px; font-weight:bold; position:sticky; top:0;">SOURCE PDF (VISUAL EXTRACT)</div>
                        {pdf_sample}
                    </div>
                    <div class="excel-view">
                        <table>
                            <thead>
                                <tr>
                                    <th>DATE</th>
                                    <th>DEBIT</th>
                                    <th>CREDIT</th>
                                    <th>BALANCE</th>
                                    <th>AUDIT</th>
                                </tr>
                            </thead>
                            <tbody>
            """
            
            for i, r in enumerate(ds3[:50]): # Show first 50 rows for proof
                # Math Parity Check for Row
                audit_status = ""
                if i > 0:
                    prev_bal = ds3[i-1]["Balance"]
                    curr_bal = ds3[i]["Balance"]
                    expected = round(prev_bal + r["Cr"] - r["Dr"], 2)
                    if abs(expected - curr_bal) < 0.05:
                        audit_status = '<span class="match-tag">MATCH</span>'
                    else:
                        audit_status = '<span style="color:#e94560">GLITCH</span>'
                
                html_content += f"""
                                <tr>
                                    <td>{r['Date']}</td>
                                    <td>{r['Dr']:.2f}</td>
                                    <td>{r['Cr']:.2f}</td>
                                    <td>{r['Balance']:.2f}</td>
                                    <td>{audit_status}</td>
                                </tr>
                """
            
            if len(ds3) > 50:
                html_content += f'<tr><td colspan="5" style="text-align:center; padding:10px;">... and {len(ds3)-50} more rows ...</td></tr>'
                
            html_content += """
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            """
        except Exception as e:
            html_content += f'<div class="bank-section"><h2 class="status-fail">ERROR PROCESSING {pdf_name}: {str(e)}</h2></div>'
            
    html_content += "</body></html>"
    
    report_path = os.path.join(pdf_dir, "Visual_Audit_Report.html")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    print(f"\nSUCCESS: Visual Audit Report generated at {report_path}")

if __name__ == "__main__":
    generate_visual_audit()
