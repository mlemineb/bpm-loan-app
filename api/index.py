from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os
import shap

app = Flask(__name__)
CORS(app)

# Load assets
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, 'assets')

model = joblib.load(os.path.join(ASSETS_DIR, 'model.joblib'))
scaler = joblib.load(os.path.join(ASSETS_DIR, 'scaler_new.joblib'))
encoders = joblib.load(os.path.join(ASSETS_DIR, 'encoders.joblib'))
explainer = joblib.load(os.path.join(ASSETS_DIR, 'explainer.joblib'))
feature_names = joblib.load(os.path.join(ASSETS_DIR, 'feature_names.joblib'))

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        # Create DataFrame from input
        df_input = pd.DataFrame([data])
        
        # Preprocess categorical
        categorical_cols = ['person_gender', 'person_education', 'person_home_ownership', 'loan_intent', 'previous_loan_defaults_on_file']
        numerical_cols = ['person_age', 'person_income', 'person_emp_exp', 'loan_amnt', 'loan_int_rate', 'loan_percent_income', 'cb_person_cred_hist_length', 'credit_score']
        
        for col in categorical_cols:
            if col in df_input.columns:
                le = encoders[col]
                # Handle unseen labels by mapping to a default if necessary, but here we expect valid inputs from UI
                df_input[col] = le.transform(df_input[col])
        
        # Scale numerical
        df_input[numerical_cols] = scaler.transform(df_input[numerical_cols])
        
        # Ensure column order
        df_input = df_input[feature_names]
        
        # Prediction
        prediction_prob = model.predict_proba(df_input)[0][1]
        prediction = int(prediction_prob > 0.5)
        
        # SHAP explanation
        try:
            shap_output = explainer(df_input)
            # Handle different SHAP versions/explainer types
            if hasattr(shap_output, "values"):
                vals = shap_output.values[0]
                # If binary classification, SHAP might return [samples, features, 2]
                if len(vals.shape) > 1 and vals.shape[-1] == 2:
                    vals = vals[:, 1]
            else:
                # Fallback for older SHAP versions
                shap_values = explainer.shap_values(df_input)
                if isinstance(shap_values, list):
                    vals = shap_values[1][0] if len(shap_values) > 1 else shap_values[0]
                else:
                    vals = shap_values[0]
        except Exception as e:
            print(f"SHAP Error: {e}")
            vals = np.zeros(len(feature_names))
            
        explanations = []
        for i, feat in enumerate(feature_names):
            explanations.append({
                "feature": feat,
                "value": float(vals[i]), # Convert float32 to standard float
                "display_name": feat.replace('_', ' ').title()
            })
            
        # Sort by impact
        explanations = sorted(explanations, key=lambda x: abs(x['value']), reverse=True)

        return jsonify({
            "status": "success",
            "prediction": prediction,
            "probability": float(prediction_prob),
            "explanation": explanations[:5] # Top 5 influential features
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

# For local development
if __name__ == '__main__':
    app.run(port=5328)

