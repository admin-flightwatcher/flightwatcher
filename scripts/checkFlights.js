import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

async function checkFlights() {
  const { data, error } = await supabase
    .from("Alerts")
    .select("*");

  if (error) {
    console.error("Error loading alerts:");
    console.error(error);
    return;
  }

  console.log(`Found ${data.length} alerts`);

  for (const alert of data) {
    console.log(
      `Checking ${alert.origin} -> ${alert.destination}`
    );

    console.log(
      `Target Price: £${alert.target_price}`
    );

    console.log(
      `Last Price Found: £${alert.last_price_found}`
    );

    console.log(
      `Alert Sent: ${alert.alert_sent}`
    );

    console.log("--------------------------------");
  }
}

checkFlights();