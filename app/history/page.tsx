"use client";

// 1. Imports at the very top
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

// 2. HistoryItem Interface definition
interface HistoryItem {
  id: string;
  alert_id: string;
  price: number;
  airline: string;
  stops: string;
  departure_time: string;
  arrival_time: string;
  checked_at: string;
  origin: string;
  destination: string;
}

export default function HistoryPage() {
  // 3. State variables for storing histories and loading status
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 4. useEffect pulling records cleanly from PriceHistory
  useEffect(() => {
    async function fetchHistory() {
      const { data, error } = await supabase
        .from("PriceHistory")
        .select("*")
        .order("checked_at", {
          ascending: false,
        });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setHistory(data || []);
      setLoading(false);
    }

    fetchHistory();
  }, []);

  // 5. Return section displaying heading and looping through all history records
  return (
    <main
      style={{
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Price History</h1>

      {loading && <p>Loading...</p>}

      {!loading && history.length === 0 && (
        <p>No history records found.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {!loading &&
          history.map((item) => (
            // 6. History cards mapping out all specified tracking details
            <div
              key={item.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "12px",
                maxWidth: "400px"
              }}
            >
              {/* Added Route at the very top of the list item */}
              <p>
                <strong>Route:</strong> {item.origin || "N/A"} → {item.destination || "N/A"}
              </p>

              <p>
                <strong>Price:</strong> £{item.price}
              </p>

              <p>
                <strong>Airline:</strong> {item.airline}
              </p>

              <p>
                <strong>Stops:</strong> {item.stops}
              </p>

              <p>
                <strong>Departure:</strong> {item.departure_time}
              </p>

              <p>
                <strong>Arrival:</strong> {item.arrival_time}
              </p>

              <p>
                <strong>Checked:</strong> {item.checked_at ? new Date(item.checked_at).toLocaleString() : "N/A"}
              </p>
            </div>
          ))}
      </div>
    </main>
  );
}
