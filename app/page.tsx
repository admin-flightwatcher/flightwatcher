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
      // Read Deals table from Supabase, sort by cheapest, limit to top 6 elements
      const { data, error } = await supabase
        .from("Deals")
        .select("*")
        .eq("active", true)
        .order("price", { ascending: true })
        .limit(6);

      if (error) {
        console.error("Error loading deals from Supabase:", error);
        return;
      }

      if (data) {
        setDeals(data);
        
        // Refinement: Parse checked_at to determine precise Google Flights automated search interval milestones
        const validDates = data
          .map((d: any) => d.checked_at)
          .filter(Boolean)
          .map((d: string) => new Date(d).getTime());
          
        if (validDates.length > 0) {
          const latestTime = new Date(Math.max(...validDates));
          setLastUpdatedText(latestTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
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
  }, []);

  // Format date helper to turn "2027-02-10" into "10 Feb"
  const formatDateLabel = (dateStr: string) => {
    if (!dateStr || dateStr === "N/A") return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  // Improved View Deal routing: dynamically routes search string constraints only
  const handleViewDeal = (deal: any) => {
    const from = deal.origin || "MAN";
    const to = deal.destination || "JFK";
    const depart = deal.departure_date || "2027-02-10";
    const retDate = deal.return_date || "2027-02-17";
    
    router.push(
      `/search/results?from=${from.toUpperCase()}&to=${to.toUpperCase()}&depart=${depart}&return=${retDate}&passengers=1`
    );
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-slate-400">
        <p className="animate-pulse font-semibold">🔍 Scanning database for cheapest live deals...</p>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-800/40 rounded-3xl border border-slate-700/50">
        <p className="text-slate-300 font-medium">No live deals found in your database table yet.</p>
        <p className="text-sm text-slate-500 mt-2">Run your backend script <code className="bg-slate-900 px-2 py-1 rounded text-yellow-400">node live-deals.js</code> to populate data!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-2">
        <h2 className="text-4xl font-bold text-slate-900">🔥 Live Cheapest Deals</h2>
        <div className="text-sm font-semibold px-3 py-1.5 bg-sky-50 text-sky-700 rounded-full border border-sky-100 self-start">
          ⚡ Last Checked: {lastUpdatedText}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <div 
            key={deal.id} 
            className="bg-white text-black rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 min-h-[280px] border border-slate-100"
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="text-5xl">
                  {deal.destination_name?.toLowerCase().includes("york") && "🗽"}
                  {deal.destination_name?.toLowerCase().includes("orlando") && "☀️"}
                  {deal.destination_name?.toLowerCase().includes("vegas") && "🎰"}
                  {deal.destination_name?.toLowerCase().includes("dubai") && "🏙️"}
                  {deal.destination_name?.toLowerCase().includes("barbados") && "🏝️"}
                  {deal.destination_name?.toLowerCase().includes("lucia") && "🥥"}
                  {deal.destination_name?.toLowerCase().includes("bangkok") && "🛕"}
                  {deal.destination_name?.toLowerCase().includes("maldives") && "🐠"}
                  {deal.destination_name?.toLowerCase().includes("tokyo") && "🗾"}
                  {deal.destination_name?.toLowerCase().includes("singapore") && "🦁"}
                  {!["york", "orlando", "vegas", "dubai", "barbados", "lucia", "bangkok", "maldives", "tokyo", "singapore"].some(k => deal.destination_name?.toLowerCase().includes(k)) && "✈️"}
                </span>
                
                <span className="text-xs uppercase bg-slate-100 px-2.5 py-1 rounded-md font-bold text-slate-600 tracking-wider">
                  {deal.stops === 0 ? "Direct" : `${deal.stops} Stop${deal.stops > 1 ? 's' : ''}`}
                </span>
              </div>
              
              <h3 className="text-2xl font-bold mt-4 text-slate-900">{deal.destination_name || "Unknown"}</h3>
              
              <p className="text-slate-500 font-semibold text-sm mt-1">
                {deal.origin?.toUpperCase()} → {deal.destination?.toUpperCase()}
              </p>
              
              {deal.departure_date && (
                <p className="text-sm text-slate-700 font-medium mt-3 bg-slate-50 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5">
                  📅 {formatDateLabel(deal.departure_date)} - {formatDateLabel(deal.return_date)}
                </p>
              )}

              <p className="text-xs text-slate-400 mt-3 italic block">✈️ {deal.airline || "Various Airlines"}</p>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
              <span className="text-sky-600 text-3xl font-extrabold">£{deal.price}</span>
              <button
                type="button"
                onClick={() => handleViewDeal(deal)}
                className="bg-sky-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-sky-600 transition-colors shadow-md shadow-sky-500/20"
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
