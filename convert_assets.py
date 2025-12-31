import joblib
import json
import numpy as np
import os

# Use current directory
assets_path = 'api/assets'

# Load the assets
scaler = joblib.load(os.path.join(assets_path, 'scaler_new.joblib'))
encoders = joblib.load(os.path.join(assets_path, 'encoders.joblib'))

# 1. Export Scaler parameters
scaler_data = {
    "mean": scaler.mean_.tolist(),
    "scale": scaler.scale_.tolist()
}
with open(os.path.join(assets_path, 'scaler.json'), 'w') as f:
    json.dump(scaler_data, f)

# 2. Export Encoders
encoder_data = {}
for col, le in encoders.items():
    encoder_data[col] = le.classes_.tolist()
with open(os.path.join(assets_path, 'encoders.json'), 'w') as f:
    json.dump(encoder_data, f)

print("✅ Scaler and Encoders converted to JSON.")
