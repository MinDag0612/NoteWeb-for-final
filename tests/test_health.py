def test_health_check_returns_running_status(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {"status": "API is running"}
