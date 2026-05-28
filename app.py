
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib

app = Flask(__name__)
CORS(app)

# Load models
try:
    model = joblib.load("risk_model.joblib")
    scaler = joblib.load("scaler.joblib")
    kmeans = joblib.load("kmeans.joblib")
    print("✅ Models loaded successfully")
except Exception as e:
    print(f"❌ Error loading models: {e}")
    model = None
    scaler = None
    kmeans = None


# ROOT ROUTE
@app.route("/", methods=["GET"])
def root():
    return jsonify({
        "status": "online",
        "message": "Accident Risk Prediction API"
    }), 200


# HEALTH CHECK
@app.route("/api/health", methods=["GET"])
def health():
    try:
        return jsonify({
            "status": "healthy",
            "message": "Backend is running"
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


# PREDICTION ROUTE
@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        if model is None or scaler is None or kmeans is None:
            return jsonify({
                "error": "Models not loaded"
            }), 500

        data = request.json

        if not data:
            return jsonify({
                "error": "No data provided"
            }), 400

        required_fields = [
            "traffic_volume",
            "weather_severity",
            "clouds_all",
            "rain_1h",
            "snow_1h",
            "hour",
            "dayofweek"
        ]

        missing_fields = [
            field for field in required_fields
            if field not in data
        ]

        if missing_fields:
            return jsonify({
                "error": f"Missing fields: {', '.join(missing_fields)}"
            }), 400

        features = np.array([[
            float(data["traffic_volume"]),
            float(data["weather_severity"]),
            float(data["clouds_all"]),
            float(data["rain_1h"]),
            float(data["snow_1h"]),
            float(data["hour"]),
            float(data["dayofweek"])
        ]])

        scaled = scaler.transform(features)

        prediction = model.predict(scaled)[0]

        risk = str(model.predict(scaled)[0])

        cluster = int(kmeans.predict(scaled)[0])

        return jsonify({
            "risk": risk,
            "cluster": cluster
        }), 200

    except Exception as e:
        print(f"Prediction error: {e}")

        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    print("🚀 Starting Flask server...")

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )

