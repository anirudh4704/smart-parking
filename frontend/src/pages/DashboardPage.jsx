import { useEffect, useState } from "react";
import { getSlots, getMyBookings, cancelBooking, simulatePayment } from "../api";
import SlotCard from "../components/SlotCard";
import ParkingMap from "../components/ParkingMap";

export default function DashboardPage() {
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("slots"); // "slots" | "bookings" | "map"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const [slotsData, bookingsData] = await Promise.all([
        getSlots(),
        getMyBookings(),
      ]);
      setSlots(slotsData);
      setBookings(bookingsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleCancel(bookingId) {
    if (!confirm("Cancel this booking?")) return;
    try {
      await cancelBooking(bookingId);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handlePay(bookingId) {
    try {
      await simulatePayment(bookingId, "paid");
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div className="page"><p>Loading…</p></div>;
  if (error)   return <div className="page"><p className="error-msg">{error}</p></div>;

  return (
    <div className="page">
      <div className="section-header">
        <h2>Parking Dashboard</h2>
        <span style={{ fontSize: "0.9rem", color: "#888" }}>
          {slots.filter((s) => s.status === "free").length} / {slots.length} slots free
        </span>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === "slots" ? "active" : ""}`} onClick={() => setTab("slots")}>
          All Slots
        </button>
        <button className={`tab ${tab === "bookings" ? "active" : ""}`} onClick={() => setTab("bookings")}>
          My Bookings ({bookings.length})
        </button>
        <button className={`tab ${tab === "map" ? "active" : ""}`} onClick={() => setTab("map")}>
          Map View
        </button>
      </div>

      {/* All Slots */}
      {tab === "slots" && (
        <div className="slots-grid">
          {slots.length === 0 && <p>No parking slots available.</p>}
          {slots.map((slot) => (
            <SlotCard key={slot.id} slot={slot} onBooked={fetchData} />
          ))}
        </div>
      )}

      {/* My Bookings */}
      {tab === "bookings" && (
        <>
          {bookings.length === 0 ? (
            <p>You have no bookings yet.</p>
          ) : (
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Slot ID</th>
                  <th>Fee</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td>Slot #{b.slot_id}</td>
                    <td style={{ fontWeight: 600 }}>₹50</td>
                    <td>
                      <span className={`slot-status status-${b.payment_status === "paid" ? "free" : b.payment_status === "failed" ? "occupied" : "booked"}`}>
                        {b.payment_status}
                      </span>
                    </td>
                    <td style={{ display: "flex", gap: "8px" }}>
                      {b.payment_status === "pending" && (
                        <button className="btn btn-sm btn-secondary" onClick={() => handlePay(b.id)}>
                          Pay
                        </button>
                      )}
                      <button className="btn btn-sm" onClick={() => handleCancel(b.id)}>
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Map View */}
      {tab === "map" && <ParkingMap slots={slots} />}
    </div>
  );
}
