from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_admin
from app.database import get_db
from app.models.booking import Booking, PaymentStatus
from app.models.parking_slot import ParkingSlot, SlotStatus
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingResponse, PaymentUpdate

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("/", response_model=BookingResponse, status_code=201)
def create_booking(
    payload: BookingCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Book a free slot. Prevents double-booking."""
    slot = db.get(ParkingSlot, payload.slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    if slot.status != SlotStatus.free:
        raise HTTPException(
            status_code=409,
            detail=f"Slot is currently '{slot.status.value}' and cannot be booked",
        )

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
    """Get all bookings for the logged-in user."""
    return db.query(Booking).filter(Booking.user_id == current_user.id).all()


@router.get("/", response_model=list[BookingResponse])
def list_all_bookings(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
):
    """List all bookings (admin only)."""
    return db.query(Booking).all()


@router.post("/{booking_id}/pay", response_model=BookingResponse)
def simulate_payment(
    booking_id: int,
    payload: PaymentUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Simulate payment update for a booking."""
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if current_user.role != "admin" and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    booking.payment_status = payload.payment_status
    db.commit()
    db.refresh(booking)
    return booking


@router.delete("/{booking_id}", status_code=204)
def cancel_booking(
    booking_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Cancel a booking and free the slot."""
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if current_user.role != "admin" and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to cancel this booking")

    slot = db.get(ParkingSlot, booking.slot_id)
    if slot and slot.status == SlotStatus.booked:
        slot.status = SlotStatus.free

    db.delete(booking)
    db.commit()
