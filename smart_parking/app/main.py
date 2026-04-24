from fastapi import FastAPI

from app.database import Base, engine
from app.routers import auth, bookings, parking_slots

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Parking System",
    description="REST API for managing parking slots and bookings",
    version="1.0.0",
)

app.include_router(auth.router)
app.include_router(parking_slots.router)
app.include_router(bookings.router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Smart Parking System is running"}
