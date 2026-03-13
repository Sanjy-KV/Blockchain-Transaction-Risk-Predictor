from flask import Flask, request, jsonify
import pickle
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "risk_model.pkl")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

print("Model loaded:", model)


@app.route("/ml", methods=["POST"])
def ml():

    data = request.get_json(force=True) or {}

    tx  = float(data.get("tx_count")     or 0)
    amt = float(data.get("avg_amount")   or 0)
    gas = float(data.get("gas_variance") or 0)

    print("----- FEATURES RECEIVED -----")
    print("TX COUNT   :", tx)
    print("AVG AMOUNT :", amt)
    print("GAS VAR    :", gas)
    print("-----------------------------")

    score = 0.0
    reasons = []

    # --- transaction count (max 0.5 points) ---
    if tx > model["tx_count_high"]:        # > 1000
        score += 0.5
        reasons.append("Very high transaction volume")
    elif tx > model["tx_count_medium"]:    # > 100
        score += 0.25
        reasons.append("Moderate transaction volume")
    elif tx > 10:                          # > 10
        score += 0.1
        reasons.append("Low transaction volume")

    # --- transfer amount (max 0.3 points) ---
    if amt > model["amount_high"]:         # > 10 ETH avg
        score += 0.3
        reasons.append("Very large transfers")
    elif amt > model["amount_medium"]:     # > 0.1 ETH avg
        score += 0.15
        reasons.append("Large transfers")
    elif amt > 0.001:                      # > 0.001 ETH avg
        score += 0.05
        reasons.append("Small transfers")

    # --- gas variance (max 0.2 points) ---
    if gas > model["gas_var_high"]:        # > 1.8
        score += 0.2
        reasons.append("Unusual gas pattern")
    elif gas > model["gas_var_medium"]:    # > 1.3
        score += 0.1
        reasons.append("Elevated gas usage")

    # clamp to 1.0
    score = min(score, 1.0)

    # --- risk level ---
    if score >= 0.5:
        level = "HIGH RISK"
    elif score >= 0.2:
        level = "MEDIUM RISK"
    else:
        level = "LOW RISK"

    print(f"SCORE: {score} | LEVEL: {level}")
    print(f"REASONS: {reasons}")
    print("-----------------------------")

    return jsonify({
        "result": {
            "score": round(score, 2),
            "level": level,
            "reason": ", ".join(reasons) if reasons else "Normal behavior"
        }
    })


if __name__ == "__main__":
    app.run(port=5000, debug=True)