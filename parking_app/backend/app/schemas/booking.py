from pydantic import BaseModel
from app.models.booking import PaymentStatus


class BookingCreate(BaseModel):
    slot_id: int


class PaymentUpdate(BaseModel):
    payment_status: PaymentStatus


class BookingResponse(BaseModel):
    id: int
    user_id: int
    slot_id: int
    payment_status: PaymentStatus

    model_config = {"from_attributes": True}
