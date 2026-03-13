from flask import Flask, request, jsonify
import pickle
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "risk_model.pkl")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)


@app.route("/ml", methods=["POST"])
def ml():

    data = request.get_json(force=True) or {}

    # SAFE parsing
    tx = float(data.get("tx_count") or 0)
    amt = float(data.get("avg_amount") or 0)
    gas = float(data.get("gas_variance") or 0)

    # DEBUG OUTPUT
    print("----- FEATURES RECEIVED -----")
    print("RAW DATA:", data)
    print("TX:", tx)
    print("AVG AMOUNT:", amt)
    print("GAS VAR:", gas)
    print("-----------------------------")

    score = 0
    reasons = []

    # Transaction activity
    if tx > model["tx_count_high"]:
        score += 0.5
        reasons.append("High transaction activity")

    elif tx > model["tx_count_medium"]:
        score += 0.3
        reasons.append("Moderate transaction activity")

    # Transfer amount
    if amt > model["amount_high"]:
        score += 0.3
        reasons.append("Large transfers")

    elif amt > model["amount_medium"]:
        score += 0.2
        reasons.append("Medium transfers")

    # Gas variance
    if gas > model["gas_var_high"]:
        score += 0.2
        reasons.append("High gas variance")

    elif gas > model["gas_var_medium"]:
        score += 0.1
        reasons.append("Moderate gas variance")

    # Risk level
    if score >= 0.7:
        level = "HIGH RISK"
    elif score >= 0.4:
        level = "MEDIUM RISK"
    else:
        level = "LOW RISK"

    return jsonify({
        "result": {
            "score": round(score, 2),
            "level": level,
            "reason": ", ".join(reasons) if reasons else "Normal behavior"
        }
    })


if __name__ == "__main__":
    app.run(port=5000, debug=True)