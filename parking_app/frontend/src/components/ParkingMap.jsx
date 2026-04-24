import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/**
 * Automatically fits the map bounds to show all markers.
 */
function FitBounds({ slots }) {
  const map = useMap();
  useEffect(() => {
    if (slots.length === 0) return;
    const bounds = slots.map((s) => [s.latitude, s.longitude]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [slots, map]);
  return null;
}

/**
 * Shows parking slots as colored circle markers on OpenStreetMap.
 * Green = free, Yellow = booked, Red = occupied.
 * No API key required.
 */
export default function ParkingMap({ slots }) {
  const mappableSlots = slots.filter((s) => s.latitude && s.longitude);

  function markerColor(status) {
    if (status === "free") return "#27ae60";
    if (status === "booked") return "#f39c12";
    return "#e74c3c";
  }

  if (mappableSlots.length === 0) {
    return (
      <div
        className="map-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
          gap: "12px",
        }}
      >
        <span style={{ fontSize: "2rem" }}>🗺️</span>
        <p style={{ fontWeight: 600 }}>No slots with coordinates yet</p>
        <p style={{ fontSize: "0.85rem", color: "#888", textAlign: "center", maxWidth: 360 }}>
          Go to <strong>Admin Panel</strong> → edit a slot → add Latitude &amp;
          Longitude to see it on the map.
        </p>
      </div>
    );
  }

  // Start centered on first slot — FitBounds will adjust automatically
  const center = [mappableSlots[0].latitude, mappableSlots[0].longitude];

  return (
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto-fit map to show all markers */}
        <FitBounds slots={mappableSlots} />

        {mappableSlots.map((slot) => (
          <CircleMarker
            key={slot.id}
            center={[slot.latitude, slot.longitude]}
            radius={14}
            pathOptions={{
              color: markerColor(slot.status),
              fillColor: markerColor(slot.status),
              fillOpacity: 0.85,
            }}
          >
            <Popup>
              <strong>{slot.location}</strong>
              <br />
              Status:{" "}
              <span style={{ color: markerColor(slot.status), fontWeight: 600 }}>
                {slot.status.toUpperCase()}
              </span>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
