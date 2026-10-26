# BUDGETTRIP ✈️
> *"Plan Smart. Travel Better."* — Full-Stack Travel Budget Planning Platform

BudgetTrip is an end-to-end full-stack web application that solves the single most critical pre-trip question:
> *"I have ₹X, I'm traveling from A to B for Z days with N people, and I travel in a certain style. Can I afford this trip, what will it realistically cost, and what should I change to make it work?"*

The application integrates a responsive **React 19 + Vite** frontend with a standalone **Node.js, Express, MongoDB (Mongoose)** backend, featuring **JWT authentication**, **user-owned trip CRUD**, **live weather integration**, **geocoded route resolution**, **deterministic budget feasibility calculations**, and **AI-powered personalization**.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 19 + Vite)                      │
│                                                                        │
│  Pages: Home, PlanTrip, TripResult, SavedTrips, Login, Signup          │
│  Services: api.js (Axios/Fetch), authService.js, tripService.js        │
│  State: AuthContext (JWT Session), Custom Hooks, Local Caches          │
│  APIs Consumed: Open-Meteo Geocoding API & Weather Forecast API        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON
                                    │ (CORS, Bearer JWT Auth)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js + Express.js)                    │
│                                                                        │
│  Security: Helmet, CORS, RateLimiter (auth routes)                    │
│  Middleware: authMiddleware (JWT verify), validation, errorHandler     │
│  Controllers: authController, tripController, aiController             │
│  Routes: /api/auth, /api/trips, /api/health, /api/estimate-expenses    │
│  AI Engine: Google Gemini 2.0 Flash / OpenAI GPT-4o-mini (Server-side) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Mongoose ODM
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           DATABASE (MongoDB)                           │
│                                                                        │
│  Collections:                                                          │
│  - users (name, email, passwordHash, timestamps)                       │
│  - trips (user ObjectId, origin, destination, costs, feasibility, ...) │
│  Isolation: User-scoped queries (User A cannot access User B data)     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 19.2 (Vite 8 SPA) | Fast, modern client interface |
| **Routing** | React Router DOM v7 | Client-side declarative routing & protected routes |
| **Styling & Design System** | Tailwind CSS v3 | Custom oceanic travel theme, responsive layouts |
| **Icons** | Lucide React | High-contrast visual icons |
| **Backend Runtime** | Node.js (v20+ / v24+) | Server-side JavaScript runtime (ES Modules) |
| **Web Server Framework** | Express.js 4.x | REST API routing, controllers, and middleware |
| **Database & ODM** | MongoDB with Mongoose 8.x | Document database, schemas, validations, indexing |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) & `bcryptjs` | Stateless Bearer token auth, salted password hashing |
| **Security & Headers** | `helmet`, `cors`, `express-rate-limit` | HTTP headers, origin protection, brute-force throttling |
| **Validation** | `express-validator` | Request body, query, and ObjectId parameter validation |
| **Automated Testing** | `vitest`, `supertest`, `mongodb-memory-server` | 24 backend automated tests + 12 frontend logic tests |
| **External APIs** | Open-Meteo Geocoding & Weather | Live geographic resolution and weather conditions |

---

## 📂 Project Structure

