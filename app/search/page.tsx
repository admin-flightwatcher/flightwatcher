"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const router = useRouter();

  // Explicit state definitions tracking inputs
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [email, setEmail] = useState("");

  // Navigates and pushes explicit routing tokens onto your results subfolder page
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
  `/search/results?from=${origin}&to=${destination}&depart=${departureDate}&return=${returnDate}&passengers=${passengers}&email=${email}`
);
  };

  return (
    <main style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Search Flights</h1>
      
      <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "320px" }}>
        <div>
          <label style={{ display: "block", fontWeight: "bold" }}>Origin Airport</label>
          <input 
            type="text" 
            placeholder="e.g. MAN"
            value={origin} 
            onChange={(e) => setOrigin(e.target.value)} 
          />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: "bold" }}>Destination Airport</label>
          <input 
            type="text" 
            placeholder="e.g. JFK"
            value={destination} 
            onChange={(e) => setDestination(e.target.value)} 
          />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: "bold" }}>Departure Date</label>
          <input 
            type="date" 
            value={departureDate} 
            onChange={(e) => setDepartureDate(e.target.value)} 
          />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: "bold" }}>Return Date</label>
          <input 
            type="date" 
            value={returnDate} 
            onChange={(e) => setReturnDate(e.target.value)} 
          />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: "bold" }}>Passengers</label>
          <input 
            type="number" 
            min="1" 
            value={passengers} 
            onChange={(e) => setPassengers(Number(e.target.value))} 
          />
        </div>

        <div>
  <label style={{ display: "block", fontWeight: "bold" }}>Email Address</label>
  <input 
    type="email" 
    placeholder="e.g. you@example.com"
    value={email} 
    onChange={(e) => setEmail(e.target.value)} 
  />
</div>


        <button 
          type="submit"
          style={{
            padding: "10px",
            backgroundColor: "#0275d8",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            marginTop: "10px"
          }}
        >
          Search Flights
        </button>
      </form>
    </main>
  );
}
