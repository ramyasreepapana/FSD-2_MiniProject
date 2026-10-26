# BudgetTrip Backend API 🚀
> Node.js, Express.js, MongoDB (Mongoose), & JWT Full-Stack Backend

The backend for **BudgetTrip** provides a secure, production-ready REST API for user authentication, travel budget management, personalized expense calculations, and smart recommendations.

---

## 🏗️ Architecture Overview

The backend uses a layered Express.js architecture:
```
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection lifecycle & health monitoring
│   ├── models/
│   │   ├── User.js               # Mongoose User model (bcryptjs hashing, safe serialization)
│   │   └── Trip.js               # Mongoose Trip model (compatible with frontend schema)
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer token authentication & verification
│   │   ├── validation.js         # express-validator request body & param validation
│   │   ├── errorHandler.js       # Centralized error handler (CastError, duplicate key, etc.)
│   │   └── notFound.js           # 404 handler for unknown routes
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile (/me), logout
│   │   ├── tripController.js     # Trip CRUD operations with strict user ownership
│   │   └── aiController.js       # AI expense estimation and smart suggestions endpoints
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/* endpoints with rate limiting
│   │   ├── tripRoutes.js         # /api/trips/* protected CRUD endpoints
│   │   └── aiRoutes.js           # /api/estimate-expenses & /api/smart-suggestions
│   ├── utils/
│   │   └── generateToken.js      # JWT signing helper
│   ├── app.js                    # Express app configuration (helmet, cors, routes, error handling)
│   └── server.js                 # HTTP listener & process shutdown handler (SIGINT/SIGTERM)
├── tests/
│   ├── setup.js                  # MongoMemoryServer in-memory DB lifecycle
│   ├── health.test.js            # Server health & DB reporting tests
│   ├── auth.test.js              # Registration, duplicate check, login, me, token tests
│   └── trips.test.js             # Full CRUD, ID validation, ownership isolation tests
├── .env.example                  # Environment variable template
├── .gitignore                    # Git ignore file (excludes .env and node_modules)
└── package.json                  # Dependencies, test scripts, and engine specs
```

---

## 🛠️ Technology Stack

- **Runtime**: Node.js (v20+ / v24+)
- **Framework**: Express.js 4.x (ES Modules: `"type": "module"`)
- **Database**: MongoDB via Mongoose 8.x
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Security**: `helmet`, `cors`, `express-rate-limit`
- **Validation**: `express-validator`
- **Automated Testing**: `vitest`, `supertest`, `mongodb-memory-server`

---

## ⚙️ Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/budgettrip
JWT_SECRET=your_super_strong_random_secret_at_least_32_characters_long
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173

# Optional: Set at least ONE of these keys to enable live AI personalization
GEMINI_API_KEY=your_gemini_api_key_optional
OPENAI_API_KEY=your_openai_api_key_optional
```

### MongoDB Atlas Setup (Cloud Database)
1. Navigate to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and log in or create a free account.
2. Create a free **M0 Sandbox cluster** (e.g., in `AWS / Mumbai ap-south-1` or nearest region).
3. Under **Database Access**, create a database user (e.g., username `budgettrip_admin` with password authentication).
4. Under **Network Access**, click **Add IP Address** -> select **Allow Access from Anywhere** (`0.0.0.0/0`) for development.
5. In your cluster dashboard, click **Connect** -> **Drivers** (Node.js).
6. Copy the connection string and paste it into `MONGODB_URI` in `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://budgettrip_admin:<password>@cluster0.abcde.mongodb.net/budgettrip?retryWrites=true&w=majority
   ```

---

## 🚀 Running the Backend

### Installation
```bash
cd backend
npm install
```

### Start in Development Mode (with auto-reload)
```bash
npm run dev
```

### Start in Production Mode
```bash
npm start
```

### Run Automated Tests
```bash
npm test
```
*Note: Automated tests execute using `mongodb-memory-server` so they run self-contained without needing an external MongoDB instance running.*

---

## 📡 API Endpoint Documentation

### 1. Health Check
#### `GET /api/health`
Checks server status and database connectivity without exposing connection secrets.
- **Access**: Public
- **Response** (`200 OK` or `503 Service Unavailable`):
```json
{
  "status": "healthy",
  "uptime": 124,
  "timestamp": "2026-10-25T15:58:00.000Z",
  "service": "budgettrip-backend",
  "database": {
    "status": "connected",
    "ready": true
  }
}
```

---

### 2. Authentication API (`/api/auth`)

#### `POST /api/auth/register`
Creates a new user account.
- **Access**: Public (Rate-limited: 30 req/15min)
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!"
}
```
- **Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Account registered successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "671ba95e0c9603f9b23112a1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "createdAt": "2026-10-25T15:58:00.000Z"
  }
}
```

#### `POST /api/auth/login`
Authenticates a user and issues a JWT.
- **Access**: Public (Rate-limited: 30 req/15min)
- **Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "Password123!"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "671ba95e0c9603f9b23112a1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "createdAt": "2026-10-25T15:58:00.000Z"
  }
}
```