```
frontend_hackton/
├── api/                                # Serverless handlers (for optional Vercel deployment)
│   ├── estimate-expenses.js
│   └── smart-suggestions.js
├── backend/                            # Standalone Node.js & Express REST Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                   # Mongoose connection & graceful shutdown
│   │   ├── controllers/
│   │   │   ├── authController.js       # Register, login, me, logout
│   │   │   ├── tripController.js       # Trip CRUD with strict user ownership
│   │   │   └── aiController.js         # Ported expense & suggestion endpoints
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js       # Bearer JWT verification
│   │   │   ├── errorHandler.js         # Centralized error handler (CastError, 11000, etc.)
│   │   │   ├── notFound.js             # 404 route handler
│   │   │   └── validation.js           # express-validator schemas
│   │   ├── models/
│   │   │   ├── Trip.js                 # Mongoose Trip schema & JSON transforms
│   │   │   └── User.js                 # Mongoose User schema & bcrypt methods
│   │   ├── routes/
│   │   │   ├── aiRoutes.js             # AI estimation & suggestions routes
│   │   │   ├── authRoutes.js           # Auth routes (/api/auth)
│   │   │   └── tripRoutes.js           # Protected trips routes (/api/trips)
│   │   ├── utils/
│   │   │   └── generateToken.js        # JWT signing utility
│   │   ├── app.js                      # Express application setup
│   │   └── server.js                   # HTTP server entrypoint
│   ├── tests/
│   │   ├── setup.js                    # In-memory MongoDB lifecycle for isolated tests
│   │   ├── health.test.js              # Server health endpoint tests
│   │   ├── auth.test.js                # Auth workflow & validation tests
│   │   └── trips.test.js               # Trip CRUD & cross-user isolation tests
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
├── src/                                # Frontend Source Code (React 19)
│   ├── components/                     # Reusable UI components
│   │   ├── BudgetStatus.jsx            # Feasibility gauge
│   │   ├── ExpenseBreakdown.jsx        # Category list and percentage bars
│   │   ├── LoginForm.jsx               # Login form with client validation
│   │   ├── Navbar.jsx                  # Header with user avatar and route links
│   │   ├── ProtectedRoute.jsx          # Route guard checking authentication
│   │   ├── SignupForm.jsx              # Signup form with password checklist
│   │   ├── SmartSuggestions.jsx        # Impact-rated advice cards
│   │   └── WeatherCard.jsx             # Live destination weather card
│   ├── context/
│   │   ├── AuthContext.jsx             # Auth state provider (using Express API)
│   │   └── useAuth.js                  # Custom auth hook
│   ├── data/
│   │   └── destinationCosts.js         # Calibrated destination rates
│   ├── pages/
│   │   ├── Home.jsx                    # Hero, feature highlights, destination carousel
│   │   ├── Login.jsx                   # Login page
│   │   ├── PlanTrip.jsx                # Trip input form with live geocoding
│   │   ├── SavedTrips.jsx              # Saved trips gallery (MongoDB data)
│   │   ├── Signup.jsx                  # Registration page
│   │   └── TripResult.jsx              # Calculated itinerary & feasibility breakdown
│   ├── services/
│   │   ├── api.js                      # Centralized Fetch client with JWT interceptor
│   │   ├── authService.js              # Auth API calls
│   │   ├── tripService.js              # Trip CRUD API calls
│   │   ├── geocodingApi.js             # Open-Meteo autocomplete
│   │   ├── weatherApi.js               # Open-Meteo weather
│   │   ├── llmExpenseApi.js            # Frontend AI estimate connector
│   │   └── supabase.js                 # Backward-compatibility bridge
│   ├── utils/
│   │   ├── budgetAnalysis.js           # Feasibility formulas
│   │   ├── calculateExpenses.js        # Mathematical expense breakdown
│   │   └── validation.js               # Form validation logic
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── .gitignore
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## ⚙️ Environment Configuration

### 1. Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/budgettrip
JWT_SECRET=replace_with_a_strong_random_secret_at_least_32_characters_long
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173

# Optional: Add your Google Gemini API key for live AI estimation
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Frontend (`.env`)
Copy `.env.example` to `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🌐 MongoDB Atlas Setup (Cloud Database)

If you do not have a local MongoDB instance running:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and register for a free account.
2. Create a free **M0 cluster** (select your preferred region, e.g. Mumbai `ap-south-1`).
3. Under **Security -> Database Access**, create a user (e.g. `budgettrip_user` / password).
4. Under **Security -> Network Access**, click **Add IP Address** and choose **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Connect** on your cluster -> Choose **Drivers** (Node.js).
6. Copy the connection string into `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://budgettrip_user:<password>@cluster0.abcde.mongodb.net/budgettrip?retryWrites=true&w=majority
   ```

---

## 🚀 Startup Instructions

### Step 1: Start the Backend (Terminal 1)
```bash
cd backend
npm install
npm run dev
```
*Backend starts on `http://localhost:5000`.*
*Health check available at: `http://localhost:5000/api/health`.*

### Step 2: Start the Frontend (Terminal 2)
```bash
# In project root
npm install
npm run dev
```
*Frontend opens at: `http://localhost:5173`.*

---

## 🧪 Testing Instructions

