from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_admin
from app.database import get_db
from app.models.parking_slot import ParkingSlot
from app.models.user import User
from app.schemas.parking_slot import ParkingSlotCreate, ParkingSlotResponse, ParkingSlotUpdate

router = APIRouter(prefix="/slots", tags=["Parking Slots"])


@router.get("/", response_model=list[ParkingSlotResponse])
def list_slots(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
):
    """List all parking slots (any authenticated user)."""
    return db.query(ParkingSlot).all()


@router.get("/{slot_id}", response_model=ParkingSlotResponse)
def get_slot(
    slot_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
):
    slot = db.get(ParkingSlot, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    return slot


@router.post("/", response_model=ParkingSlotResponse, status_code=201)
def create_slot(
    payload: ParkingSlotCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
):
    """Create a parking slot (admin only)."""
    slot = ParkingSlot(**payload.model_dump())
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot


@router.put("/{slot_id}", response_model=ParkingSlotResponse)
def update_slot(
    slot_id: int,
    payload: ParkingSlotUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
):
    """Update a parking slot (admin only)."""
    slot = db.get(ParkingSlot, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(slot, field, value)

    db.commit()
    db.refresh(slot)
    return slot


@router.delete("/{slot_id}", status_code=204)
def delete_slot(
    slot_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
):
    """Delete a parking slot (admin only)."""
    slot = db.get(ParkingSlot, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    db.delete(slot)
    db.commit()
