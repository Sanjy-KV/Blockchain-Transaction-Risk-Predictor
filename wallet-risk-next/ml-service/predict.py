import pickle
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "risk_model.pkl")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

def predict_risk(tx_count, avg_amount, gas_variance):
    score = 0

    if tx_count > model["tx_count_high"]:
        score += 0.4
    if avg_amount > model["amount_high"]:
        score += 0.4
    if gas_variance > model["gas_variance_high"]:
        score += 0.2

    if score > 0.7:
        return score, "HIGH RISK"
    elif score > 0.4:
        return score, "MEDIUM RISK"
    else:
        return score, "LOW RISK"
