from pydantic import BaseModel
from app.models.parking_slot import SlotStatus


class ParkingSlotCreate(BaseModel):
    location: str
    status: SlotStatus = SlotStatus.free


class ParkingSlotUpdate(BaseModel):
    location: str | None = None
    status: SlotStatus | None = None


class ParkingSlotResponse(BaseModel):
    id: int
    location: str
    status: SlotStatus

    model_config = {"from_attributes": True}