### 1. Run Backend Automated Tests (24 tests)
```bash
cd backend
npm test
```
**Test Coverage Includes:**
- **Health**: Server status response, database reporting, credential masking.
- **Authentication**: User registration, duplicate email rejection (409), password hashing, user login, invalid password rejection (401), non-existent user rejection (401), profile retrieval (`/api/auth/me`), missing/malformed token rejection (401), logout acknowledgment.
- **Trip CRUD**: Trip creation (201), user association, fetching trips for authenticated user only, single trip retrieval, updating trip, deleting trip, malformed ObjectId rejection (400), invalid body validation (400), cross-user data access isolation (User B cannot access or modify User A's trips).

*Note: Tests run with `mongodb-memory-server` and execute in an isolated in-memory MongoDB database—no local MongoDB installation required to pass tests.*

### 2. Run Frontend Logic Tests (12 tests)
```bash
# In project root
npm test
```
Verifies expense formulas, mathematical precision, feasibility comparison, geocoding validation, travel style calibration, and boundary conditions.

### 3. Run Frontend Production Build
```bash
# In project root
npm run build
```
Generates production build in `dist/` with zero errors.

---

## 📡 API Endpoint Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Server health & database connectivity state |
| `POST` | `/api/auth/register` | Public | Register new user with hashed password & return JWT |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated user's profile |
| `POST` | `/api/auth/logout` | Public | Logout acknowledgment |
| `POST` | `/api/trips` | Private | Create and save a new trip plan |
| `GET` | `/api/trips` | Private | List all trips owned by the authenticated user |
| `GET` | `/api/trips/:id` | Private | Fetch single trip owned by the authenticated user |
| `PUT` | `/api/trips/:id` | Private | Update trip owned by the authenticated user |
| `DELETE` | `/api/trips/:id` | Private | Delete trip owned by the authenticated user |
| `POST` | `/api/estimate-expenses` | Public | AI/Benchmark personalized expense calculation |
| `POST` | `/api/smart-suggestions` | Public | AI/Heuristic prioritized suggestions |

---

## 🔐 Authentication & Ownership Workflow

1. **Registration**: When a user registers (`POST /api/auth/register`), `bcryptjs` hashes their password with salt cost 10 before saving to MongoDB. A signed JWT containing the user ID is returned.
2. **Login**: `POST /api/auth/login` validates credentials using `user.comparePassword()`. On match, a JWT is returned.
3. **Frontend Token Storage**: The frontend stores the token in `localStorage` under `budgettrip_jwt_token`.
4. **Request Authorization**: The frontend API client automatically injects the header `Authorization: Bearer <token>` into all subsequent requests.
5. **Ownership Isolation**: `tripController` extracts `req.user._id` from the verified JWT. All queries (`find`, `findOne`, `findOneAndUpdate`, `findOneAndDelete`) enforce `{ _id: tripId, user: req.user._id }`. Even if User B knows User A's trip ID, MongoDB returns a 404/403.

---

## 📋 Comprehensive Demonstration Sequence (For Viva / Evaluation)

### Step 1: Health Check
Run in terminal or browser:
```bash
curl http://localhost:5000/api/health
```
*Expected response: `200 OK`, `status: "healthy"`, `database.status: "connected"`.*

### Step 2: Register User A
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alpha Traveler","email":"alpha@example.com","password":"Password123!"}'
```
*Expected response: `201 Created`, JWT token received, user object returned without passwordHash.*

### Step 3: Register User B
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Beta Traveler","email":"beta@example.com","password":"Password123!"}'
```

### Step 4: Create Trip for User A
```bash
curl -X POST http://localhost:5000/api/trips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER_A_TOKEN>" \
  -d '{
    "origin": "Vijayawada, India",
    "destination": "Goa",
    "travelers": 2,
    "duration": 3,
    "budget": 20000,
    "travelStyle": "moderate",
    "travelCost": 5000,
    "accommodationCost": 5400,
    "foodCost": 4200,
    "transportCost": 1500,
    "activitiesCost": 2100,
    "totalCost": 18200,
    "budgetDifference": 1800,
    "budgetStatus": "within"
  }'
```
*Expected response: `201 Created`, returns created trip with generated `id`.*

### Step 5: Test Ownership Protection (User B cannot access User A's trip)
```bash
curl -X GET http://localhost:5000/api/trips/<TRIP_ID_FROM_STEP_4> \
  -H "Authorization: Bearer <USER_B_TOKEN>"
```
*Expected response: `404 Not Found` ("Trip not found or you do not have permission to access it").*

### Step 6: Verify User B cannot delete User A's trip
```bash
curl -X DELETE http://localhost:5000/api/trips/<TRIP_ID_FROM_STEP_4> \
  -H "Authorization: Bearer <USER_B_TOKEN>"
```
*Expected response: `404 Not Found`.*

### Step 7: Delete Trip as User A
```bash
curl -X DELETE http://localhost:5000/api/trips/<TRIP_ID_FROM_STEP_4> \
  -H "Authorization: Bearer <USER_A_TOKEN>"
```
*Expected response: `200 OK` ("Trip deleted successfully").*

---

## 🎓 Viva & Lab Presentation Guide

### Quick Architectural Summary (30-Second Elevator Pitch)
> *"BudgetTrip is a decoupled full-stack MERN application with a Vite React client and a standalone Express/MongoDB server. We migrated persistent storage and authentication from third-party vendor lock-in (Supabase) to a self-hosted REST API. All sensitive operations—password salting, JWT verification, and LLM API calls—are executed securely on the backend. Trips are strictly partitioned per user at the database level, ensuring privacy, scalability, and zero client-side key leakage."*

### Key Viva Questions & Answers

**Q1: How does authentication work?**
> **A:** We use JSON Web Tokens (JWT). When a user registers or logs in, the backend hashes the password using `bcryptjs` (salt rounds: 10), compares credentials, and issues a cryptographically signed token encoded with the user's MongoDB `ObjectId`. The client includes this token in the `Authorization: Bearer <token>` header for all authenticated requests. The `authMiddleware` validates the token's signature and expiration using `process.env.JWT_SECRET`.

**Q2: How do you prevent User A from seeing User B's trips?**
> **A:** Every trip document in MongoDB contains a `user` field referencing `User._id`. When a request arrives, `authMiddleware` identifies the user from the verified JWT. Our Mongoose queries explicitly scope queries to `user: req.user._id`. Even if a user attempts to fetch or delete another user's ID, the query finds zero matching records and returns a 404.

**Q3: How is data compatibility maintained between MongoDB and React?**
> **A:** In Mongoose, we defined a `toJSON` transform on both `User` and `Trip` schemas. This automatically converts MongoDB's `_id` to `id`, strips sensitive fields like `passwordHash` and `__v`, and provides both camelCase and snake_case aliases (`travelCost` and `travel_cost`) so that existing frontend components render without breaking.

**Q4: How does the AI fallback mechanism work?**
> **A:** When `GEMINI_API_KEY` is configured, the server requests personalized estimates from Google Gemini 2.0 Flash and validates the returned JSON schema. If the key is not set, offline, or rate-limited, the system transparently activates a calibrated destination benchmark multiplied by travel-style factors (Budget: 0.75x, Moderate: 1.0x, Premium: 1.45x) and explicitly flags `isAiGenerated: false`.

---

## 📑 Final Project Report Outline

1. **Title Page**: BudgetTrip — Full-Stack Travel Budget Feasibility and Itinerary Command Center
2. **Introduction & Motivation**: Problem of budget overruns in travel planning and lack of transparent feasibility tools.
3. **Literature / Existing Work Comparison**: Static travel blogs vs. algorithmic planning systems.
4. **Architecture & System Design**: Frontend (Vite/React), REST API (Express), Database (MongoDB Mongoose), Security (Helmet, JWT, Rate Limiter).
5. **Database Design & Schema**: ER Diagram, User schema, Trip schema, indexing strategies.
6. **Implementation Details**:
   - Geocoding and route resolution
   - Multi-tier mathematical expense formulas
   - JWT stateless session management
   - RESTful Trip CRUD operations
7. **Security & Validation Architecture**: Password hashing with bcrypt, input sanitization, mass-assignment protection.
8. **Testing & Verification**: Unit testing with Supertest, In-memory MongoDB testing with MongoMemoryServer.
9. **Conclusion & Future Enhancements**: Multi-currency conversion, collaborative trip planning, PDF export.
