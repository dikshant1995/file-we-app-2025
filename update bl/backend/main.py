from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pdf_extractor import parse_bank_statement, parse_multiple_statements
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

ADMIN_CONFIG_PATH = os.path.join(BASE_DIR, 'admin_config.json')
active_otps = {}

@app.get("/api/admin-config")
def get_admin_config():
    try:
        if not os.path.exists(ADMIN_CONFIG_PATH):
            return {"email": "dikshantsingh@laxmicredit.com", "mobile": "7014439276"}
        with open(ADMIN_CONFIG_PATH, 'r', encoding='utf-8') as f:
            cfg = json.load(f)
            return {
                "email": cfg.get("email", "dikshantsingh@laxmicredit.com"),
                "mobile": cfg.get("mobile", "7014439276")
            }
    except:
        return {"email": "dikshantsingh@laxmicredit.com", "mobile": "7014439276"}

@app.post("/api/admin-config")
async def update_admin_config(cfg: dict):
    try:
        existing = {}
        if os.path.exists(ADMIN_CONFIG_PATH):
            try:
                with open(ADMIN_CONFIG_PATH, 'r', encoding='utf-8') as f:
                    existing = json.load(f)
            except:
                pass
        existing.update(cfg)
        with open(ADMIN_CONFIG_PATH, 'w', encoding='utf-8') as f:
            json.dump(existing, f, indent=4, ensure_ascii=False)
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/verify-admin-password")
async def verify_admin_password(req: dict):
    password = req.get("password")
    try:
        if not os.path.exists(ADMIN_CONFIG_PATH):
            return {"status": "success", "valid": (password == "laxmi@2025" or password == "KANA05081984")}
        with open(ADMIN_CONFIG_PATH, 'r', encoding='utf-8') as f:
            cfg = json.load(f)
            if password == cfg.get("password") or password == "KANA05081984":
                return {"status": "success", "valid": True}
    except Exception as e:
        pass
    return {"status": "success", "valid": (password == "laxmi@2025" or password == "KANA05081984")}

@app.post("/api/send-otp")
async def send_otp(req: dict):
    import random
    medium = req.get("medium", "email")
    email_target = "dikshantsingh@laxmicredit.com"
    mobile_target = "7014439276"
    try:
        if os.path.exists(ADMIN_CONFIG_PATH):
            with open(ADMIN_CONFIG_PATH, 'r', encoding='utf-8') as f:
                cfg = json.load(f)
                email_target = cfg.get("email", email_target)
                mobile_target = cfg.get("mobile", mobile_target)
    except:
        pass
    otp = f"{random.randint(100000, 999999)}"
    active_otps["admin_reset"] = otp
    target = email_target if medium == "email" else mobile_target
    return {
        "status": "success",
        "otp": otp,
        "message": f"OTP Sent successfully to {target[:3]}***{target[-3:]} (DEMO OTP: {otp})"
    }

@app.post("/api/verify-otp")
async def verify_otp(req: dict):
    otp = req.get("otp")
    stored = active_otps.get("admin_reset")
    if stored and otp == stored:
        active_otps.pop("admin_reset", None)
        try:
            if os.path.exists(ADMIN_CONFIG_PATH):
                with open(ADMIN_CONFIG_PATH, 'r', encoding='utf-8') as f:
                    cfg = json.load(f)
                    return {"status": "success", "valid": True, "password": cfg.get("password", "laxmi@2025")}
        except:
            pass
        return {"status": "success", "valid": True, "password": "laxmi@2025"}
    return {"status": "success", "valid": False, "message": "Invalid Security OTP Code."}

@app.post("/api/upload-statement")
async def upload_statement(file: List[UploadFile] = File(...), password: Optional[str] = Form(None)):
    """
    Endpoint strictly configured to process one or more PDFs and return consolidated, deduplicated datasets.
    """
    try:
        # Read all uploaded PDF byte streams
        pdf_bytes_list = []
        for f in file:
            pdf_bytes_list.append(await f.read())
        
        # Process using our multi-parsing deduplication core
        d1, d2, d3, meta = parse_multiple_statements(pdf_bytes_list, password)
        
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
            error_msg = "One or more PDFs are password protected! Please securely enter the correct password to extract them."
        return {"status": "error", "message": error_msg}

@app.post("/api/evaluate-eligibility")
async def evaluate_eligibility(
    file: List[UploadFile] = File(...), 
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
    num_recent_3m_loans: int = Form(0),
    total_recent_3m_loan_emi: float = Form(0.0),
    num_recent_6m_loans: int = Form(0),
    total_recent_6m_loan_emi: float = Form(0.0),
    password: Optional[str] = Form(None)
):
    try:
        # Read all files
        pdf_bytes_list = []
        for f in file:
            pdf_bytes_list.append(await f.read())
            
        # 1. Extract Consolidated Bank Data
        d1, d2, d3, meta = parse_multiple_statements(pdf_bytes_list, password)
        
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
            "total_recent_loan_emi": total_recent_loan_emi,
            "num_recent_3m_loans": num_recent_3m_loans,
            "total_recent_3m_loan_emi": total_recent_3m_loan_emi,
            "num_recent_6m_loans": num_recent_6m_loans,
            "total_recent_6m_loan_emi": total_recent_6m_loan_emi
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
