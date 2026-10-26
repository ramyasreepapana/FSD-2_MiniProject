import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, CheckCircle, Navigation, MapPin, Plane 
} from 'lucide-react';
import { destinationList } from '../data/destinationCosts';
import { formatCurrency } from '../utils/calculateExpenses';

const Home = () => {
  const featured = destinationList.slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* ========================================================
          HERO SECTION: AI TRAVEL COMMAND CENTER
      ======================================================== */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 overflow-hidden rounded-3xl sm:rounded-[40px] bg-gradient-to-br from-primary via-primary-dark to-[#071E26] text-white shadow-elevated">
        {/* Subtle Decorative Background Rings */}
        <div className="absolute -top-28 -right-28 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -left-28 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-teal-200 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Smart Travel Command Center</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none">
            Your next trip. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-secondary-light to-accent">
              Planned intelligently.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed">
            Tell us where you're going, your budget, and how you travel.
            BudgetTrip instantly calculates three types of expenditure, tests budget feasibility, and delivers actionable optimization tips.
          </p>

          {/* CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <Link
              to="/plan"
              className="w-full sm:w-auto px-8 py-4 bg-accent hover:bg-accent-dark active:scale-95 text-slate-950 font-extrabold text-base rounded-2xl transition shadow-lg flex items-center justify-center gap-2 group"
            >
              <span>Plan My Trip</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-base rounded-2xl transition border border-white/20 flex items-center justify-center"
            >
              Explore Features
            </a>
          </div>

          {/* ========================================================
              LIVE COMMAND CENTER INTERACTIVE PREVIEW MOCKUP
          ======================================================== */}
          <div className="pt-8 max-w-2xl mx-auto text-left">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
              {/* Route banner */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs sm:text-sm">
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-teal-300" />
                  <span className="font-bold text-white">Vijayawada</span>
                </div>

                <div className="flex items-center space-x-2 text-accent">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                  <span className="h-[1.5px] w-8 sm:w-16 bg-gradient-to-r from-teal-400 to-accent"></span>
                  <Plane className="w-4 h-4 text-accent" />
                  <span className="h-[1.5px] w-8 sm:w-16 bg-gradient-to-r from-accent to-secondary-light"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-light"></span>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span className="font-bold text-white">Goa</span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-300 block">Planned Budget</span>
                  <span className="font-extrabold text-white text-sm sm:text-base">₹20,000</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-300 block">AI Estimate</span>
                  <span className="font-extrabold text-teal-300 text-sm sm:text-base">₹18,200</span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                  <span className="text-[10px] block">Feasibility</span>
                  <span className="font-extrabold text-sm sm:text-base">🟢 Within Budget</span>
                </div>
              </div>

              {/* Mini AI suggestion preview */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-slate-200">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  <span className="line-clamp-1">AI Suggestion: Keep ₹1,800 emergency buffer for shopping and unexpected local cabs.</span>
                </div>
                <span className="text-[10px] font-bold text-teal-300 uppercase whitespace-nowrap ml-2">High Impact</span>
              </div>
            </div>
          </div>

          {/* Mini Trust Markers */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-secondary-light" />
              Real Geocoded Origins
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-secondary-light" />
              Budget / Moderate / Premium Styles
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-secondary-light" />
              Strict Deterministic Arithmetic
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================
          4-STEP EXPLANATION SECTION
      ======================================================== */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-wider text-secondary">
            Command Center Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            How BudgetTrip Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            No spreadsheets, blind guesses, or manual receipt calculations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base mb-4">
                1
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1.5">
                Set Verified Route
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Autocomplete and verify your starting city via live geocoding and pick from 16+ curated destinations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-primary">
              Geocoded Origins →
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-extrabold text-base mb-4">
                2
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1.5">
                Choose Travel Style
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Select Budget, Moderate, or Premium. Calibrate accommodation, transit, and food allocations to how you travel.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-secondary">
              Personalized Tiers →
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent-dark flex items-center justify-center font-extrabold text-base mb-4">
                3
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1.5">
                Three Types of Expenditure
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Clear breakdown across Transit, Stay, and Food/Activities, with live comparisons across Budget, Moderate, and Premium tiers.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-accent-dark">
              3 Categories & 3 Tiers →
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-base mb-4">
                4
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1.5">
                Smart Recommendations
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receive actionable advice on saving, buffers, weather contingencies, and saving the itinerary to your dashboard.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700">
              Save & Optimize →
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          FEATURED DESTINATIONS SHOWCASE
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-secondary">
              Popular Getaways
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Trending Destinations
            </h2>
          </div>
          <Link
            to="/plan"
            className="text-xs sm:text-sm font-bold text-primary hover:text-primary-light flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Explore all destinations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-soft transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-primary transition">
                    {item.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1 mb-3">
                  {item.region}
                </p>
                <p className="text-xs text-slate-600 italic line-clamp-2 mb-4 bg-slate-50 p-2 rounded-xl">
                  "{item.tagline}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Est. Hotel / Night</span>
                  <span className="font-bold text-sm text-slate-800">
                    {formatCurrency(item.hotelPerNight)}
                  </span>
                </div>
                <Link
                  to="/plan"
                  state={{ preselectedDestination: item.name }}
                  className="px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg text-xs font-bold transition"
                >
                  Plan This →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
