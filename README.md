# Smart Parking System — Full Stack

A full-stack parking management app built with **FastAPI** (backend) and **React** (frontend).

---

## Project Structure

```
smart-parking/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── auth.py
│   │   ├── models/        (User, ParkingSlot, Booking)
│   │   ├── schemas/       (Pydantic schemas)
│   │   └── routers/       (auth, slots, bookings)
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── api.js          (all fetch calls to backend)
│   │   ├── context/        (AuthContext)
│   │   ├── components/     (Navbar, SlotCard, ParkingMap)
│   │   └── pages/          (Login, Register, Dashboard, Admin)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## Prerequisites

- Python 3.11+
- Node.js 18+ and npm

---

## 1 — Run the Backend

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate          # macOS/Linux
# venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload
```

Backend runs at: **http://localhost:8000**
Swagger docs at: **http://localhost:8000/docs**

---

## 2 — Run the Frontend

Open a **new terminal tab**:

```bash
cd frontend

npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 3 — Google Maps Setup

1. Go to https://console.cloud.google.com/
2. Create a project → Enable **Maps JavaScript API**
3. Create an API key
4. Open `frontend/src/components/ParkingMap.jsx`
5. Replace `YOUR_GOOGLE_MAPS_API_KEY` with your key

When adding parking slots (admin panel), enter latitude/longitude to show them as map markers.

---

## Quick Start Guide

1. Open **http://localhost:5173/register**
2. Register an **admin** account (select role = Admin)
3. Register a regular **user** account
4. Login as admin → go to **Admin Panel** → add parking slots
5. Login as user → go to **Dashboard** → book a free slot
6. In **My Bookings**, click **Pay** to simulate payment
7. Click **Map View** to see slots on Google Maps (requires API key + lat/lng on slots)

---

## API Summary

| Method | Endpoint              | Auth     | Description              |
|--------|-----------------------|----------|--------------------------|
| POST   | /auth/register        | Public   | Register user            |
| POST   | /auth/login           | Public   | Login, get JWT token     |
| GET    | /slots/               | User     | List all slots           |
| POST   | /slots/               | Admin    | Create slot              |
| PUT    | /slots/{id}           | Admin    | Update slot              |
| DELETE | /slots/{id}           | Admin    | Delete slot              |
| POST   | /bookings/            | User     | Book a slot              |
| GET    | /bookings/me          | User     | My bookings              |
| GET    | /bookings/            | Admin    | All bookings             |
| POST   | /bookings/{id}/pay    | User     | Simulate payment         |
| DELETE | /bookings/{id}        | User     | Cancel booking           |
