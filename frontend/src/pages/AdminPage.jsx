import { useEffect, useState } from "react";
import { getSlots, createSlot, updateSlot, deleteSlot, getAllBookings } from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const EMPTY_FORM = {
  location: "",
  status: "free",
  latitude: "",
  longitude: "",
};

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState({ text: "", type: "" });

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== "admin") navigate("/dashboard");
  }, [user]);

  async function fetchData() {
    const [s, b] = await Promise.all([getSlots(), getAllBookings()]);
    setSlots(s);
    setBookings(b);
  }

  useEffect(() => { fetchData(); }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg({ text: "", type: "" });

    // Build payload — only include lat/lng if provided
    const payload = {
      location: form.location,
      status: form.status,
      ...(form.latitude  ? { latitude:  parseFloat(form.latitude)  } : {}),
      ...(form.longitude ? { longitude: parseFloat(form.longitude) } : {}),
    };

    try {
      if (editingId) {
        await updateSlot(editingId, payload);
        setMsg({ text: "Slot updated!", type: "success" });
      } else {
        await createSlot(payload);
        setMsg({ text: "Slot created!", type: "success" });
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      fetchData();
    } catch (err) {
      setMsg({ text: err.message, type: "error" });
    }
  }

  function startEdit(slot) {
    setEditingId(slot.id);
    setForm({
      location: slot.location,
      status: slot.status,
      latitude: slot.latitude ?? "",
      longitude: slot.longitude ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!confirm("Delete this slot?")) return;
    try {
      await deleteSlot(id);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="page">
      <h2 style={{ marginBottom: "24px" }}>Admin Panel</h2>

      {/* ── Add / Edit Slot Form ── */}
      <div className="admin-form">
        <h3>{editingId ? `Edit Slot #${editingId}` : "Add New Slot"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Location Name</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="e.g. Level 1 - A3"
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="free">Free</option>
              <option value="occupied">Occupied</option>
              <option value="booked">Booked</option>
            </select>
          </div>
          <div className="inline-group">
            <div className="form-group">
              <label>Latitude (optional)</label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="37.7749"
              />
            </div>
            <div className="form-group">
              <label>Longitude (optional)</label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="-122.4194"
              />
            </div>
          </div>

          {msg.text && (
            <p className={msg.type === "success" ? "success-msg" : "error-msg"}>
              {msg.text}
            </p>
          )}

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn" type="submit" style={{ flex: 1 }}>
              {editingId ? "Update Slot" : "Add Slot"}
            </button>
            {editingId && (
              <button
                className="btn btn-secondary"
                type="button"
                style={{ flex: 1 }}
                onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Slots Table ── */}
      <h3 style={{ marginBottom: "12px" }}>All Slots ({slots.length})</h3>
      <table className="bookings-table" style={{ marginBottom: "40px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Location</th>
            <th>Status</th>
            <th>Lat / Lng</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot.id}>
              <td>#{slot.id}</td>
              <td>{slot.location}</td>
              <td>
                <span className={`slot-status status-${slot.status}`}>{slot.status}</span>
              </td>
              <td style={{ fontSize: "0.8rem", color: "#888" }}>
                {slot.latitude && slot.longitude
                  ? `${slot.latitude}, ${slot.longitude}`
                  : "—"}
              </td>
              <td style={{ display: "flex", gap: "8px" }}>
                <button className="btn btn-sm btn-secondary" onClick={() => startEdit(slot)}>
                  Edit
                </button>
                <button className="btn btn-sm" onClick={() => handleDelete(slot.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── All Bookings Table ── */}
      <h3 style={{ marginBottom: "12px" }}>All Bookings ({bookings.length})</h3>
      <table className="bookings-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>User ID</th>
            <th>Slot ID</th>
            <th>Fee</th>
            <th>Payment</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>#{b.id}</td>
              <td>User #{b.user_id}</td>
              <td>Slot #{b.slot_id}</td>
              <td style={{ fontWeight: 600 }}>₹50</td>
              <td>
                <span className={`slot-status status-${b.payment_status === "paid" ? "free" : b.payment_status === "failed" ? "occupied" : "booked"}`}>
                  {b.payment_status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
