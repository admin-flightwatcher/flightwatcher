"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

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
        .eq("active", true)
        .order("price_drop", { ascending: false })
        .limit(12);

      if (error) {
        console.error("Error loading deals from Supabase:", error);
        return;
      }

      if (data) {
        setDeals(data);

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

  const handleViewDeal = (deal: any) => {
    const from = deal.origin || "MAN";
    const to = deal.destination || "JFK";
    const depart = deal.departure_date || deal.departure_time || "N/A";
    const retDate = deal.return_date || deal.arrival_time || "N/A";
    
    router.push(`/search/results?from=${from.toUpperCase()}&to=${to.toUpperCase()}&depart=${depart}&return=${retDate}&passengers=1`);
  };

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

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr || dateStr === "N/A") return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  const renderStopsBadge = (stopsCount: number) => {
    let color = "#16a34a"; 
    let bg = "#f0fdf4";
    let text = "🟢 Direct Flight";

    if (stopsCount === 1) {
      color = "#d97706"; 
      bg = "#fffbeb";
      text = "🟡 1 Stop";
    } else if (stopsCount >= 2) {
      color = "#dc2626"; 
      bg = "#fef2f2";
      text = `🔴 ${stopsCount} Stops`;
    }

    return (
      <span style={{
        display: "inline-block",
        fontSize: "11px",
        fontWeight: "bold",
        color: color,
        backgroundColor: bg,
        padding: "4px 8px",
        borderRadius: "6px",
        border: `1px solid ${color}30`
      }}>
        {text}
      </span>
    );
  };

  if (loading) {
    return <p style={{ textAlign: "center", padding: "20px", color: "#111827" }}>Loading active travel deals...</p>;
  }

  if (deals.length === 0) {
    return <p style={{ textAlign: "center", padding: "20px", color: "#111827" }}>No current deals available. Run the live script to add values!</p>;
  }

  const bestDeal = deals[0];
  const gridDeals = deals.slice(1);

  return (
    <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif", boxSizing: "border-box" }}>
      
      {/* Title Header Section */}
      <div style={{ textAlign: "center", marginBottom: "35px" }}>
        <h2 style={{ margin: "0 0 6px 0", fontSize: "32px", fontWeight: "bold", color: "#111827" }}>🔥 Live Cheapest Deals</h2>
        <p style={{ margin: "0 0 12px 0", color: "#111827", fontSize: "15px", fontWeight: "600" }}>
          Showing <strong>{deals.length} live deals</strong> • Updated at {lastUpdatedText}
        </p>
        <div style={{
          display: "inline-block",
          fontSize: "12px",
          fontWeight: "bold",
          backgroundColor: "#f3f4f6",
          color: "#111827",
          padding: "6px 16px",
          borderRadius: "20px",
          border: "1px solid #e5e7eb"
        }}>
          ⚡ Live Scraper Active
        </div>
      </div>

      {/* 🏆 Best Deal Showcase Layout Featured Card */}
      {bestDeal && (
        <div style={{
          border: "2px solid #ffd700",
          borderRadius: "16px",
          padding: "25px",
          background: "linear-gradient(135deg, #fffdf0 0%, #ffffff 100%)",
          boxShadow: "0 8px 16px rgba(255, 215, 0, 0.15)",
          marginBottom: "35px",
          position: "relative",
          overflow: "hidden",
          textAlign: "left", // Formats content alignment back to left inside card structure
          boxSizing: "border-box"
        }}>
          <div style={{
            position: "absolute",
            top: "0",
            right: "0",
            backgroundColor: "#ffd700",
            color: "#111827",
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
              <h3 style={{ margin: "0 0 6px 0", fontSize: "28px", color: "#111827", display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold" }}>
                {getDestinationEmoji(bestDeal.destination_name)} {bestDeal.destination_name}
              </h3>
              <p style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#111827", fontWeight: "bold" }}>
                {bestDeal.origin?.toUpperCase()} → {bestDeal.destination?.toUpperCase()}
              </p>
              {bestDeal.departure_date && bestDeal.departure_date !== "N/A" && (
                <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#111827", fontWeight: "600" }}>
                  📅 {formatDateLabel(bestDeal.departure_date)} - {formatDateLabel(bestDeal.return_date)}
                </p>
              )}
              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: "14px", color: "#111827", fontWeight: "600" }}>✈️ {bestDeal.airline || "Various Airlines"}</span>
                {renderStopsBadge(bestDeal.stops)}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "25px", flexWrap: "wrap" }}>
              <div style={{ textAlign: "right" }}>
                {bestDeal.price_drop > 0 && (
                  <div style={{ color: "#dc2626", fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>
                    🔥 Saving £{bestDeal.price_drop}
                  </div>
                )}
                <div style={{ fontSize: "36px", fontWeight: "900", color: "#2563eb" }}>
                  £{bestDeal.price}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleViewDeal(bestDeal)}
                style={{
                  padding: "14px 28px",
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "16px",
                  boxShadow: "0 4px 10px rgba(37, 99, 235, 0.2)"
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
        gap: "20px",
        width: "100%",
        boxSizing: "border-box"
      }}>
        {gridDeals.map((deal) => (
          <div 
            key={deal.id} 
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "20px",
              background: "#ffffff",
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "270px",
              textAlign: "left", // Overrides center styles from global wrappers
              boxSizing: "border-box"
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px", gap: "10px" }}>
                <h3 style={{ margin: "0", fontSize: "22px", color: "#111827", display: "flex", alignItems: "center", gap: "6px", fontWeight: "bold" }}>
                  {getDestinationEmoji(deal.destination_name)} {deal.destination_name}
                </h3>
                {renderStopsBadge(deal.stops)}
              </div>
              
              {/* Route Information */}
              <p style={{ margin: "0 0 6px 0", fontSize: "14px", color: "#111827", fontWeight: "bold" }}>
                {deal.origin?.toUpperCase()} → {deal.destination?.toUpperCase()}
              </p>

              {/* Date Information */}
              {deal.departure_date && deal.departure_date !== "N/A" && (
                <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#111827", fontWeight: "600" }}>
                  📅 {formatDateLabel(deal.departure_date)} - {formatDateLabel(deal.return_date)}
                </p>
              )}

              {/* Airline Information */}
              <div style={{ marginBottom: "12px" }}>
                <p style={{ margin: "0", fontSize: "13px", color: "#111827", fontWeight: "600" }}>
                  ✈️ {deal.airline || "Various Airlines"}
                </p>
              </div>

              {/* Price Drop Badge */}
              {deal.price_drop > 0 && (
                <div style={{
                  display: "inline-block",
                  backgroundColor: "#fef2f2",
                  color: "#dc2626",
                  fontWeight: "bold",
                  fontSize: "12px",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  border: "1px solid #fca5a5",
                  marginBottom: "8px"
                }}>
                  🔥 Price Dropped £{deal.price_drop}
                </div>
              )}
            </div>

            {/* Price Display and View Deal Button */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "12px", borderTop: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: "26px", fontWeight: "bold", color: "#2563eb" }}>
                £{deal.price}
              </span>

              <button
                type="button"
                onClick={() => handleViewDeal(deal)}
                style={{
                  padding: "10px 18px",
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "14px"
                }}
              >
                View Deal
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
