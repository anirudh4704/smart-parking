import { bookSlot } from "../api";

// Booking fee in Indian Rupees
const BOOKING_FEE = 50;

/**
 * Displays a single parking slot card with a Book button if free.
 */
export default function SlotCard({ slot, onBooked }) {
  async function handleBook() {
    try {
      await bookSlot(slot.id);
      onBooked(); // refresh parent
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className={`slot-card ${slot.status}`}>
      <span className="slot-id">Slot #{slot.id}</span>
      <span className="slot-location">{slot.location}</span>
      <span className={`slot-status status-${slot.status}`}>{slot.status}</span>
      <span style={{ fontSize: "0.85rem", color: "#555" }}>
        Fee: <strong>₹{BOOKING_FEE}</strong>
      </span>
      {slot.status === "free" && (
        <button className="btn btn-sm" onClick={handleBook}>
          Book Now — ₹{BOOKING_FEE}
        </button>
      )}
    </div>
  );
}
