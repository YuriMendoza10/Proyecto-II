from datetime import timedelta

from app.core.security import (
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)


def test_password_hash_and_verify_roundtrip():
    hashed = get_password_hash("clave-segura")

    assert hashed != "clave-segura"
    assert verify_password("clave-segura", hashed) is True
    assert verify_password("otra-clave", hashed) is False


def test_create_and_decode_access_token_contains_subject():
    token = create_access_token("admin@example.com", expires_delta=timedelta(minutes=5))
    payload = decode_access_token(token)

    assert payload is not None
    assert payload["sub"] == "admin@example.com"
    assert "exp" in payload


def test_decode_access_token_returns_none_for_invalid_token():
    assert decode_access_token("token-invalido") is None
