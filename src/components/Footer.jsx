import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 pt-12 pb-8 mt-auto text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-primary tracking-tight">
                BUDGETTRIP
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              "Plan Smart. Travel Better." BudgetTrip helps travelers assess destination feasibility,
              prevent unexpected expenses, and plan realistic journeys before booking.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
              <span>Approximate planning estimates for smart decision making</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-primary transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/plan" className="hover:text-primary transition">
                  Plan a Trip
                </Link>
              </li>
              <li>
                <Link to="/trips" className="hover:text-primary transition">
                  Saved Trips
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Tech & Hackathon */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Hackathon Stack
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>• React SPA + Vite</li>
              <li>• Node.js & Express REST API</li>
              <li>• MongoDB & Mongoose Persistence</li>
              <li>• JWT User Ownership & Auth</li>
              <li>• Tailwind CSS Design System</li>
              <li>• Open-Meteo Real-time Weather</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} BudgetTrip. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with precision for the Frontend Hackathon</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
