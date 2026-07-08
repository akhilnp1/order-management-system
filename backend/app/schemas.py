from datetime import datetime
from typing import Optional, Generic, TypeVar
from pydantic import BaseModel, Field, ConfigDict
from app.models import OrderStatus

T = TypeVar("T")


# ---------- Auth ----------
class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


# ---------- Orders ----------
class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=120)
    amount: float = Field(gt=0)
    status: OrderStatus = OrderStatus.PENDING


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_name: str
    amount: float
    status: OrderStatus
    amount_usd: Optional[float] = None
    created_at: datetime
    updated_at: datetime


class OrderListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[OrderOut]


# ---------- Generic API envelope ----------
class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
