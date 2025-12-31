from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
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
        
        # Categorical and Numerical feature orders as defined during training
        categorical_cols = ['person_gender', 'person_education', 'person_home_ownership', 'loan_intent', 'previous_loan_defaults_on_file']
        numerical_cols = ['person_age', 'person_income', 'person_emp_exp', 'loan_amnt', 'loan_int_rate', 'loan_percent_income', 'cb_person_cred_hist_length', 'credit_score']
        
        # 1. Preprocess Categorical (using Numpy/Enocders)
        cat_features = []
        for col in categorical_cols:
            val = data.get(col)
            le = encoders[col]
            # Transform single value
            cat_features.append(le.transform([val])[0])
            
        # 2. Preprocess Numerical
        num_features = [float(data.get(col, 0)) for col in numerical_cols]
        num_features_scaled = scaler.transform([num_features])[0]
        
        # 3. Combine in the correct order (cat then num as per our training script)
        # Note: feature_names preserves this order
        final_input = np.array([cat_features + list(num_features_scaled)])
        
        # Prediction
        prediction_prob = model.predict_proba(final_input)[0][1]
        prediction = int(prediction_prob > 0.5)
        
        # SHAP explanation
        try:
            shap_output = explainer(final_input)
            if hasattr(shap_output, "values"):
                vals = shap_output.values[0]
                if len(vals.shape) > 1 and vals.shape[-1] == 2:
                    vals = vals[:, 1]
            else:
                shap_values = explainer.shap_values(final_input)
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
                "value": float(vals[i]),
                "display_name": feat.replace('_', ' ').title()
            })
            
        explanations = sorted(explanations, key=lambda x: abs(x['value']), reverse=True)

        return jsonify({
            "status": "success",
            "prediction": prediction,
            "probability": float(prediction_prob),
            "explanation": explanations[:5]
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

if __name__ == '__main__':
    app.run(port=5328)
