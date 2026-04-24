from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_admin
from app.database import get_db
from app.models.booking import Booking
from app.models.parking_slot import ParkingSlot, SlotStatus
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingResponse

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Book a free parking slot."""
    slot = db.get(ParkingSlot, payload.slot_id)
    if not slot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slot not found")
    if slot.status != SlotStatus.free:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Slot is currently {slot.status.value} and cannot be booked",
        )

    # Mark slot as booked
    slot.status = SlotStatus.booked

    booking = Booking(user_id=current_user.id, slot_id=slot.id)
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/me", response_model=list[BookingResponse])
def my_bookings(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """List all bookings for the currently authenticated user."""
    return db.query(Booking).filter(Booking.user_id == current_user.id).all()


@router.get("/", response_model=list[BookingResponse])
def list_all_bookings(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
):
    """List all bookings (admin only)."""
    return db.query(Booking).all()


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_booking(
    booking_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Cancel a booking. Users can only cancel their own; admins can cancel any."""
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    if current_user.role != "admin" and booking.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to cancel this booking")

    # Free up the slot
    slot = db.get(ParkingSlot, booking.slot_id)
    if slot and slot.status == SlotStatus.booked:
        slot.status = SlotStatus.free

    db.delete(booking)
    db.commit()
