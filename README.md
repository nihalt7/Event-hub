# EventHub – Event Management Platform

A production-ready event management web application where **attendees** can register, browse events, book tickets, and manage bookings, and **organizers** can create and manage events. Includes **admin** panel for user and event moderation.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, React Router 6, Context API, Axios, Tailwind CSS, Vite |
| **Backend** | Node.js, Express |
| **Database** | MongoDB (MongoDB Atlas) |
| **Auth** | JWT, bcrypt |
| **Deployment** | Vercel/Netlify (frontend), Render/Railway (backend), MongoDB Atlas (DB) |

---

## Folder Structure

```
newone/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Auth, User, Event, Booking, Review
│   ├── middleware/      # auth, errorHandler, validate
│   ├── models/          # User, Event, Booking, Review
│   ├── routes/          # auth, user, event, booking, review
│   ├── validators/      # express-validator rules
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/         # Axios instance
│   │   ├── components/  # layout, auth (ProtectedRoute, etc.)
│   │   ├── context/     # AuthContext
│   │   ├── pages/       # All pages
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
└── README.md
```

---

## API Routes

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register (body: name, email, password, role?) |
| POST | `/api/auth/login` | Login (body: email, password) |
| GET | `/api/auth/me` | Current user (protected) |

### Users
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/users` | List users (admin) |
| GET | `/api/users/:id` | Get user (protected) |
| PUT | `/api/users/:id` | Update user (self or admin) |
| DELETE | `/api/users/:id` | Delete user (admin or self) |

### Events
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/events` | List published events (query: page, limit, search, category) |
| GET | `/api/events/featured` | Featured events |
| GET | `/api/events/:id` | Single event |
| GET | `/api/events/organizer/my` | My events (organizer/admin) |
| GET | `/api/events/admin/all` | All events (admin) |
| POST | `/api/events` | Create event (organizer/admin) |
| PUT | `/api/events/:id` | Update event (owner/admin) |
| DELETE | `/api/events/:id` | Delete event (owner/admin) |
| PATCH | `/api/events/:id/approve` | Approve event (admin) |

### Bookings
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/bookings` | My bookings (protected) |
| GET | `/api/bookings/event/:eventId` | Event bookings (organizer/admin) |
| GET | `/api/bookings/:id` | Single booking (protected) |
| POST | `/api/bookings` | Create booking (body: eventId, ticketTypeName, quantity) |
| PATCH | `/api/bookings/:id/cancel` | Cancel booking (protected) |

### Reviews
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/reviews/event/:eventId` | Event reviews |
| POST | `/api/reviews/event/:eventId` | Add review (body: rating, comment?) (protected) |

---

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone and install

```bash
cd newone
# Backend
cd backend && npm install
# Frontend
cd ../frontend && npm install
```

### 2. Environment variables

**Backend** (`backend/.env`):

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/eventdb?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

**Frontend** (`frontend/.env`):

```env
VITE_API_URL=http://localhost:5000
```

Copy from `backend/.env.example` and `frontend/.env.example` and fill in real values.

### 3. Run locally

**Terminal 1 – Backend**

```bash
cd backend
npm run dev
```

Server runs at `http://localhost:5000`.

**Terminal 2 – Frontend**

```bash
cd frontend
npm run dev
```

App runs at `http://localhost:3000`.

### 4. Create first admin (optional)

To create an admin user, either:

- Register normally, then in MongoDB Atlas (or Compass) set the user document’s `role` to `"admin"`, or  
- Use a one-time script that hashes a password and inserts a user with `role: "admin"`.

---

## Deploy

### Backend (Render / Railway)

1. Create a new Web Service (Render) or project (Railway).
2. Connect the repo and set root to `backend` (or build/start to `backend`).
3. Set env vars: `NODE_ENV=production`, `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `CLIENT_URL` (your frontend URL).
4. Build: (none or `npm install`). Start: `npm start` or `node server.js`.

### Frontend (Vercel / Netlify)

1. Connect the repo; set root to `frontend`.
2. Build command: `npm run build`. Output: `dist`.
3. Set env: `VITE_API_URL=https://your-backend-url.onrender.com` (or your backend URL).
4. Deploy.

### Database

- Use **MongoDB Atlas** and set `MONGODB_URI` in the backend env. Ensure IP allowlist includes Render/Railway (or 0.0.0.0/0 for simplicity).

### CORS

- Backend `CLIENT_URL` must match the deployed frontend origin (e.g. `https://yourapp.vercel.app`).

---

## Core Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero, featured events, CTAs |
| Login | `/login` | JWT login |
| Signup | `/signup` | Register (attendee/organizer) |
| Events | `/events` | List, search, filters, pagination |
| Event detail | `/events/:id` | Details, tickets, reviews, book |
| Checkout | `/events/:id/checkout` | Confirm booking (protected) |
| Booking confirmation | `/bookings/:id/confirmation` | Ticket confirmation (protected) |
| Dashboard | `/dashboard` | Organizer events + user bookings |
| Profile | `/profile` | Update profile (protected) |
| My Bookings | `/bookings` | List/cancel bookings (protected) |
| Create event | `/events/create` | Create event (organizer/admin) |
| Edit event | `/events/edit/:id` | Edit event (owner/admin) |
| Admin | `/admin` | Users & events (admin) |
| About / Privacy / Terms / Refunds / Support | `/about`, `/privacy`, etc. | Static/utility |
| 404 | `*` | Not found |

---

## Security & Quality

- **Auth:** JWT in `Authorization: Bearer <token>`; stored in `localStorage` (consider httpOnly cookies for production).
- **Passwords:** Hashed with bcrypt before save.
- **Validation:** express-validator on register, login, event create/update, booking, review.
- **Errors:** Central error handler; no stack traces in production.
- **CORS:** Configured for `CLIENT_URL`.
- **Secrets:** All secrets in env; no secrets in repo.

---

## License

MIT.
