"use client";

import { useEffect, useState } from "react";
// Import matching your current folder path structure
import { supabase } from "../../lib/supabase";

// Tell TypeScript about our Alert fields schema
interface Alert {
  id: string;
  origin: string;
  destination: string;
  target_price: number;
  email: string;
  alert_sent: boolean;
  active: boolean;
  last_price_found: number | null;
  last_airline: string | null;
  last_checked: string | null;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // States to handle inline editing controls
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTargetPrice, setEditTargetPrice] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Wrapped the fetching logic so we can call it again to refresh the dashboard indicators
  async function fetchAlerts() {
    const { data, error } = await supabase
      .from("Alerts")
      .select("id, origin, destination, target_price, email, alert_sent, active, last_price_found, last_airline, last_checked");

    if (error) {
      console.error(error);
      setErrorMsg("Error loading alerts");
      setLoading(false);
      return;
    }

    if (data) {
      setAlerts(data as Alert[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Compute metric calculations from internal component state array
  const totalAlerts = alerts.length;
  const activeAlerts = alerts.filter((alert) => alert.active).length;
  const pausedAlerts = alerts.filter((alert) => !alert.active).length;
  const triggeredAlerts = alerts.filter((alert) => alert.alert_sent).length;

  // Pause / Resume handler to toggle the active flag
  async function toggleMonitoring(id: string, currentActiveStatus: boolean) {
    const { error } = await supabase
      .from("Alerts")
      .update({ active: !currentActiveStatus })
      .eq("id", id);

    if (error) {
      console.error("Error updating status:", error);
      alert("Failed to update monitoring status.");
      return;
    }

    fetchAlerts();
  }

  // Delete handler to clear matching entries out from the database rows
  async function deleteAlert(id: string) {
    const confirmDelete = window.confirm("Are you sure you want to delete this alert?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("Alerts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting alert:", error);
      alert("Failed to delete alert.");
      return;
    }

    fetchAlerts();
  }

  // Active inline configuration values modifier entry point hook
  function startEditing(alert: Alert) {
    setEditingId(alert.id);
    setEditTargetPrice(alert.target_price.toString());
    setEditEmail(alert.email);
  }

  // Save changes handler to update tracking target figures
  async function saveChanges(id: string) {
    const { error } = await supabase
      .from("Alerts")
      .update({
        target_price: Number(editTargetPrice),
        email: editEmail
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating alert:", error);
      alert("Failed to save changes.");
      return;
    }

    setEditingId(null);
    fetchAlerts();
  }

  return (
    <main style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>All Alerts</h1>

      {/* Statistics Block */}
      <div style={{ marginBottom: "20px", lineHeight: "1.6" }}>
        <p><strong>Total Alerts:</strong> {totalAlerts}</p>
        <p><strong>Active Alerts:</strong> {activeAlerts}</p>
        <p><strong>Paused Alerts:</strong> {pausedAlerts}</p>
        <p><strong>Triggered Alerts:</strong> {triggeredAlerts}</p>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid #ccc", marginBottom: "20px" }} />

      {loading && <p>Loading alerts...</p>}
      
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      {!loading && !errorMsg && alerts.length === 0 && (
        <p>No alerts found.</p>
      )}

      {/* Grid wrapper looping individual alert item frames */}
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {alerts.map((alert) => {
          const isEditing = editingId === alert.id;

          return (
            <div 
              key={alert.id} 
              style={{ 
                border: "1px solid #ccc", 
                padding: "15px", 
                borderRadius: "8px",
                maxWidth: "400px"
              }}
            >
              <p><strong>Route:</strong> {alert.origin} → {alert.destination}</p>
              
              <p>
                <strong>Target Price:</strong>{" "}
                {isEditing ? (
                  <input 
                    type="number" 
                    value={editTargetPrice}
                    onChange={(e) => setEditTargetPrice(e.target.value)}
                    style={{ width: "80px", padding: "4px" }}
                  />
                ) : (
                  `£${alert.target_price}`
                )}
              </p>
              
              <p><strong>Last Price Found:</strong> {alert.last_price_found ? `£${alert.last_price_found}` : "N/A"}</p>
              <p><strong>Last Airline:</strong> {alert.last_airline || "N/A"}</p>
              <p><strong>Last Checked:</strong> {alert.last_checked ? new Date(alert.last_checked).toLocaleString() : "Never"}</p>

              <p>
                <strong>Email:</strong>{" "}
                {isEditing ? (
                  <input 
                    type="email" 
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    style={{ width: "200px", padding: "4px" }}
                  />
                ) : (
                  alert.email
                )}
              </p>
              
              <p>
                <strong>Status:</strong>{" "}
                {alert.alert_sent ? (
                  <span style={{ color: "gray" }}>Triggered</span>
                ) : (
                  <span style={{ color: "green", fontWeight: "bold" }}>Active</span>
                )}
              </p>

              <p>
                <strong>Monitoring:</strong>{" "}
                {alert.active ? (
                  <span style={{ color: "blue", fontWeight: "bold" }}>Active</span>
                ) : (
                  <span style={{ color: "orange", fontWeight: "bold" }}>Paused</span>
                )}
              </p>

              {/* Action Buttons Interface */}
              <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => saveChanges(alert.id)}
                      style={{ padding: "8px 12px", backgroundColor: "#0275d8", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      style={{ padding: "8px 12px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEditing(alert)}
                    style={{ padding: "8px 12px", backgroundColor: "#0275d8", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Edit Alert
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => toggleMonitoring(alert.id, alert.active)}
                  style={{ padding: "8px 12px", backgroundColor: alert.active ? "#f0ad4e" : "#5cb85c", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  {alert.active ? "Pause Alert" : "Resume Alert"}
                </button>

                <button
                  type="button"
                  onClick={() => deleteAlert(alert.id)}
                  style={{ padding: "8px 12px", backgroundColor: "#d9534f", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  Delete Alert
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </main>
  );
}
