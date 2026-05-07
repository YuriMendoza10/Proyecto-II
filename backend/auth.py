"""
auth.py
JWT + bcrypt + 2FA + recuperación de contraseña (versión limpia)
"""

from datetime import datetime, timedelta
from typing import Optional, Dict
import secrets
import base64
from io import BytesIO

from jose import JWTError, jwt
import bcrypt
import pyotp
import qrcode

from fastapi import Depends, HTTPException, status, APIRouter
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.db_models import Usuario

# =========================
# ROUTER
# =========================
router = APIRouter(prefix="/auth", tags=["Auth"])

# =========================
# CONFIG JWT
# =========================
SECRET_KEY = "optiacademic-secret-key-2025-cambiar-en-produccion"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# =========================
# MODELOS
# =========================
class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# =========================
# PASSWORD
# =========================
def get_password_hash(password: str) -> str:
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    plain_bytes = plain_password.encode('utf-8')[:72]
    hash_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(plain_bytes, hash_bytes)

# =========================
# AUTH
# =========================
def authenticate_user(db: Session, email: str, password: str) -> Optional[Usuario]:
    user = db.query(Usuario).filter(Usuario.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

# =========================
# JWT
# =========================
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# =========================
# CURRENT USER
# =========================
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Usuario:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(Usuario).filter(Usuario.email == email).first()
    if not user:
        raise credentials_exception

    return user


async def get_current_active_user(
    current_user: Usuario = Depends(get_current_user)
) -> Usuario:
    if not current_user.activo:
        raise HTTPException(status_code=400, detail="Usuario inactivo")
    return current_user

# =========================
# ROLES
# =========================
def require_role(roles: list):
    async def role_checker(current_user: Usuario = Depends(get_current_active_user)):
        if current_user.rol not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere rol: {', '.join(roles)}"
            )
        return current_user
    return role_checker

# =========================
# 2FA
# =========================
def generar_secreto_2fa() -> str:
    return pyotp.random_base32()


def generar_qr_2fa(email: str, secreto: str) -> str:
    totp = pyotp.TOTP(secreto)
    uri = totp.provisioning_uri(name=email, issuer_name="OptiAcademic")

    qr = qrcode.QRCode(box_size=10, border=4)
    qr.add_data(uri)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffered = BytesIO()
    img.save(buffered, format="PNG")

    return base64.b64encode(buffered.getvalue()).decode()


def verificar_2fa(secreto: str, codigo: str) -> bool:
    return pyotp.TOTP(secreto).verify(codigo)

# =========================
# RESET PASSWORD (temporal)
# =========================
reset_tokens: Dict[str, dict] = {}

def generar_token_recuperacion(email: str) -> str:
    token = secrets.token_urlsafe(32)
    reset_tokens[token] = {
        "email": email,
        "expira": datetime.utcnow() + timedelta(hours=1)
    }
    return token


def verificar_token_recuperacion(token: str) -> Optional[str]:
    data = reset_tokens.get(token)
    if not data or data["expira"] < datetime.utcnow():
        return None
    return data["email"]

# =========================
# ENDPOINTS
# =========================
@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    user = db.query(Usuario).filter(Usuario.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    token = generar_token_recuperacion(request.email)

    return {
        "message": "Email enviado (simulado)",
        "token": token  # ⚠️ quitar en producción
    }


@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    email = verificar_token_recuperacion(request.token)
    if not email:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")

    user = db.query(Usuario).filter(Usuario.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.hashed_password = get_password_hash(request.new_password)
    db.commit()

    del reset_tokens[request.token]

    return {"message": "Contraseña restablecida correctamente"}