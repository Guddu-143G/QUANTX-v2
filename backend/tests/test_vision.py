import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@patch("app.main.VisionService")
def test_analyze_chart_endpoint(mock_vision_service_class):
    # Mock the service and its return value
    mock_service_instance = MagicMock()
    mock_service_instance.analyze_chart.return_value = "Mocked AI Report"
    mock_vision_service_class.return_value = mock_service_instance

    # Create a dummy image file
    image_content = b"dummy image data"
    files = {"file": ("test_chart.png", image_content, "image/png")}

    response = client.post("/api/v1/analyze-chart", files=files)
    
    assert response.status_code == 200
    assert response.json() == {"report": "Mocked AI Report"}
    
    # Verify the service was called with the correct arguments
    mock_service_instance.analyze_chart.assert_called_once_with(image_content, "image/png")

def test_analyze_chart_endpoint_invalid_file_type():
    # Provide a text file instead of an image
    text_content = b"this is not an image"
    files = {"file": ("test.txt", text_content, "text/plain")}

    response = client.post("/api/v1/analyze-chart", files=files)
    
    assert response.status_code == 400
    assert response.json() == {"detail": "File must be an image"}
