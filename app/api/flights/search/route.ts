import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const depart = searchParams.get("depart");
  const returnDate = searchParams.get("return");

  const apiKey = process.env.SERPAPI_KEY;

  if (!origin || !destination || !depart) {
    return NextResponse.json(
      { error: "Missing search parameters" },
      { status: 400 }
    );
  }

  const url =
    `https://serpapi.com/search.json` +
    `?engine=google_flights` +
    `&departure_id=${origin}` +
    `&arrival_id=${destination}` +
    `&outbound_date=${depart}` +
    (returnDate ? `&return_date=${returnDate}` : "") +
    `&adults=1` +
    `&currency=GBP` +
    `&hl=en` +
    `&api_key=${apiKey}`;

  try {
    const response = await fetch(url);
    const result = await response.json();

    const flights = [
      ...(result.best_flights || []),
      ...(result.other_flights || []),
    ];

    return NextResponse.json(flights);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch flights" },
      { status: 500 }
    );
  }
}