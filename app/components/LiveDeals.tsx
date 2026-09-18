"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LiveDeals() {
  const router = useRouter();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdatedText, setLastUpdatedText] = useState("Loading...");

  async function loadDeals() {
    try {
      const { data, error } = await supabase
        .from("Deals")
        .select("*")
        .order("price_drop", { ascending: false })
        .limit(12);

      if (error) {
        console.error("Error loading deals from Supabase:", error);
        return;
      }

      if (data) {
        setDeals(data);

        // Find the most recent 'checked_at' timestamp across all returned deals
        const validDates = data
          .map((deal: any) => deal.checked_at)
          .filter(Boolean)
          .map((dateStr: string) => new Date(dateStr).getTime());

        if (validDates.length > 0) {
          const latestTime = new Date(Math.max(...validDates));
          setLastUpdatedText(
            latestTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          );
        } else {
          setLastUpdatedText("Just now");
        }
      }
    } catch (err) {
      console.error("Unexpected connection error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeals();

    const interval = setInterval(() => {
      loadDeals();
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  // Handler method to route explicitly with parameters onto the search results page layout
  const handleViewDeal = (deal: any) => {
    const from = deal.origin || "MAN";
    const to = deal.destination || "JFK";
    const depart = deal.departure_date || "N/A";
    const retDate = deal.return_date || "N/A";
    
    // Route matching your search results parameters tree configuration
    router.push(`/search/results?from=${from}&to=${to}&depart=${depart}&return=${retDate}&passengers=1`);
  };

  // Helper function to return contextual location symbols based on city name string filters
  const getDestinationEmoji = (name: string) => {
    if (!name) return "✈️";
    const lower = name.toLowerCase();
    if (lower.includes("york")) return "🗽";
    if (lower.includes("vegas")) return "🎰";
    if (lower.includes("orlando")) return "🏰";
    if (lower.includes("barbados")) return "🌴";
    if (lower.includes("dubai")) return "🌆";
    if (lower.includes("bangkok")) return "🐘";
    if (lower.includes("lucia")) return "🥥";
    if (lower.includes("maldives")) return "🐠";
    if (lower.includes("tokyo")) return "🗾";
    if (lower.includes("singapore")) return "🦁";
    return "✈️";
  };

  // Format date helper to turn "2027-02-10" into "10 Feb"
  const formatDateLabel = (dateStr: string) => {
    if (!dateStr || dateStr === "N/A") return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  // Helper method to assign clear colour structures matching stopping metrics variables
  const renderStopsBadge = (stopsCount: number) => {
    let color = "#5cb85c"; // Green standard mapping
    let bg = "#f2faf2";
    let text = "🟢 Direct Flight";

    if (stopsCount === 1) {
      color = "#f0ad4e"; // Yellow standard mapping
      bg = "#fdfaf4";
      text = "🟡 1 Stop";
    } else if (stopsCount >= 2) {
      color = "#d9534f"; // Red standard mapping
      bg = "#fdf5f5";
      text = `🔴 ${stopsCount} Stops`;
    }

    return (
      <span style={{
        display: "inline-block",
        fontSize: "12px",
        fontWeight: "bold",
        color: color,
        backgroundColor: bg,
        padding: "4px 10px",
        borderRadius: "6px",
        border: `1px solid ${bg}`,
        marginTop: "6px"
      }}>
        {text}
      </span>
    );
  };

  if (loading) {
    return <p style={{ textAlign: "center", padding: "20px" }}>Loading active travel deals...</p>;
  }

  if (deals.length === 0) {
    return <p style={{ textAlign: "center", padding: "20px" }}>No current deals available. Run the live script to add values!</p>;
  }

  // Isolate the number one item with the single highest value price drop for the top card
  const bestDeal = deals[0];
  // Filter the remainder of rows to supply the standard data grids container below
  const gridDeals = deals.slice(1);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      
      {/* Title Header with dynamic counter context updates */}
      <div style={{ textAlign: "center", marginBottom: "35px" }}>
        <h2 style={{ margin: "0 0 6px 0", fontSize: "32px", fontWeight: "bold", color: "#1a1a1a" }}>🔥 Live Cheapest Deals</h2>
        <p style={{ margin: "0 0 12px 0", color: "#666", fontSize: "15px" }}>
          Showing <strong>{deals.length} live deals</strong> • Updated at {lastUpdatedText}
        </p>
        <div style={{
          display: "inline-block",
          fontSize: "12px",
          fontWeight: "bold",
          backgroundColor: "#eef2f7",
          color: "#4a5568",
          padding: "6px 16px",
          borderRadius: "20px"
        }}>
          ⚡ Live Scraper Active
        </div>
      </div>

      {/* 🏆 Best Deal Right Now Showcase Layout Block Component */}
      {bestDeal && (
        <div style={{
          border: "2px solid #ffd700",
          borderRadius: "16px",
          padding: "25px",
          background: "linear-gradient(135deg, #fffdf0 0%, #ffffff 100%)",
          boxShadow: "0 8px 16px rgba(255, 215, 0, 0.15)",
          marginBottom: "35px",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute",
            top: "0",
            right: "0",
            backgroundColor: "#ffd700",
            color: "#333",
            fontWeight: "bold",
            fontSize: "13px",
            padding: "6px 16px",
            borderBottomLeftRadius: "12px",
            letterSpacing: "0.5px"
          }}>
            🏆 BEST DEAL RIGHT NOW
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "20px" }}>
            <div>
              <h3 style={{ margin: "0 0 6px 0", fontSize: "28px", color: "#1a1a1a", display: "flex", alignItems: "center", gap: "8px" }}>
                {getDestinationEmoji(bestDeal.destination_name)} {bestDeal.destination_name}
              </h3>
              <p style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#4a5568", fontWeight: "bold" }}>
                {bestDeal.origin?.toUpperCase()} → {bestDeal.destination?.toUpperCase()}
              </p>
              {bestDeal.departure_date && bestDeal.departure_date !== "N/A" && (
                <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#666", fontWeight: "medium" }}>
                  📅 {formatDateLabel(bestDeal.departure_date)} - {formatDateLabel(bestDeal.return_date)}
                </p>
              )}
              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: "14px", color: "#718096" }}>✈️ {bestDeal.airline}</span>
                {renderStopsBadge(bestDeal.stops)}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "25px", flexWrap: "wrap" }}>
              <div style={{ textAlign: "right" }}>
                {bestDeal.price_drop > 0 && (
                  <div style={{ color: "#d9534f", fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>
                    🔥 Saving £{bestDeal.price_drop}
                  </div>
                )}
                <div style={{ fontSize: "36px", fontStyle: "normal", fontWeight: "900", color: "#e44d26" }}>
                  £{bestDeal.price}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleViewDeal(bestDeal)}
                style={{
                  padding: "14px 28px",
                  backgroundColor: "#e44d26",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "16px",
                  boxShadow: "0 4px 10px rgba(228, 77, 38, 0.2)",
                  transition: "transform 0.15s"
                }}
              >
                View Best Deal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid container layout presenting remaining deals dynamically */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
        gap: "20px" 
      }}>
        {gridDeals.map((deal) => (
          <div 
            key={deal.id} 
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "20px",
              background: "#fff",
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "270px"
            }}
          >
            <div>
              {/* Destination Header Title with dynamic landmark emoji match injection */}
              <h3 style={{ margin: "0 0 6px 0", fontSize: "20px", color: "#333", display: "flex", alignItems: "center", gap: "6px" }}>
                {getDestinationEmoji(deal.destination_name)} {deal.destination_name}
              </h3>
              
              {/* Route Trajectory Badges */}
