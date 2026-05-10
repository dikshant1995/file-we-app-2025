from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pdf_extractor import parse_bank_statement
from policy_engine import PolicyEngine
import json
import os

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

@app.post("/api/upload-statement")
async def upload_statement(file: UploadFile = File(...), password: Optional[str] = Form(None)):
    """
    Endpoint strictly configured to process the PDF and return ONLY the 3 specified datasets.
    """
    # Read the uploaded PDF bytes
    pdf_bytes = await file.read()
    
    # Process the PDF using our strictly separated strategy
    try:
        d1, d2, d3, meta = parse_bank_statement(pdf_bytes, password)
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
        if "password" in error_msg.lower() or "decrypt" in error_msg.lower() or "encryption" in error_msg.lower() or "pdfpassword" in error_msg.lower():
            error_msg = "This PDF is password protected! Please securely enter the correct password in the box above to extract it."
        return {"status": "error", "message": error_msg}

@app.post("/api/evaluate-eligibility")
async def evaluate_eligibility(
    file: UploadFile = File(...), 
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
    pdf_bytes = await file.read()
    try:
        # 1. Extract Bank Data
        d1, d2, d3, meta = parse_bank_statement(pdf_bytes, password)
        
        # 2. Prep data for engine
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
            "credit_entries_count": len([r for r in d3 if r.get('Cr', 0) > 0])
        }
        
        # 3. Evaluate
        engine = PolicyEngine()
        results = engine.evaluate(borrower_data, bank_data)
        
        return {
            "status": "success",
            "results": results,
            "extraction": {"metadata": meta, "dataset_3": d3}
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
