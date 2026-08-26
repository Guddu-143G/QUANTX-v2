import pytest
from app.quant.composite import CompositeEngine, CompositeValidationError
from app.quant.normalization import CrossSectionalNormalizer

def test_composite_weights_validation_success():
    weights = {"val": 25.0, "qual": 25.0, "mom": 25.0, "sent": 25.0}
    assert CompositeEngine.validate_weights(weights) is True

def test_composite_weights_validation_failure():
    weights = {"val": 30.0, "qual": 30.0, "mom": 30.0, "sent": 20.0}  # 110%
    with pytest.raises(CompositeValidationError):
        CompositeEngine.validate_weights(weights)

def test_normalization_pipeline():
    raw_scores = {1: 10.0, 2: 20.0, 3: 15.0, 4: 100.0, 5: 0.0}
    # winsorize tests
    winsorized = CrossSectionalNormalizer.winsorize(raw_scores, limit=0.20)
    assert max(winsorized.values()) < 100.0
    
    # standardize tests
    std_scores = CrossSectionalNormalizer.standardize(raw_scores)
    # mean should be close to 0
    mean_val = sum(std_scores.values()) / len(std_scores)
    assert abs(mean_val) < 0.01

def test_composite_calculation():
    factor_scores = {
        "val": {1: 1.0, 2: -1.0},
        "mom": {1: 0.5, 2: 0.5}
    }
    weights = {"val": 50.0, "mom": 50.0}
    composite = CompositeEngine.calculate_composite([1, 2], weights, factor_scores)
    
    # Instrument 1: 1.0*0.5 + 0.5*0.5 = 0.75
    # Instrument 2: -1.0*0.5 + 0.5*0.5 = -0.25
    assert abs(composite[1] - 0.75) < 0.001
    assert abs(composite[2] - (-0.25)) < 0.001
