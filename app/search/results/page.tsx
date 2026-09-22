"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase"; 

function ResultsContent() {
  const searchParams = useSearchParams();
  const [flights, setFlights] = useState<any[]>([]);
  const [loadingFlights, setLoadingFlights] = useState(true);
  const [alertPrice, setAlertPrice] = useState("");

  // Custom Modal States Matrix
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEmail, setModalEmail] = useState("");
  const [activeFlight, setActiveFlight] = useState<any>(null);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState(false);

  const from = searchParams.get("from") || "MAN";
  const to = searchParams.get("to") || "JFK";
  
  const depart = searchParams.get("depart") && searchParams.get("depart") !== "N/A" && searchParams.get("depart") !== "" ? searchParams.get("depart") : null;
  const retDate = searchParams.get("return") && searchParams.get("return") !== "N/A" && searchParams.get("return") !== "" ? searchParams.get("return") : null;
  const passengers = searchParams.get("passengers") || "1";
  const emailParam = searchParams.get("email") || "user@example.com";

  useEffect(() => {
    async function loadFlights() {
      try {
        const response = await fetch(
          `/api/flights/search?origin=${from}&destination=${to}&depart=${depart || ""}&return=${retDate || ""}`
        );
        if (!response.ok) throw new Error("API Offline");
        const data = await response.json();
        
        if (data && Array.isArray(data) && data.length > 0) {
          data.sort((a: any, b: any) => a.price - b.price);
          setFlights(data);
        } else {
          useMockFallback();
        }
      } catch (error) {
        useMockFallback();
      } finally {
        setLoadingFlights(false);
      }
    }

    function useMockFallback() {
      setFlights([
        { id: "FL-BA", price: 289, total_duration: 460, flights: [{ airline: "British Airways" }], layovers: [] },
        { id: "FL-VA", price: 345, total_duration: 520, flights: [{ airline: "Virgin Atlantic" }], layovers: [] },
        { id: "FL-AF", price: 210, total_duration: 780, flights: [{ airline: "Air France" }], layovers: [{ id: "CDG", name: "Paris" }] }
      ]);
    }

    loadFlights();
  }, [from, to, depart, retDate]);

  const handleGoogleFlightsRedirect = () => {
    const outboundString = depart ? `on ${depart}` : "";
    const returnString = retDate ? `through ${retDate}` : "";
    const passengerString = Number(passengers) > 1 ? `${passengers} passengers` : "1 passenger";
    
    const queryPayload = encodeURIComponent(`Flights to ${to} from ${from} ${outboundString} ${returnString} for ${passengerString}`);
    const googleFlightsUrl = `https://google.com{queryPayload}&curr=GBP&hl=en-GB`;
    
    window.open(googleFlightsUrl, "_blank");
  };

  // Triggers the beautiful Custom Modal popup block
  const handleAlertButtonClick = (flight: any) => {
    const cleanPrice = Number(alertPrice);
    if (!alertPrice || isNaN(cleanPrice) || cleanPrice <= 0) {
      alert("Please enter a valid target alert price (£) greater than 0 first.");
      return;
    }
    
    setActiveFlight(flight);
    setModalError("");
    setModalSuccess(false);
    
    if (emailParam && emailParam !== "user@example.com") {
      setModalEmail(emailParam);
    } else {
      setModalEmail("");
    }
    setIsModalOpen(true);
  };

  // Validates email schemas and submits metrics straight to your database lines
  const handleConfirmAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    // Email schema format validation checker pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!modalEmail.trim() || !emailRegex.test(modalEmail.trim())) {
      setModalError("Please enter a genuine, valid email address format (e.g. name@domain.com).");
      return;
    }

    // Dynamic future backup generator stops null data constraint aborts if calendar options are open
    const fallbackDateString = new Date().toISOString().split("T")[0];
    const validatedDepartDate = depart ? depart : fallbackDateString;
    const validatedReturnDate = retDate ? retDate : fallbackDateString;

    try {
      const { data: alertRecord, error } = await supabase
        .from("Alerts")
        .insert({
          origin: from.toUpperCase(),
          destination: to.toUpperCase(),
          target_price: Number(alertPrice),
          email: modalEmail.trim(),
          active: true,
          alert_sent: false,
          last_airline: activeFlight?.flights?.[0]?.airline || "Various Airlines",
          last_price_found: activeFlight?.price || 0,
          departure_date: validatedDepartDate, 
          return_date: validatedReturnDate,   
        })
        .select()
        .single();

      if (error) throw error;

      if (alertRecord) {
        await supabase.from("PriceHistory").insert({
          alert_id: alertRecord.id,
          origin: from.toUpperCase(),
          destination: to.toUpperCase(),
          price: activeFlight?.price || 0,
          airline: activeFlight?.flights?.[0]?.airline || "Various Airlines",
          stops: activeFlight?.layovers?.length ? `${activeFlight.layovers.length} Stop` : "Direct",
          departure_time: validatedDepartDate,
          arrival_time: validatedReturnDate,
          search_source: "Search Results",
          checked_at: new Date().toISOString()
        });
      }

      setModalSuccess(true);
      setAlertPrice("");
      setTimeout(() => {
        setIsModalOpen(false);
        setModalSuccess(false);
      }, 2500);

    } catch (err: any) {
      console.error(err);
      setModalError(`Database Error: ${err.message || "Failed to commit track details."}`);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Search Criteria Layout Bar */}
      <div style={{ border: "1px solid rgba(255, 255, 255, 0.2)", padding: "20px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(5px)", color: "#ffffff" }}>
        <p style={{ margin: "5px 0", fontSize: "16px" }}><strong>Route:</strong> {from.toUpperCase()} → {to.toUpperCase()}</p>
        <p style={{ margin: "5px 0", fontSize: "14px", opacity: 0.9 }}><strong>Departure Date:</strong> {depart || "Open / Flexible Date"}</p>
        <p style={{ margin: "5px 0", fontSize: "14px", opacity: 0.9 }}><strong>Return Date:</strong> {retDate || "Open / Flexible Date"}</p>
        <p style={{ margin: "5px 0", fontSize: "14px", opacity: 0.9 }}><strong>Passengers:</strong> {passengers}</p>
      </div>

      <div>
        <h2 style={{ marginBottom: "15px", color: "#ffffff", fontSize: "24px", fontWeight: "700" }}>Available Flights</h2>
        {loadingFlights && <p style={{ color: "#ffffff", opacity: 0.8 }}>Scanning live flight parameters...</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {flights.map((flight, idx) => (
            <div key={flight.id || idx} style={{ border: idx === 0 ? "2px solid #ffd700" : "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", background: "#ffffff", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#111827" }}>
              <div>
                {idx === 0 && <div style={{ display: "inline-block", backgroundColor: "#ffd700", color: "#111827", fontWeight: "bold", fontSize: "11px", padding: "4px 8px", borderRadius: "4px", marginBottom: "10px" }}>🏆 Cheapest Flight</div>}
                <h3 style={{ margin: "0 0 5px 0" }}>{flight.flights?.[0]?.airline || "Various Airlines"}</h3>
                <p style={{ margin: "0 0 4px 0", fontSize: "24px", fontWeight: "900", color: "#2563eb" }}>£{flight.price}</p>
                <p style={{ margin: "0 0 16px 0", color: "#4b5563", fontSize: "13px" }}>{flight.layovers?.length ? `${flight.layovers.length} Stop(s)` : "Direct"}</p>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid #f3f4f6", paddingTop: "14px" }}>
                <button type="button" onClick={handleGoogleFlightsRedirect} style={{ padding: "10px 16px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>Book on Google Flights</button>
                
                <div style={{ margin: "6px 0" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px", color: "#374151" }}>Alert Price (£)</label>
                  <input type="number" placeholder="e.g. 350" value={alertPrice} onChange={(e) => setAlertPrice(e.target.value)} style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #d1d5db", boxSizing: "border-box", color: "#111827" }} />
                </div>

                <button type="button" onClick={() => handleAlertButtonClick(flight)} style={{ padding: "10px 16px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>Create Alert</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Custom Overlay Modal Popup Form Box Container Element */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", width: "100%", maxWidth: "450px", padding: "30px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)", color: "#111827", position: "relative", textAlign: "center", boxSizing: "border-box" }}>
            
            {!modalSuccess ? (
              <form onSubmit={handleConfirmAlert}>
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>🔔</div>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "22px", fontWeight: "bold" }}>Set Price Track Alert</h3>
                <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: "#4b5563", lineHeight: "1.4" }}>
                  We will notify you immediately when flights from <strong>{from}</strong> to <strong>{to}</strong> fall below <strong>£{alertPrice}</strong>.
                </p>

                <div style={{ textAlign: "left", marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#374151" }}>Notification Email Address</label>
                  <input 
                    type="text" 
                    placeholder="you@example.com" 
                    value={modalEmail} 
                    onChange={(e) => setModalEmail(e.target.value)} 
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", boxSizing: "border-box", color: "#111827", fontSize: "15px", outline: "none" }} 
                  />
                  {modalError && (
                    <p style={{ margin: "8px 0 0 0", color: "#dc2626", fontSize: "12px", fontWeight: "bold" }}>⚠️ {modalError}</p>
                  )}
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "25px" }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: "12px", backgroundColor: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ flex: 1, padding: "12px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)" }}>
                    Activate Track
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ padding: "20px 0" }}>
                <div style={{ fontSize: "50px", marginBottom: "15px" }}>🚀</div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "24px", color: "#16a34a", fontWeight: "bold" }}>Alert Activated!</h3>
                <p style={{ margin: "0", fontSize: "14px", color: "#4b5563" }}>
                  Track pipeline successfully armed. Check your inbox at <strong>{modalEmail}</strong> as soon as a price drop happens!
                </p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0070f3 0%, #000046 100%)", color: "#ffffff", fontFamily: "sans-serif", paddingBottom: "60px", padding: "20px" }}>
      
      <div style={{ textAlign: "center", padding: "40px 20px 25px 20px" }}>
        <h1 style={{ margin: "0 0 5px 0", fontSize: "48px", fontWeight: "900", letterSpacing: "-1px" }}>
          <Link href="/" style={{ color: "#ffffff", textDecoration: "none", transition: "opacity 0.2s" }} onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")} onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}>
            FlightWatcher
          </Link>
        </h1>
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", alignItems: "center", marginTop: "15px" }}>
          <Link href="/" style={{ backgroundColor: "#ffffff", color: "#0070f3", border: "none", padding: "8px 18px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", textDecoration: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
            🏠 Home
          </Link>
          <Link href="/live-deals" style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.3)", padding: "8px 18px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", textDecoration: "none" }}>
            ⬅️ Back to Live Deals
          </Link>
        </div>
      </div>

      <Suspense fallback={<p style={{ textAlign: "center", color: "#ffffff", opacity: 0.8 }}>Loading results panel...</p>}>
        <ResultsContent />
      </Suspense>
    </main>
  );
}
