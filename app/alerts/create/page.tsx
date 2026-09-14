"use client";

import { useEffect, useState } from "react";
// 2. Add your Supabase import from lib/supabase.ts
import { supabase } from "../../../lib/supabase";

// Defining a TypeScript interface for the Alert object type
interface Alert {
  id: string;
  origin: string;
  destination: string;
  target_price: number;
  email: string;
  alert_sent: boolean;
}

export default function CreateAlertPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // 3. Make the page load data from Supabase
  useEffect(() => {
    async function fetchAlerts() {
      // Open the Alerts table and get every row
      const { data, error } = await supabase
        .from("Alerts")
        .select("id,origin, destination, target_price, email, alert_sent");

      // 4. Add error handling
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

    fetchAlerts();
  }, []);

  return (
    <main style={{ padding: "20px", fontFamily: "sans-serif" }}>
      {/* 5. Add a page heading */}
      <h1>All Alerts</h1>

      {loading && <p>Loading alerts...</p>}
      
      {/* Displaying error if it occurs */}
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      {!loading && !errorMsg && alerts.length === 0 && (
        <p>No alerts found.</p>
      )}

      {/* 6. Loop through the alerts */}
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {alerts.map((alert, index) => (
          <div 
            key={index} 
            style={{ 
              border: "1px solid #ccc", 
              padding: "15px", 
              borderRadius: "8px",
              maxWidth: "400px"
            }}
          >
            {/* 7. For each alert display the required database columns */}
            <p><strong>Route:</strong> {alert.origin} → {alert.destination}</p>
            <p><strong>Target Price:</strong> £{alert.target_price}</p>
            <p><strong>Email:</strong> {alert.email}</p>
            
            {/* 8. Convert alert_sent into readable text */}
            <p>
              <strong>Status:</strong>{" "}
              {alert.alert_sent ? (
                <span style={{ color: "gray" }}>Triggered</span>
              ) : (
                <span style={{ color: "green", fontWeight: "bold" }}>Active</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
