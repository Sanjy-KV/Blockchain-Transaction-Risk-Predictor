import pickle
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "risk_model.pkl")

model = {
    "tx_count_medium": 5,
    "tx_count_high": 15,

    "amount_medium": 0.0005,
    "amount_high": 0.002,

    "gas_var_medium": 2,
    "gas_var_high": 3,

    "model_version": "6.0"
}

with open(MODEL_PATH, "wb") as f:
    pickle.dump(model, f)

print("MODEL SAVED:", model)