import os
import json
import numpy as np
import pandas as pd
import xgboost as xgb
from datetime import datetime
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import accuracy_score, roc_auc_score

MODEL_PATH = os.path.join(os.path.dirname(__file__), "xgboost_model.json")

def generate_training_data(n_samples=5000):
    """
    Generates synthetic historical OHLCV data with chart_engine features to train the ML model.
    """
    # Import here to avoid circular dependency
    from ..chart_engine.indicators import add_indicators
    
    dates = pd.date_range(end=datetime.now(), periods=n_samples, freq="15min")
    np.random.seed(42)
    returns = np.random.normal(loc=0.0001, scale=0.002, size=n_samples)
    close_prices = 3400.0 * np.exp(np.cumsum(returns))
    high_prices = close_prices * (1 + np.abs(np.random.normal(0, 0.001, n_samples)))
    low_prices = close_prices * (1 - np.abs(np.random.normal(0, 0.001, n_samples)))
    open_prices = np.roll(close_prices, 1)
    open_prices[0] = 3400.0
    volumes = np.random.lognormal(mean=10, sigma=1, size=n_samples)
    
    df = pd.DataFrame({
        'open': open_prices, 
        'high': high_prices, 
        'low': low_prices, 
        'close': close_prices, 
        'volume': volumes
    }, index=dates)
    
    # 1. Add Features
    df = add_indicators(df)
    
    # Target: Forward 10-candle return
    # If the return 10 candles in the future is > 0.2%, we classify as 1 (Win), else 0 (Loss)
    df['future_close'] = df['close'].shift(-10)
    df['forward_return'] = (df['future_close'] - df['close']) / df['close']
    df['target'] = (df['forward_return'] > 0.002).astype(int)
    
    # Drop NaNs
    df.dropna(inplace=True)
    
    # Select features
    features = ['RSI_14', 'MACD_12_26_9', 'MACDh_12_26_9', 'ATRr_14', 'volume']
    
    X = df[features]
    y = df['target']
    
    return X, y

def train_xgboost_model():
    """
    Trains the XGBoost model on historical features and saves it to disk.
    """
    X, y = generate_training_data(n_samples=5000)
    
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=3,
        learning_rate=0.1,
        objective='binary:logistic'
    )
    
    model.fit(X, y)
    
    # Save model
    model.save_model(MODEL_PATH)
    
    # Get training accuracy
    predictions = model.predict(X)
    accuracy = (predictions == y).mean()
    
    return {"status": "success", "accuracy": round(float(accuracy) * 100, 2), "samples": len(X)}

def predict_signal_confidence(features_dict: dict) -> float:
    """
    Loads the XGBoost model and predicts confidence (probability of class 1)
    """
    if not os.path.exists(MODEL_PATH):
        # Fallback if model hasn't been trained yet
        return 50.0
        
    try:
        model = xgb.XGBClassifier()
        model.load_model(MODEL_PATH)
        
        rsi = features_dict.get('momentum', {}).get('rsi', 50)
        macd = features_dict.get('momentum', {}).get('macd', 0)
        macd_h = features_dict.get('momentum', {}).get('macd_hist', 0)
        atr = features_dict.get('volatility', {}).get('atr', 0)
        vol = features_dict.get('volume', {}).get('raw', 0)
        
        input_data = pd.DataFrame([{
            'RSI_14': rsi,
            'MACD_12_26_9': macd,
            'MACDh_12_26_9': macd_h,
            'ATRr_14': atr,
            'volume': vol
        }])
        
        prob = model.predict_proba(input_data)[0][1] # Probability of class 1
        return round(prob * 100, 1)
    except Exception as e:
        print("ML Prediction Error:", e)
        return 50.0

def run_walk_forward_validation(n_splits=5):
    """
    Runs Walk-Forward Validation using TimeSeriesSplit to ensure the model isn't overfitting.
    Trains on an expanding window and tests on out-of-sample data.
    """
    X, y = generate_training_data(n_samples=20000)
    
    tscv = TimeSeriesSplit(n_splits=n_splits)
    
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=3,
        learning_rate=0.1,
        objective='binary:logistic'
    )
    
    results = []
    
    for fold, (train_index, test_index) in enumerate(tscv.split(X)):
        X_train, X_test = X.iloc[train_index], X.iloc[test_index]
        y_train, y_test = y.iloc[train_index], y.iloc[test_index]
        
        model.fit(X_train, y_train)
        
        preds = model.predict(X_test)
        probs = model.predict_proba(X_test)[:, 1]
        
        acc = accuracy_score(y_test, preds)
        
        try:
            auc = roc_auc_score(y_test, probs)
        except ValueError:
            auc = 0.5 # Handle case where only 1 class is present in the split
            
        results.append({
            "fold": fold + 1,
            "train_size": len(X_train),
            "test_size": len(X_test),
            "oos_accuracy": round(float(acc) * 100, 2),
            "oos_roc_auc": round(float(auc), 3)
        })
        
    avg_acc = sum(r["oos_accuracy"] for r in results) / n_splits
    avg_auc = sum(r["oos_roc_auc"] for r in results) / n_splits
    
    return {
        "status": "success",
        "n_splits": n_splits,
        "average_oos_accuracy": round(avg_acc, 2),
        "average_oos_roc_auc": round(avg_auc, 3),
        "folds": results
    }