#### `GET /api/auth/me`
Retrieves the profile of the authenticated user.
- **Access**: Private (`Authorization: Bearer <token>`)
- **Response** (`200 OK`):
```json
{
  "success": true,
  "user": {
    "id": "671ba95e0c9603f9b23112a1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "createdAt": "2026-10-25T15:58:00.000Z"
  }
}
```

#### `POST /api/auth/logout`
Acknowledges logout (token discard by client).
- **Access**: Public
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Logged out successfully. Token discarded on client."
}
```

---

### 3. Trips API (`/api/trips`)
*All trip endpoints require the header `Authorization: Bearer <token>`.*

#### `POST /api/trips`
Creates and persists a new trip plan for the authenticated user.
- **Request Body**:
```json
{
  "origin": "Vijayawada, Andhra Pradesh, India",
  "originLocation": { "name": "Vijayawada", "latitude": 16.5062, "longitude": 80.648 },
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
  "budgetStatus": "within",
  "aiSummary": "A balanced beach trip in Goa with mid-range hotels.",
  "aiSuggestions": [
    { "title": "Book early", "description": "Save up to 20% on flights.", "impact": "High" }
  ],
  "weather": { "temperature": 29, "condition": "Sunny" }
}
```
- **Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Trip saved successfully.",
  "trip": {
    "id": "671ba9bb0c9603f9b23112a4",
    "userId": "671ba95e0c9603f9b23112a1",
    "origin": "Vijayawada, Andhra Pradesh, India",
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
    "budgetStatus": "within",
    "aiSummary": "A balanced beach trip in Goa with mid-range hotels.",
    "created_at": "2026-10-25T15:58:30.000Z"
  }
}
```

#### `GET /api/trips`
Lists all trips owned by the authenticated user (sorted newest first).
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 50)
  - `destination`: Filter by destination name (case-insensitive)
  - `travelStyle`: Filter by travel style (`budget`, `moderate`, `premium`)
- **Response** (`200 OK`):
```json
{
  "success": true,
  "count": 1,
  "total": 1,
  "page": 1,
  "pages": 1,
  "trips": [ ... ]
}
```

#### `GET /api/trips/:id`
Fetches a single trip. Enforces user ownership.
- **Response** (`200 OK` or `404 Not Found`):
```json
{
  "success": true,
  "trip": { "id": "671ba9bb0c9603f9b23112a4", ... }
}
```

#### `PUT /api/trips/:id`
Updates an existing trip owned by the user. Protected fields (`user`, `_id`) cannot be altered.
- **Request Body**:
```json
{
  "budget": 22000,
  "travelStyle": "premium"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Trip updated successfully.",
  "trip": { ... }
}
```

#### `DELETE /api/trips/:id`
Deletes a trip owned by the user.
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Trip deleted successfully."
}
```

---

### 4. AI Endpoints (`/api/estimate-expenses` & `/api/smart-suggestions`)

- `POST /api/estimate-expenses`: Personalizes category expenses using Google Gemini or OpenAI; falls back transparently if keys are unconfigured.
- `POST /api/smart-suggestions`: Generates prioritized recommendations categorized by area with High/Medium/Low impact badges.

---

## 🔒 Security Measures

1. **Password Hashing**: Salted bcryptjs hashing with cost factor 10.
2. **Safe Serialization**: `passwordHash` and `__v` are automatically stripped from all JSON responses.
3. **JWT Bearer Protection**: Secret signed with strong secret, short-to-medium lifespan, verified on every protected route.
4. **Data Isolation (RLS in MongoDB)**: Every database query strictly filters by `user: req.user._id`. Users cannot read, modify, or delete trips belonging to other users.
5. **Rate Limiting**: Brute-force protection on authentication endpoints via `express-rate-limit`.
6. **HTTP Headers**: `helmet` security headers enabled.
7. **CORS Control**: Configured origin matching frontend host.
8. **Input Validation**: Strict `express-validator` schema rules preventing invalid parameters or mass assignment attacks.
