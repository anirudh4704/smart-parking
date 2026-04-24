from pydantic import BaseModel
from app.models.parking_slot import SlotStatus


class ParkingSlotCreate(BaseModel):
    location: str
    status: SlotStatus = SlotStatus.free
    latitude: float | None = None
    longitude: float | None = None


class ParkingSlotUpdate(BaseModel):
    location: str | None = None
    status: SlotStatus | None = None
    latitude: float | None = None
    longitude: float | None = None


class ParkingSlotResponse(BaseModel):
    id: int
    location: str
    status: SlotStatus
    latitude: float | None = None
    longitude: float | None = None

    model_config = {"from_attributes": True}
