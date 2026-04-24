import enum
from sqlalchemy import Column, Integer, String, Enum, Float
from app.database import Base


class SlotStatus(str, enum.Enum):
    free = "free"
    occupied = "occupied"
    booked = "booked"


class ParkingSlot(Base):
    __tablename__ = "parking_slots"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String, nullable=False)
    status = Column(Enum(SlotStatus), default=SlotStatus.free, nullable=False)
    latitude = Column(Float, nullable=True)   # for map marker
    longitude = Column(Float, nullable=True)  # for map marker
