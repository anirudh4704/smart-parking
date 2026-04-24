// Base URL for the FastAPI backend
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Generic fetch wrapper — attaches JWT token if present.
 */
async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || "Request failed");
  }

  // 204 No Content — return null
  if (res.status === 204) return null;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────
export const register = (data) =>
  request("/auth/register", { method: "POST", body: JSON.stringify(data) });

export const login = (data) =>
  request("/auth/login", { method: "POST", body: JSON.stringify(data) });

// ── Parking Slots ─────────────────────────────────────
export const getSlots = () => request("/slots/");

export const createSlot = (data) =>
  request("/slots/", { method: "POST", body: JSON.stringify(data) });

export const updateSlot = (id, data) =>
  request(`/slots/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteSlot = (id) =>
  request(`/slots/${id}`, { method: "DELETE" });

// ── Bookings ──────────────────────────────────────────
export const bookSlot = (slotId) =>
  request("/bookings/", { method: "POST", body: JSON.stringify({ slot_id: slotId }) });

export const getMyBookings = () => request("/bookings/me");

export const getAllBookings = () => request("/bookings/");

export const cancelBooking = (id) =>
  request(`/bookings/${id}`, { method: "DELETE" });

export const simulatePayment = (bookingId, paymentStatus) =>
  request(`/bookings/${bookingId}/pay`, {
    method: "POST",
    body: JSON.stringify({ payment_status: paymentStatus }),
  });
