# Smart Parking System — FastAPI Backend

A REST API for managing parking slots and bookings, built with FastAPI, SQLAlchemy, and SQLite.

---

## Project Structure

```
smart_parking/
├── app/
│   ├── main.py            # App entry point, router registration
│   ├── database.py        # SQLAlchemy engine & session
│   ├── auth.py            # JWT auth, password hashing, dependencies
│   ├── models/
│   │   ├── user.py        # User ORM model
│   │   ├── parking_slot.py# ParkingSlot ORM model
│   │   └── booking.py     # Booking ORM model
│   ├── schemas/
│   │   ├── user.py        # Pydantic schemas for users
│   │   ├── parking_slot.py# Pydantic schemas for slots
│   │   └── booking.py     # Pydantic schemas for bookings
│   └── routers/
│       ├── auth.py        # /auth/register, /auth/login
│       ├── parking_slots.py # CRUD for /slots
│       └── bookings.py    # Booking endpoints /bookings
├── requirements.txt
└── README.md
```

---

## Setup & Run

### 1. Create and activate a virtual environment

```bash
python -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Start the server

```bash
uvicorn app.main:app --reload
```

The API will be available at **http://127.0.0.1:8000**

Interactive docs: **http://127.0.0.1:8000/docs**

---

## API Overview

### Auth

| Method | Endpoint         | Description              | Auth required |
|--------|-----------------|--------------------------|---------------|
| POST   | /auth/register  | Register a new user      | No            |
| POST   | /auth/login     | Login, returns JWT token | No            |

### Parking Slots

| Method | Endpoint       | Description                  | Auth required |
|--------|---------------|------------------------------|---------------|
| GET    | /slots/       | List all slots               | User          |
| GET    | /slots/{id}   | Get a slot by ID             | User          |
| POST   | /slots/       | Create a slot                | Admin         |
| PUT    | /slots/{id}   | Update a slot                | Admin         |
| DELETE | /slots/{id}   | Delete a slot                | Admin         |

### Bookings

| Method | Endpoint            | Description                    | Auth required |
|--------|--------------------|---------------------------------|---------------|
| POST   | /bookings/         | Book a free slot                | User          |
| GET    | /bookings/me       | My bookings                     | User          |
| GET    | /bookings/         | All bookings                    | Admin         |
| DELETE | /bookings/{id}     | Cancel a booking                | User / Admin  |

---

## Authentication

1. Register a user via `POST /auth/register`
2. Login via `POST /auth/login` to receive a JWT token
3. Pass the token in the `Authorization` header for protected routes:
   ```
   Authorization: Bearer <your_token>
   ```

To create an **admin** user, set `"role": "admin"` in the register payload.

---

## Slot Status Values

- `free` — available for booking
- `booked` — reserved by a user
- `occupied` — physically occupied (set manually by admin)

## Payment Status Values

- `pending` — default on booking creation
- `paid` — payment confirmed
- `failed` — payment failed
