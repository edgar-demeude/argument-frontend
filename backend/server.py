from fastapi import FastAPI
from .aba_framework import ABAFramework, build_aba_framework


app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "ABA Backend Running"}

@app.get("/aba")
def run_aba():
    """
    Endpoint to build, transform, and run the ABA framework.
    Returns the arguments and attacks as lists of strings.
    """
    aba = build_aba_framework("./data/abaPlus.txt")
    aba.transform_aba()
    aba.generate_arguments()
    aba.generate_attacks()
    # Remove aba.aba_plus() if not needed or define it if missing
    # aba.aba_plus()
    return {
        "arguments": [str(arg) for arg in getattr(aba, "arguments", [])],
        "attacks": [str(att) for att in getattr(aba, "attacks", [])]
    }
