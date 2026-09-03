import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

class CivicResourceMLPredictor:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=50, random_state=42)
        self.is_trained = False
        self._pretrain_synthetic_model()

    def _pretrain_synthetic_model(self):
        # Features: [supplied, consumed, flow_rate, pressure, population_k, hour_of_day]
        np.random.seed(42)
        n_samples = 1200
        
        supplied = np.random.uniform(100.0, 500.0, n_samples)
        loss_ratio = np.random.uniform(0.01, 0.45, n_samples)
        consumed = supplied * (1.0 - loss_ratio)
        flow_rate = supplied / 12.0 + np.random.normal(0, 0.5, n_samples)
        pressure = np.random.uniform(1.0, 8.0, n_samples)
        pop_k = np.random.uniform(10.0, 50.0, n_samples)
        hour = np.random.randint(0, 24, n_samples)

        X = np.column_stack([supplied, consumed, flow_rate, pressure, pop_k, hour])
        
        # Target: 0 = Normal/Low, 1 = Medium, 2 = High/Critical
        y = np.where(loss_ratio > 0.20, 2, np.where(loss_ratio > 0.10, 1, 0))

        self.model.fit(X, y)
        self.is_trained = True

    def predict_risk(self, supplied: float, consumed: float, flow_rate: float, pressure: float, population: int, hour: int = 12) -> dict:
        pop_k = population / 1000.0
        X_test = np.array([[supplied, consumed, flow_rate, pressure, pop_k, hour]])
        
        pred_class = self.model.predict(X_test)[0]
        probs = self.model.predict_proba(X_test)[0]

        class_map = {0: "Normal", 1: "Medium Risk", 2: "High/Critical Risk"}
        risk_name = class_map.get(pred_class, "Normal")
        
        confidence = float(np.max(probs)) * 100.0
        return {
            "predicted_risk_level": risk_name,
            "confidence_percentage": round(confidence, 1),
            "probabilities": {
                "Normal": round(float(probs[0]) * 100, 1) if len(probs) > 0 else 0,
                "Medium": round(float(probs[1]) * 100, 1) if len(probs) > 1 else 0,
                "High_Critical": round(float(probs[2]) * 100, 1) if len(probs) > 2 else 0
            }
        }

ml_predictor = CivicResourceMLPredictor()
