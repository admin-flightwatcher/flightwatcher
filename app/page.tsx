"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase"; 

const STATIC_AIRPORTS = [
  { label: "London Heathrow (LHR)", city: "London", code: "LHR" },
  { label: "London Gatwick (LGW)", city: "London", code: "LGW" },
  { label: "London Stansted (STN)", city: "London", code: "STN" },
  { label: "London Luton (LTN)", city: "London", code: "LTN" },
  { label: "Manchester Airport (MAN)", city: "Manchester", code: "MAN" },
  { label: "Dublin Airport (DUB)", city: "Dublin", code: "DUB" },
  { label: "New York John F. Kennedy (JFK)", city: "New York", code: "JFK" },
  { label: "Orlando International (MCO)", city: "Orlando", code: "MCO" },
  { label: "Las Vegas Harry Reid (LAS)", city: "Las Vegas", code: "LAS" },
  { label: "Barbados Grantley Adams (BGI)", city: "Barbados", code: "BGI" },
  { label: "Dubai International (DXB)", city: "Dubai", code: "DXB" },
  { label: "Bangkok Suvarnabhumi (BKK)", city: "Bangkok", code: "BKK" },
  { label: "St Lucia Hewanorra (UVF)", city: "St Lucia", code: "UVF" },
  { label: "Maldives Velana (MLE)", city: "Maldives", code: "MLE" },
  { label: "Tokyo Haneda (HND)", city: "Tokyo", code: "HND" },
  { label: "Singapore Changi (SIN)", city: "Singapore", code: "SIN" },
];

