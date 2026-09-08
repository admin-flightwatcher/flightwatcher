export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-800 text-white">

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">

        <div className="inline-block bg-white/20 rounded-full px-4 py-2 mb-6">
          ✈️ Cheap Flights • Mistake Fares • Email Alerts
        </div>

        <h1 className="text-6xl md:text-7xl font-extrabold">
          FlightWatcher
        </h1>

        <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
          Discover cheap flights, hidden deals and mistake fares before
          everyone else. Receive instant alerts when prices drop.
        </p>

        <div className="flex justify-center gap-4 mt-10 flex-wrap">
          <button className="bg-yellow-400 text-black px-8 py-4 rounded-xl font-bold">
            Join Free Alerts
          </button>

          <button className="border border-white px-8 py-4 rounded-xl">
            View Live Deals
          </button>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-3xl text-black p-8 shadow-2xl">

          <h2 className="text-3xl font-bold mb-6">
            Search Flight Deals
          </h2>

          <div className="grid md:grid-cols-4 gap-4">

            <input
              className="border p-4 rounded-xl"
              placeholder="From (MAN)"
            />

            <input
              className="border p-4 rounded-xl"
              placeholder="Destination"
            />

            <input
              className="border p-4 rounded-xl"
              placeholder="Travel Month"
            />

            <button className="bg-sky-500 text-white rounded-xl">
              Search
            </button>

          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-4xl font-bold text-center mb-10">
          Trending Deals
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white text-black rounded-3xl p-6 shadow-xl">
            <div className="text-5xl">🏝️</div>
            <h3 className="text-2xl font-bold mt-4">
              Barbados
            </h3>
            <p className="text-sky-600 text-3xl font-bold mt-4">
              £299
            </p>
          </div>

          <div className="bg-white text-black rounded-3xl p-6 shadow-xl">
            <div className="text-5xl">🗽</div>
            <h3 className="text-2xl font-bold mt-4">
              New York
            </h3>
            <p className="text-sky-600 text-3xl font-bold mt-4">
              £249
            </p>
          </div>

          <div className="bg-white text-black rounded-3xl p-6 shadow-xl">
            <div className="text-5xl">🗾</div>
            <h3 className="text-2xl font-bold mt-4">
              Tokyo
            </h3>
            <p className="text-sky-600 text-3xl font-bold mt-4">
              £399
            </p>
          </div>

        </div>
      </section>

      <section className="bg-slate-900 mt-16 py-20">
        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-4xl font-bold text-center mb-10">
            Why FlightWatcher?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            <div className="bg-slate-800 p-8 rounded-3xl">
              <h3 className="text-2xl font-bold mb-4">
                💸 Cheap Flights
              </h3>
              <p>
                Track discounted fares from major airports.
              </p>
            </div>

            <div className="bg-slate-800 p-8 rounded-3xl">
              <h3 className="text-2xl font-bold mb-4">
                ⚡ Mistake Fares
              </h3>
              <p>
                Spot airline pricing errors before they're fixed.
              </p>
            </div>

            <div className="bg-slate-800 p-8 rounded-3xl">
              <h3 className="text-2xl font-bold mb-4">
                📧 Instant Alerts
              </h3>
              <p>
                Get notified immediately when a deal appears.
              </p>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}