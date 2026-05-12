from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pdf_extractor import parse_bank_statement
from policy_engine import PolicyEngine
import json
import os
import pandas as pd

app = FastAPI(title="ABB Calculator PDF Parser")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Backend is running"}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
POLICIES_PATH = os.path.join(BASE_DIR, 'policies.json')

@app.get("/api/policies")
def get_policies():
    with open(POLICIES_PATH, 'r') as f:
        return json.load(f)

@app.post("/api/policies")
async def update_policies(policies: list):
    with open(POLICIES_PATH, 'w') as f:
        json.dump(policies, f, indent=4)
    return {"status": "success"}

async def aggregate_pdfs(files: List[UploadFile], password: Optional[str]):
    """
    Helper engine that securely loops over multiple PDFs, parses them with untouched existing engine,
    concatenates results, drops duplicates, and sorts by date.
    """
    all_datasets_1 = []
    all_datasets_2 = []
    all_datasets_3 = []
    master_meta = {"account_name": "Unknown", "account_type": "Unknown"}
    
    for file in files:
        pdf_bytes = await file.read()
        # Call the pristine, untouched parser engine
        d1, d2, d3, meta = parse_bank_statement(pdf_bytes, password)
        
        all_datasets_1.extend(d1)
        all_datasets_2.extend(d2)
        all_datasets_3.extend(d3)
        
        # Retain the strongest metadata from first good parse
        if meta and meta.get("account_name") != "Unknown":
            master_meta = meta

    if not all_datasets_3:
        return [], [], [], master_meta

    # --- The Safe Smart Deduplication & Sorting Engine ---
    # Convert consolidated dataset to Pandas DF
    df = pd.DataFrame(all_datasets_3)
    
    # Safeguard in case column keys differ slightly (though schema is uniform)
    if 'Date' in df.columns:
        # 1. Exact Match Row Deduplication (Eliminate overlapping duplicates safely)
        df = df.drop_duplicates(subset=['Date', 'Narration', 'Dr', 'Cr', 'Balance'], keep='first')
        
        # 2. Chronological Sort
        # Temporary coerce to datetime for strict sorting only
        df['temp_sort_date'] = pd.to_datetime(df['Date'], errors='coerce')
        df = df.sort_values(by='temp_sort_date', ascending=True).drop(columns=['temp_sort_date'])
        
    # Convert cleaned master frame back to list of dicts
    final_d3 = df.to_dict(orient='records')
    
    # Re-derive separate datasets 1 and 2 for compatibility from clean d3
    final_d1 = [{"Date": r.get("Date"), "Dr": r.get("Dr", 0), "Cr": r.get("Cr", 0), "Balance": r.get("Balance", 0)} for r in final_d3]
    final_d2 = [{"Date": r.get("Date"), "Narration": r.get("Narration", "")} for r in final_d3]
    
    return final_d1, final_d2, final_d3, master_meta

@app.post("/api/upload-statement")
async def upload_statement(files: List[UploadFile] = File(...), password: Optional[str] = Form(None)):
    """
    Analyzes single OR multiple PDF streams, self-heals data, and yields unified analytics.
    """
    try:
        d1, d2, d3, meta = await aggregate_pdfs(files, password)
        return {
            "status": "success", 
            "data": {
                "dataset_1": d1, 
                "dataset_2": d2, 
                "dataset_3": d3,
                "metadata": meta
            }
        }
    except Exception as e:
        error_msg = str(e)
        if "password" in error_msg.lower() or "decrypt" in error_msg.lower() or "encryption" in error_msg.lower():
            error_msg = "Encryption detected! Ensure credentials match across all submitted docs."
        return {"status": "error", "message": error_msg}

@app.post("/api/evaluate-eligibility")
async def evaluate_eligibility(
    files: List[UploadFile] = File(...), 
    loan_amount: float = Form(...),
    gst_vintage: int = Form(...),
    itr_vintage: int = Form(...),
    residence_type: str = Form(...),
    office_type: str = Form(...),
    pincode: str = Form(...),
    account_type: str = Form("savings"),
    sanctioned_limit: float = Form(0.0),
    num_active_loans: int = Form(0),
    total_active_emi: float = Form(0.0),
    num_active_business_loans: int = Form(0),
    total_business_loan_emi: float = Form(0.0),
    age: float = Form(25.0),
    business_vintage: float = Form(3.0),
    bto: float = Form(0.0),
    firm_type: str = Form("Proprietorship"),
    distance_from_center: float = Form(0.0),
    cibil_score: int = Form(750),
    total_recent_loans: int = Form(0),
    total_recent_loan_emi: float = Form(0.0),
    password: Optional[str] = Form(None)
):
    try:
        # 1. Aggregate & Deduplicate ALL PDFs using same safe wrapper engine
        d1, d2, d3, meta = await aggregate_pdfs(files, password)
        
        # 2. Prep combined data for policy engine
        borrower_data = {
            "loan_amount": loan_amount,
            "gst_vintage_years": gst_vintage,
            "itr_vintage_years": itr_vintage,
            "residence_type": residence_type,
            "office_type": office_type,
            "pincode": pincode,
            "account_type": account_type,
            "sanctioned_limit": sanctioned_limit,
            "num_active_loans": num_active_loans,
            "total_active_emi": total_active_emi,
            "num_active_business_loans": num_active_business_loans,
            "total_business_loan_emi": total_business_loan_emi,
            "age": age,
            "business_vintage_years": business_vintage,
            "bto": bto,
            "firm_type": firm_type,
            "distance_from_center": distance_from_center,
            "cibil_score": cibil_score,
            "total_recent_loans": total_recent_loans,
            "total_recent_loan_emi": total_recent_loan_emi
        }
        
        bank_data = {
            "transactions": d3,
            "credit_entries_count": len([r for r in d3 if float(r.get('Cr', 0) or 0) > 0])
        }
        
        # 3. Evaluate final combined history
        engine = PolicyEngine()
        results = engine.evaluate(borrower_data, bank_data)
        
        return {
            "status": "success",
            "results": results,
            "extraction": {"metadata": meta, "dataset_3": d3}
        }
    except Exception as e:
        return {"status": "error", "message": f"Aggregate analysis error: {str(e)}"}

