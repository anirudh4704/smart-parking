from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, bookings, parking_slots

# Create all DB tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Parking System",
    description="REST API for managing parking slots and bookings",
    version="1.0.0",
)

# Allow React dev server to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(parking_slots.router)
app.include_router(bookings.router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Smart Parking API is running"}
