"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

function ResultsContent() {
  const searchParams = useSearchParams();
  const [flights, setFlights] = useState<any[]>([]);
  const [loadingFlights, setLoadingFlights] = useState(true);
  const [alertPrice, setAlertPrice] = useState("");

  const from = searchParams.get("from") || "MAN";
  const to = searchParams.get("to") || "JFK";
  const depart = searchParams.get("depart") || "N/A";
  const retDate = searchParams.get("return") || "N/A";
  const passengers = searchParams.get("passengers") || "1";
  const email = searchParams.get("email") || "user@example.com";

  useEffect(() => {
    async function loadFlights() {
      try {
        const response = await fetch(
          `/api/flights/search?origin=${from}&destination=${to}&depart=${depart}&return=${retDate}`
        );
        const data = await response.json();
        data.sort((a: any, b: any) => a.price - b.price);
        console.log("Flights returned:", data);
        setFlights(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingFlights(false);
      }
    }
    loadFlights();
  }, [from, to, depart, retDate]);

  async function trackPrice(flight: any) {
    if (!alertPrice) {
      alert("Please enter an alert price.");
      return;
    }

    console.log("FROM:", from);
    console.log("TO:", to);
    console.log("DEPART:", depart);
    console.log("RETURN:", retDate);
    console.log("EMAIL:", email);

    const stopsText = flight.layovers?.length
      ? `${flight.layovers.length} Stop${flight.layovers.length > 1 ? "s" : ""} (${flight.layovers.map((l: any) => l.name || l.id).join(", ")})`
      : "Direct";

    const { data: alertRecord, error } = await supabase
      .from("Alerts")
      .insert({
        origin: from.toUpperCase(),
        destination: to.toUpperCase(),
        target_price: Number(alertPrice),
        email: email,
        active: true,
        alert_sent: false,
        last_airline: flight.flights?.[0]?.airline || "Unknown Airline",
        last_price_found: flight.price,
        departure_date: depart,
        return_date: retDate,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert(`Error creating price alert: ${error.message}`);
    } else {
      const { error: historyError } = await supabase
        .from("PriceHistory")
        .insert({
          alert_id: alertRecord.id,
          origin: from.toUpperCase(),
          destination: to.toUpperCase(),
          price: flight.price,
          airline: flight.flights?.[0]?.airline || "Unknown Airline",
          stops: stopsText,
          departure_time: depart,
          arrival_time: retDate,
          search_source: "Search Results",
          checked_at: new Date().toISOString()
        });

      if (historyError) {
        console.error("Error creating price history entry:", historyError);
        alert(`PriceHistory Error: ${historyError.message}`);
      }

      alert(
        `Success! We will notify you when this flight falls below £${alertPrice}.`
      );
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Search Criteria Card */}
      <div style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px", background: "#f9f9f9" }}>
        <p style={{ margin: "5px 0" }}><strong>Route:</strong> {from.toUpperCase()} → {to.toUpperCase()}</p>
        <p style={{ margin: "5px 0" }}><strong>Departure Date:</strong> {depart}</p>
        <p style={{ margin: "5px 0" }}><strong>Return Date:</strong> {retDate}</p>
        <p style={{ margin: "5px 0" }}><strong>Passengers:</strong> {passengers}</p>
      </div>

      {/* Available Flights Section */}
      <div>
        <h2 style={{ marginBottom: "15px" }}>Available Flights</h2>
        
        {loadingFlights && <p>Loading flights...</p>}

        {!loadingFlights && flights.length === 0 && <p>No flights found for this search route.</p>}

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
          gap: "20px" 
        }}>
          {!loadingFlights && flights.map((flight, idx) => (
            <div 
              key={flight.id || idx} 
              style={{ 
                border: idx === 0 ? "2px solid #ffd700" : "1px solid #ddd", 
                borderRadius: "8px", 
                padding: "15px",
                background: "#fff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                {idx === 0 && (
                  <div style={{
                    display: "inline-block",
                    backgroundColor: "#ffd700",
                    color: "#333",
                    fontWeight: "bold",
                    fontSize: "12px",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    marginBottom: "8px"
                  }}>
                    🏆 Cheapest Flight
                  </div>
                )}

                <h3 style={{ margin: "0 0 5px 0" }}>
                  {flight.flights?.[0]?.airline || "Unknown Airline"}
                </h3>
                
                <p style={{ margin: "0 0 2px 0", fontSize: "20px", fontWeight: "bold", color: "#0275d8" }}>
                  £{flight.price}
                </p>

                {flight.total_duration && (
                  <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#555" }}>
                    ⏱️ <strong>Duration:</strong> {Math.floor(flight.total_duration / 60)}h {(flight.total_duration % 60).toString().padStart(2, "0")}m
                  </p>
                )}
                
                <p style={{ margin: "0 0 16px 0", color: "#666", fontSize: "14px", lineHeight: "1.4" }}>
                  {flight.layovers?.length
                    ? `${flight.layovers.length} Stop${flight.layovers.length > 1 ? "s" : ""} (${flight.layovers.map((l: any) => l.name || l.id).join(", ")})`
                    : "Direct"}
                </p>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto" }}>
                <button 
                  type="button"
                  onClick={() => window.open("https://google.com", "_blank")}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "#5cb85c",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    width: "100%",
                    marginBottom: "6px"
                  }}
                >
                  Book Now
                </button>

                <div style={{ marginBottom: "6px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px", color: "#333" }}>
                    Alert Price (£)
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#666", fontSize: "14px" }}>£</span>
                    <input 
                      type="number"
                      placeholder="e.g. 350"
                      value={alertPrice}
                      onChange={(e) => setAlertPrice(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 8px 8px 22px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        boxSizing: "border-box",
                        fontSize: "14px",
                        outline: "none"
                      }}
                    />
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => trackPrice(flight)}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "#0275d8",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    width: "100%"
                  }}
                >
                  Create Alert
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: "25px", textAlign: "center" }}>Search Results</h1>
      
      <Suspense fallback={<p style={{ textAlign: "center" }}>Loading search parameters...</p>}>
        <ResultsContent />
      </Suspense>
    </div>
  );
}
