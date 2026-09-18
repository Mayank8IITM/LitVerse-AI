from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
from datetime import timedelta

from app.db.database import get_db
from app.models.user import User
from app.core.config import settings
from app.core.security import create_access_token

from fastapi.security import OAuth2PasswordBearer
import jwt
from pydantic import ValidationError

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/google"
)

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    # Handle dev bypass mode
    if token == "dev-bypass-token":
        user = db.query(User).first()
        if user:
            return user
        # If no user exists at all, we create a dummy one for the bypass
        dummy_user = User(id="dev-user-id", email="dev@example.com", name="Dev User")
        db.add(dummy_user)
        db.commit()
        return dummy_user
        
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = payload.get("sub")
    except (jwt.PyJWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = db.query(User).filter(User.id == token_data).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

class TokenData(BaseModel):
    token: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    email: str
    name: str

@router.post("/google", response_model=TokenResponse)
def google_auth(data: TokenData, db: Session = Depends(get_db)):
    """Authenticate with Google OAuth ID token."""
    try:
        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(
            data.token, requests.Request(), settings.GOOGLE_CLIENT_ID
        )
        
        email = idinfo.get("email")
        name = idinfo.get("name")
        picture = idinfo.get("picture")
        
        if not email:
            raise HTTPException(status_code=400, detail="Google token missing email")
            
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        # If new user, create them
        if not user:
            user = User(
                email=email,
                name=name,
                image=picture
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
        # Generate JWT token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            subject=user.id, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user.id,
            "email": user.email,
            "name": user.name or ""
        }
        
    except ValueError:
        # Invalid token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
