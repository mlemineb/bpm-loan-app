from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import json

app = Flask(__name__)
CORS(app)

# Load assets
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, 'assets')

# Load the core model
model = joblib.load(os.path.join(ASSETS_DIR, 'model.joblib'))
feature_names = joblib.load(os.path.join(ASSETS_DIR, 'feature_names.joblib'))

# Load lightweight JSON assets
with open(os.path.join(ASSETS_DIR, 'scaler.json'), 'r') as f:
    scaler_params = json.load(f)
with open(os.path.join(ASSETS_DIR, 'encoders.json'), 'r') as f:
    encoder_classes = json.load(f)

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        categorical_cols = ['person_gender', 'person_education', 'person_home_ownership', 'loan_intent', 'previous_loan_defaults_on_file']
        numerical_cols = ['person_age', 'person_income', 'person_emp_exp', 'loan_amnt', 'loan_int_rate', 'loan_percent_income', 'cb_person_cred_hist_length', 'credit_score']
        
        # 1. Manual Label Encoding
        cat_features = []
        for col in categorical_cols:
            val = data.get(col)
            classes = encoder_classes[col]
            # Simple list.index simulation for transform
            try:
                idx = classes.index(val)
            except ValueError:
                idx = 0 # Default fallback
            cat_features.append(idx)
            
        # 2. Manual Scaling
        num_features = [float(data.get(col, 0)) for col in numerical_cols]
        means = np.array(scaler_params['mean'])
        scales = np.array(scaler_params['scale'])
        num_features_scaled = (np.array(num_features) - means) / scales
        
        # 3. Combine in correct order
        final_input = np.array([cat_features + list(num_features_scaled)])
        
        # Prediction
        prediction_prob = model.predict_proba(final_input)[0][1]
        prediction = int(prediction_prob > 0.5)
        
        # 4. "Justification" using Feature Importance (Native to XGBoost)
        # Since SHAP is too heavy for Vercel's limit, we use the model's gain/weight
        # We can simulate the impact by multiplying the input by the weights if linear, 
        # or just use the model's global importance for this specific prediction's values.
        
        # Better: We use a simplified "contribution" by looking at the model's booster importance
        importance = model.get_booster().get_score(importance_type='gain')
        # Map importance back to feature names
        # XGBoost internal names are f0, f1, f2...
        explanations = []
        for i, feat in enumerate(feature_names):
            # XGBoost uses f0, f1... for unnamed features
            key = f'f{i}'
            val = importance.get(key, 0)
            
            # For justification, we'll indicate if the feature was high or low
            # This is a simplified proxy since we can't run the full SHAP
            explanations.append({
                "feature": feat,
                "value": float(val),
                "display_name": feat.replace('_', ' ').title()
            })
            
        # Sort by impact
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
