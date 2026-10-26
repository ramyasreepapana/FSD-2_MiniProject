import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import OfflineBanner from './components/OfflineBanner';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PlanTrip from './pages/PlanTrip';
import TripResult from './pages/TripResult';
import SavedTrips from './pages/SavedTrips';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-secondary/20 selection:text-primary overflow-x-hidden">
          {/* Offline Banner for Connection Drops */}
          <OfflineBanner />

          {/* Sticky Navigation Bar */}
          <Navbar />

          {/* Main App Content Area */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/result" element={<TripResult />} />

              {/* Protected Routes */}
              <Route
                path="/plan"
                element={
                  <ProtectedRoute>
                    <PlanTrip />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips"
                element={
                  <ProtectedRoute>
                    <SavedTrips />
                  </ProtectedRoute>
                }
              />

              {/* Custom 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