export default function HomePage() {
  const router = useRouter();

  const [tripType, setTripType] = useState("return"); 
  const [fromSearch, setFromSearch] = useState("Manchester Airport (MAN)");
  const [fromCode, setFromCode] = useState("MAN");
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);

  const [toSearch, setToSearch] = useState("");
  const [toCode, setToCode] = useState("");
  const [toSuggestions, setToSuggestions] = useState<any[]>([]);

  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  
  const [departFlex, setDepartFlex] = useState("0");
  const [returnFlex, setReturnFlex] = useState("0");

  const [manDeals, setManDeals] = useState<any[]>([]);
  const [lonDeals, setLonDeals] = useState<any[]>([]);
  const [dubDeals, setDubDeals] = useState<any[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(true);

  useEffect(() => {
    async function fetchHubDeals() {
      try {
        const { data: man } = await supabase.from("Deals").select("*").eq("origin", "MAN").eq("active", true).order("price", { ascending: true }).limit(3);
        const { data: lon } = await supabase.from("Deals").select("*").eq("origin", "LHR").eq("active", true).order("price", { ascending: true }).limit(3);
        const { data: dub } = await supabase.from("Deals").select("*").eq("origin", "DUB").eq("active", true).order("price", { ascending: true }).limit(3);

        if (man) setManDeals(man);
        if (lon) setLonDeals(lon);
        if (dub) setDubDeals(dub);
      } catch (err) {
        console.error("Error retrieving trending hub deals:", err);
      } finally {
        setLoadingDeals(false);
      }
    }
    fetchHubDeals();
  }, []);

  useEffect(() => {
    if (fromSearch.length < 2 || fromCode) {
      setFromSuggestions([]);
      return;
    }
    const filtered = STATIC_AIRPORTS.filter(
      (a) =>
        a.city.toLowerCase().includes(fromSearch.toLowerCase()) ||
        a.label.toLowerCase().includes(fromSearch.toLowerCase()) ||
        a.code.toLowerCase().includes(fromSearch.toLowerCase())
    );
    setFromSuggestions(filtered.slice(0, 5));
  }, [fromSearch, fromCode]);

  useEffect(() => {
    if (toSearch.length < 2 || toCode) {
      setToSuggestions([]);
      return;
    }
    const filtered = STATIC_AIRPORTS.filter(
      (a) =>
        a.city.toLowerCase().includes(toSearch.toLowerCase()) ||
        a.label.toLowerCase().includes(toSearch.toLowerCase()) ||
        a.code.toLowerCase().includes(toSearch.toLowerCase())
    );
    setToSuggestions(filtered.slice(0, 5));
  }, [toSearch, toCode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromCode || !toCode) {
      alert("Please explicitly click one of the dropdown choices from the suggested lists.");
      return;
    }

    if (!departDate) {
      alert("Error: Departure date is mandatory.");
      return;
    }

    if (tripType === "return" && !returnDate) {
      alert("Error: Return date is mandatory for return trips. Please select a return date or switch to a One-Way flight.");
      return;
    }

    if (tripType === "return" && returnDate && new Date(returnDate) < new Date(departDate)) {
      alert("Error: Invalid Date Selection. Return date cannot be before the departure date.");
      return;
    }

    const resolvedReturnParam = tripType === "oneway" ? "" : returnDate;

    router.push(`/search/results?from=${fromCode}&to=${toCode}&depart=${departDate}&departFlex=${departFlex}&return=${resolvedReturnParam}&returnFlex=${returnFlex}&passengers=${passengers}&tripType=${tripType}`);
  };

  const renderDealCards = (dealsArray: any[]) => {
    if (dealsArray.length === 0) {
      return <p style={{ color: "#ffffff", opacity: 0.7, paddingLeft: "10px" }}>No active deals found from this hub right now.</p>;
    }

    const defaultFutureDate = new Date();
    defaultFutureDate.setDate(defaultFutureDate.getDate() + 14);
    const formattedFutureDate = defaultFutureDate.toISOString().split("T")[0];

    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px", width: "100%", margin: "15px 0 35px 0" }}>
        {dealsArray.map((deal) => (
          <div key={deal.id} style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "20px", color: "#111827", textAlign: "left", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "bold" }}>✈️ {deal.destination_name || "Special Deal"} ({deal.destination})</h4>
              <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#4b5563" }}>Route: {deal.origin} → {deal.destination}</p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f3f4f6", paddingTop: "10px", marginTop: "10px" }}>
              <span style={{ fontSize: "22px", fontWeight: "900", color: "#2563eb" }}>£{deal.price}</span>
              <Link href={`/search/results?from=${deal.origin}&to=${deal.destination}&depart=${formattedFutureDate}&return=&passengers=1&tripType=oneway`} style={{ backgroundColor: "#2563eb", color: "#ffffff", padding: "6px 14px", borderRadius: "6px", textDecoration: "none", fontSize: "13px", fontWeight: "bold" }}>
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const todayDateString = new Date().toISOString().split("T")[0];

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0070f3 0%, #000046 100%)", color: "#ffffff", fontFamily: "sans-serif", paddingBottom: "60px" }}>
      
      {/* HEADER UPDATE: Turned title into a hyperlink pointing to "/" */}
      <div style={{ textAlign: "center", padding: "60px 20px 30px 20px" }}>
        <h1 style={{ fontSize: "48px", fontWeight: "900", margin: "0 0 10px 0", letterSpacing: "-1px" }}>
          <Link href="/" style={{ color: "#ffffff", textDecoration: "none" }}>
            FlightWatcher
          </Link>
        </h1>
        <p style={{ fontSize: "18px", opacity: 0.9, maxWidth: "600px", margin: "0 auto 30px auto" }}>Discover cheap flights, hidden deals and mistake fares before everyone else.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
          <button type="button" style={{ backgroundColor: "#ffd700", color: "#111827", border: "none", padding: "12px 24px", borderRadius: "8px", fontWeight: "bold" }}>Join Free Alerts</button>
          <Link href="/live-deals" style={{ backgroundColor: "transparent", color: "#ffffff", border: "2px solid #ffffff", padding: "10px 24px", borderRadius: "8px", fontWeight: "bold", textDecoration: "none" }}>View Live Deals</Link>
        </div>
      </div>

      <div style={{ maxWidth: "1150px", margin: "0 auto 60px auto", padding: "0 20px" }}>
        
        {/* Trip Type Selector Toggle Buttons */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "12px", paddingLeft: "5px" }}>
          <button 
            type="button" 
            onClick={() => setTripType("return")}
            style={{
              padding: "8px 18px",
              borderRadius: "20px",
              border: "none",
              fontWeight: "bold",
              fontSize: "13px",
              cursor: "pointer",
              backgroundColor: tripType === "return" ? "#ffd700" : "rgba(255,255,255,0.2)",
              color: tripType === "return" ? "#111827" : "#ffffff",
              transition: "all 0.2s"
            }}
          >
            🔄 Return Trip
          </button>
          <button 
            type="button" 
            onClick={() => { setTripType("oneway"); setReturnDate(""); }}
            style={{
              padding: "8px 18px",
              borderRadius: "20px",
              border: "none",
              fontWeight: "bold",
              fontSize: "13px",
              cursor: "pointer",
              backgroundColor: tripType === "oneway" ? "#ffd700" : "rgba(255,255,255,0.2)",
              color: tripType === "oneway" ? "#111827" : "#ffffff",
              transition: "all 0.2s"
            }}
          >
            ➡️ One-Way Flight
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "25px", display: "flex", flexWrap: "wrap", gap: "15px", alignItems: "flex-end", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
          
          {/* Origin Input Search Block */}
          <div style={{ flex: "2", minWidth: "200px", position: "relative" }}>
            <label style={{ display: "block", color: "#4b5563", fontSize: "12px", fontWeight: "bold", marginBottom: "6px" }}>Origin City</label>
            <input type="text" value={fromSearch} onChange={(e) => { setFromSearch(e.target.value); setFromCode(""); }} style={{ width: "100%", padding: "11px", border: "1px solid #d1d5db", borderRadius: "8px", color: "#111827", boxSizing: "border-box" }} placeholder="Type London, Manchester..." required />
            {fromSuggestions.length > 0 && (
              <div style={{ position: "absolute", zIndex: 10, left: 0, right: 0, backgroundColor: "white", border: "1px solid #ccc", borderRadius: "6px", marginTop: "4px", maxHeight: "200px", overflowY: "auto", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                {fromSuggestions.map((s, idx) => (
                  <div key={idx} onClick={() => { setFromSearch(s.label); setFromCode(s.code); setFromSuggestions([]); }} style={{ padding: "10px", color: "#111827", cursor: "pointer", borderBottom: "1px solid #eee" }}>
                    ✈️ {s.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Destination Input Search Block */}
          <div style={{ flex: "2", minWidth: "200px", position: "relative" }}>
            <label style={{ display: "block", color: "#4b5563", fontSize: "12px", fontWeight: "bold", marginBottom: "6px" }}>Destination City</label>
            <input type="text" value={toSearch} onChange={(e) => { setToSearch(e.target.value); setToCode(""); }} style={{ width: "100%", padding: "11px", border: "1px solid #d1d5db", borderRadius: "8px", color: "#111827", boxSizing: "border-box" }} placeholder="Type London, Dubai, New York..." required />
            {toSuggestions.length > 0 && (
              <div style={{ position: "absolute", zIndex: 10, left: 0, right: 0, backgroundColor: "white", border: "1px solid #ccc", borderRadius: "6px", marginTop: "4px", maxHeight: "200px", overflowY: "auto", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                {toSuggestions.map((s, idx) => (
                  <div key={idx} onClick={() => { setToSearch(s.label); setToCode(s.code); setToSuggestions([]); }} style={{ padding: "10px", color: "#111827", cursor: "pointer", borderBottom: "1px solid #eee" }}>
                    ✈️ {s.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Departure Date Input Layout (With added 1 Month option) */}
          <div style={{ flex: "1.6", minWidth: "220px", display: "flex", gap: "10px" }}>
            <div style={{ flex: "1.8" }}>
              <label style={{ display: "block", color: "#4b5563", fontSize: "12px", fontWeight: "bold", marginBottom: "6px", whiteSpace: "nowrap" }}>Departure Date *</label>
              <input 
                type="date" 
                value={departDate} 
                onChange={(e) => setDepartDate(e.target.value)} 
                min={todayDateString} 
                style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "8px", color: "#111827", boxSizing: "border-box", height: "40px" }} 
                required 
              />
            </div>
            <div style={{ flex: "1.2", minWidth: "85px" }}>
              <label style={{ display: "block", color: "#4b5563", fontSize: "12px", fontWeight: "bold", marginBottom: "6px", textAlign: "center" }}>+/-</label>
              <select value={departFlex} onChange={(e) => setDepartFlex(e.target.value)} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "8px", color: "#111827", backgroundColor: "white", fontSize: "13px", fontWeight: "600", height: "40px", cursor: "pointer" }}>
                <option value="0">Exact</option>
                <option value="3">3 Days</option>
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="30">1 Month</option>
              </select>
            </div>
          </div>

          {/* Return Date Input Layout (With added 1 Month option) */}
          <div style={{ flex: "1.6", minWidth: "220px", display: "flex", gap: "10px" }}>
            <div style={{ flex: "1.8" }}>
              <label style={{ display: "block", color: tripType === "oneway" ? "#9ca3af" : "#4b5563", fontSize: "12px", fontWeight: "bold", marginBottom: "6px", whiteSpace: "nowrap" }}>
                Return Date {tripType === "return" ? "*" : "(Disabled)"}
              </label>
              <input 
                type="date" 
                value={returnDate} 
                onChange={(e) => setReturnDate(e.target.value)} 
                disabled={tripType === "oneway"}
                required={tripType === "return"}
                min={departDate || todayDateString}
                style={{ 
                  width: "100%", 
                  padding: "10px", 
                  border: "1px solid #d1d5db", 
                  borderRadius: "8px", 
                  color: tripType === "oneway" ? "#9ca3af" : "#111827", 
                  backgroundColor: tripType === "oneway" ? "#f3f4f6" : "#ffffff",
                  boxSizing: "border-box",
                  cursor: tripType === "oneway" ? "not-allowed" : "default",
                  height: "40px"
                }} 
              />
            </div>
            <div style={{ flex: "1.2", minWidth: "85px" }}>
              <label style={{ display: "block", color: tripType === "oneway" ? "#9ca3af" : "#4b5563", fontSize: "12px", fontWeight: "bold", marginBottom: "6px", textAlign: "center" }}>+/-</label>
              <select value={returnFlex} onChange={(e) => setReturnFlex(e.target.value)} disabled={tripType === "oneway"} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "8px", color: tripType === "oneway" ? "#9ca3af" : "#111827", backgroundColor: tripType === "oneway" ? "#f3f4f6" : "white", fontSize: "13px", fontWeight: "600", cursor: tripType === "oneway" ? "not-allowed" : "default", height: "40px" }}>
                <option value="0">Exact</option>
                <option value="3">3 Days</option>
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="30">1 Month</option>
              </select>
            </div>
          </div>

          {/* Passenger Selector */}
          <div style={{ flex: "0.8", minWidth: "85px" }}>
            <label style={{ display: "block", color: "#4b5563", fontSize: "12px", fontWeight: "bold", marginBottom: "6px" }}>Passengers</label>
            <select value={passengers} onChange={(e) => setPassengers(e.target.value)} style={{ width: "100%", padding: "11px", border: "1px solid #d1d5db", borderRadius: "8px", color: "#111827", backgroundColor: "white", boxSizing: "border-box", height: "40px" }}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>

          <button type="submit" style={{ backgroundColor: "#0070f3", color: "#ffffff", border: "none", padding: "12px 24px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", height: "40px" }}>Search</button>
        </form>
      </div>

      {/* Airport Hub Opportunity Dashboard Lists Grid Matrix */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "bold", borderBottom: "2px solid rgba(255,255,255,0.2)", paddingBottom: "10px" }}>Trending Hub Opportunities</h2>
        {loadingDeals ? (
          <p style={{ textAlign: "center", padding: "40px" }}>Syncing cheapest pricing grids...</p>
        ) : (
          <>
            <h3 style={{ fontSize: "22px", margin: "30px 0 10px 0", color: "#ffd700" }}>✈️ Best Deals from Manchester</h3>
            {renderDealCards(manDeals)}
            <h3 style={{ fontSize: "22px", margin: "30px 0 10px 0", color: "#ffd700" }}>✈️ Best Deals from London</h3>
            {renderDealCards(lonDeals)}
            <h3 style={{ fontSize: "22px", margin: "30px 0 10px 0", color: "#ffd700" }}>✈️ Best Deals from Dublin</h3>
            {renderDealCards(dubDeals)}
          </>
        )}
      </div>
    </main>
  );
}
