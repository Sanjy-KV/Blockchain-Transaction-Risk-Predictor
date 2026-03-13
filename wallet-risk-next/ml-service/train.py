import pickle
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "risk_model.pkl")

# Real-world Ethereum wallet behavior:
# Low risk wallet:    0 - 100 txs   (regular user)
# Medium risk wallet: 100 - 1000 txs (active user / small exchange)
# High risk wallet:   1000+ txs      (bot / exchange / suspicious)

model = {
    "tx_count_medium": 100,
    "tx_count_high":   1000,

    # avg ETH per tx
    "amount_medium": 0.1,
    "amount_high":   10.0,

    # log10(avg_gas_gwei + 1)
    "gas_var_medium": 1.3,
    "gas_var_high":   1.8,

    "model_version": "9.0"
}

with open(MODEL_PATH, "wb") as f:
    pickle.dump(model, f)

print("Model saved! Version:", model["model_version"])
print(f"  tx_count   → medium: {model['tx_count_medium']} | high: {model['tx_count_high']}")
print(f"  avg_amount → medium: {model['amount_medium']} ETH | high: {model['amount_high']} ETH")
print(f"  gas_var    → medium: {model['gas_var_medium']} | high: {model['gas_var_high']}")