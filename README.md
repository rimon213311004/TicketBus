# TicketBus

> A modern bus booking platform for Bangladesh with exact-seat selection, verified payments, and live operations control.

[![Frontend](https://img.shields.io/badge/frontend-React%2019-61DAFB?logo=react&logoColor=111827)](client/)
[![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-22C55E?logo=node.js&logoColor=white)](server/)
[![Database](https://img.shields.io/badge/database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Deploy](https://img.shields.io/badge/deploy-Vercel%20%2B%20Render-111827)](render.yaml)

TicketBus lets travellers search routes, compare operators, choose exact seats, submit payment proof, and download confirmed e-tickets. The admin control center handles payment verification, ticket issuance, sales metrics, and schedule-based live bus operations.

## Live Deployment

| Service | Link |
| --- | --- |
| Frontend | [ticket-bus-client.vercel.app](https://ticket-bus-client.vercel.app/) |
| Backend API | [ticketbus-snv5.onrender.com](https://ticketbus-snv5.onrender.com) |
| API health check | [ticketbus-snv5.onrender.com/health](https://ticketbus-snv5.onrender.com/health) |

## Contents

- [Product Tour](#product-tour)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Admin Access](#admin-access)
- [Core Workflows](#core-workflows)
- [API Surface](#api-surface)
- [Validation](#validation)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Product Tour

| Traveller experience | Operations experience |
| --- | --- |
| Search routes across Bangladesh | Verified sales and tickets dashboard |
| Compare AC, Non-AC, Business, Executive, Economy, and Sleeper coaches | Payment verification and rejection workflow |
| Hold seats and prevent double booking | Live Operations panel with bus images |
| Choose boarding and dropping points | Ready, Boarding, and On trip states |
| Pay digitally or at the counter | Boarding-point schedule and estimated route position |
| Download a QR e-ticket PDF | Responsive admin controls for desktop and mobile |

## Features

- Bus and route search across Bangladesh
- AC, Non-AC, Executive, Business, Economy, and Sleeper coaches
- Seat holding and double-booking protection
- Passenger and boarding-point management
- bKash, Nagad, Rocket, bank transfer, and cash-at-counter payment flows
- Manual payment verification before ticket issuance
- Rejection reasons with customer resubmission support
- E-ticket PDF download with QR code
- Customer booking history and ticket status
- Admin sales and ticket metrics
- Live operations dashboard with bus images, route status, estimated location, and boarding points
- Light and dark themes
- Responsive desktop, tablet, and mobile UI

## Architecture

```mermaid
flowchart LR
  Traveller[Traveller] --> Web[React + Vite frontend]
  Admin[Admin] --> Web
  Web -->|REST + JWT| API[Express API on Render]
  API --> DB[(MongoDB Atlas)]
  API --> Media[Cloudinary]
  API --> Tickets[PDF + QR ticket service]
```

The frontend and backend are deployed separately. In development, Vite proxies `/api` to the local server. In production, `VITE_API_URL` points directly to the Render API.

## Technology

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- Tailwind CSS
- Framer Motion
- Lucide icons

### Backend

- Node.js
- Express
- TypeScript
- MongoDB and Mongoose
- JWT access and refresh tokens
- bcryptjs password hashing
- Cloudinary image storage
- PDFKit and QRCode ticket generation

## Project Structure

```text
TicketBus/
  client/                 React and Vite frontend
    src/
      components/         Shared UI, search, booking, fleet, and layout components
      pages/              Application pages
      routes/             React Router configuration and protected routes
      services/           API request functions
      store/              Zustand stores
      styles/              Global Tailwind and application styles
    public/               Public frontend assets
    vercel.json           Vercel SPA fallback

  server/                 Express and MongoDB backend
    src/
      config/             Database, environment, and Cloudinary config
      controllers/        HTTP request handlers
      middleware/         Auth, validation, and error middleware
      models/             Mongoose models
      routes/             API route definitions
      services/           Business logic
      seed/               Operators, routes, buses, trips, and users
      validators/         Zod request schemas

  bus_image/              Source bus images used by seed and catalog data
  render.yaml             Render deployment blueprint
  package.json            Workspace scripts
```

## Quick Start

### Requirements

Install these before starting:

- Node.js 20 or newer
- npm 10 or newer
- MongoDB Atlas or another MongoDB instance
- Cloudinary account for uploaded bus and operator images

Check versions:

```powershell
node --version
npm --version
```

### Install dependencies

Run from the repository root:

```powershell
npm install
```

The root project uses npm workspaces, so this installs dependencies for both `client` and `server`.

## Configuration

Create a root `.env` file by copying `.env.example`:

```powershell
Copy-Item .env.example .env
```

Required root/server variables:

```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/ticketbus?retryWrites=true&w=majority

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

JWT_ACCESS_SECRET=replace_with_a_long_random_string
JWT_REFRESH_SECRET=replace_with_a_different_long_random_string
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

PAYMENT_RECEIVER_NUMBER=01875895858
```

Never commit `.env` or real credentials. Generate long, different JWT secrets for production.

For the frontend, create `client/.env.local`:

```env
VITE_API_URL=http://localhost:5000
```

`VITE_API_URL` must contain the backend origin only. Both of these formats work:

```env
VITE_API_URL=http://localhost:5000
VITE_API_URL=https://ticketbus-api.onrender.com
```

## Run Locally

### Start frontend and backend together

From the repository root:

```powershell
npm run dev
```

Open the frontend at:

```text
http://localhost:5173
```

The backend runs at:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/health
```

### Start separately

Backend:

```powershell
npm run dev --workspace server
```

Frontend:

```powershell
npm run dev --workspace client
```

## Admin Access

The seed process creates or updates:

- Admin and demo customer accounts
- Operators
- Routes and terminals
- Buses and fleet classes
- Generated trips
- Tour and gallery data

Run it from the root:

```powershell
npm run seed
```

The server also synchronizes the admin account on startup.

Admin account:

```text
Email: rimon@ticketbus.com
Password: 2002
```

Demo customer:

```text
Email: demo@ticketbus.com
Password: Demo@123
```

For production, change the admin password after the first deployment. The current startup synchronization is intended for this project setup and should be replaced with a secure one-time provisioning flow before a public production launch.

> **Development admin:** `rimon@ticketbus.com` / `2002`  
> Change this password before exposing the application publicly.

## Core Workflows

### Customer booking flow

1. Open the home page.
2. Select origin, destination, and journey date.
3. Search available buses.
4. Open a trip and select seats.
5. Enter passenger and contact details.
6. Select a payment method.
7. For online payment, send the exact amount to the configured receiver.
8. Submit sender number and transaction ID.
9. Wait for admin verification.
10. Download the confirmed PDF ticket with QR code.

### Cash booking flow

1. Select `Cash at Counter` during booking.
2. Download the booking voucher.
3. Visit the operator counter before the hold expires.
4. Staff verifies collection from the admin workflow.
5. The booking becomes confirmed and the ticket is issued.

### Payment verification flow

1. Customer submits a transaction.
2. The payment changes to `SUBMITTED`.
3. The booking changes to `AWAITING_VERIFICATION`.
4. The admin opens `Admin Panel` and selects `Payment Verification`.
5. Admin checks amount, transaction ID, sender number, booking, and customer.
6. Admin chooses `Verify & issue ticket` or rejects with a reason.
7. Verified payments confirm the booking and permanently book the seats.
8. Rejected payments return to `PENDING_PAYMENT` and allow resubmission.

The server prevents verification when:

- The payment was not submitted.
- Sender details are missing.
- The transaction ID is missing.
- The amount does not equal the booking total.
- The transaction ID was already used.
- The booking is cancelled or expired.
- The seats conflict with another confirmed booking.

### Live operations flow

The admin dashboard includes `Live Operations` and `Payment Verification` panels.

Live operation cards show:

- Bus image
- Operator and route
- Trip code
- Bus name and registration number
- Bus type and AC status
- Departure and arrival time
- `Ready`, `Boarding`, or `On trip` state
- Schedule-based estimated location
- Route progress percentage
- Boarding points and boarding lead time

The current implementation uses trip schedule and terminal data. It does not claim to provide real GPS tracking until tracking records are connected to a live device or operator feed.

## Admin Dashboard

Open:

```text
http://localhost:5173/admin
```

The route is protected by authentication and the `admin` role.

Dashboard sections:

- Verified sales total
- Tickets sold
- Buses in service
- Buses currently on trips
- Today’s departures
- Live operations cards
- Payment verification queue
- Payment rejection workflow
- Ticket issuance after verification

The admin button is visible in the navbar, but the route remains protected. Logged-out users are sent to admin sign-in, and non-admin users are redirected away from the dashboard.

## API Surface

All API routes are under `/api`.

### Health

```text
GET /health
```

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
PATCH /api/auth/me
POST /api/auth/change-password
```

### Catalog and trips

```text
GET /api/catalog/cities
GET /api/catalog/routes
GET /api/catalog/operators
GET /api/catalog/divisions
GET /api/catalog/fleet
GET /api/trips/search
GET /api/trips/:tripId
GET /api/trips/:tripId/seats
```

### Bookings

```text
POST /api/bookings/hold
POST /api/bookings/release
POST /api/bookings
GET  /api/bookings
GET  /api/bookings/:bookingId
POST /api/bookings/:bookingId/cancel
```

### Payments

```text
GET  /api/payments/instructions
POST /api/payments/:bookingId/submit
GET  /api/payments/pending       # admin
GET  /api/payments/admin-stats   # admin
POST /api/payments/:paymentId/verify  # admin
POST /api/payments/:paymentId/reject  # admin
```

### Tickets

```text
GET /api/tickets/:bookingId/pdf
GET /api/tickets/lookup/:code
```

## Testing and Validation

Run all typechecks:

```powershell
npm run typecheck
```

Build both applications:

```powershell
npm run build
```

Build only the server:

```powershell
npm run build --workspace server
```

Build only the client:

```powershell
npm run build --workspace client
```

Before deployment, manually verify:

1. Home page loads.
2. Search returns trips.
3. Seat selection works.
4. Booking creation works.
5. Payment submission works.
6. Admin login works.
7. Admin stats load.
8. Payment verification confirms a booking.
9. Rejection returns a reason to the customer.
10. Ticket PDF downloads.
11. Refreshing a nested Vercel route does not show a 404.
12. The frontend can call the deployed backend without a CORS error.

## Deployment

### Backend: Render

A Render blueprint is included at `render.yaml`.

### Option 1: Blueprint

1. Push the repository to GitHub.
2. In Render, choose `New +` and `Blueprint`.
3. Select the repository.
4. Render detects `render.yaml`.
5. Add the secret environment variables when prompted.
6. Deploy the service.

### Option 2: Manual Web Service

Use these settings:

```text
Service type: Web Service
Root Directory: server
Build Command: npm ci && npm run build
Start Command: npm start
Health Check Path: /health
```

Set these Render environment variables:

```text
NODE_ENV=production
MONGO_URI=your_mongodb_atlas_uri
JWT_ACCESS_SECRET=long_random_secret
JWT_REFRESH_SECRET=another_long_random_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CLIENT_URL=https://your-project.vercel.app
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
PAYMENT_RECEIVER_NUMBER=01875895858
```

After deployment, test:

```text
https://your-render-service.onrender.com/health
```

### Frontend: Vercel

1. Import the GitHub repository into Vercel.
2. Set the project root directory to `client`.
3. Use the Vite framework preset.
4. Set the build command to `npm run build`.
5. Set the output directory to `dist`.
6. Add this environment variable:

```text
VITE_API_URL=https://your-render-service.onrender.com
```

7. Deploy the frontend.
8. Copy the Vercel URL.
9. Update Render’s `CLIENT_URL` with that exact URL.
10. Redeploy the Render service.

The included `client/vercel.json` rewrites application routes to `index.html`, allowing direct navigation to routes such as `/admin`, `/search`, and `/my-tickets`.

## CORS and Cookies

The backend uses:

- Bearer access tokens for API requests
- An HTTP-only refresh-token cookie
- `credentials: true` for cross-origin requests

For production:

- `CLIENT_URL` must exactly match the Vercel origin.
- Do not add a trailing path such as `/admin` to `CLIENT_URL`.
- Multiple allowed frontend origins can be comma-separated.
- Use HTTPS for both Vercel and Render.
- Do not use wildcard `*` CORS with credentials.

Example:

```env
CLIENT_URL=https://ticketbus.vercel.app,https://ticketbus-preview.vercel.app
```

## Common Problems

### Admin login does not work

1. Confirm the email is `rimon@ticketbus.com`.
2. Confirm the password is `2002`.
3. Restart the backend so the startup account synchronization runs.
4. Confirm the backend is connected to the intended MongoDB database.
5. Check the backend logs for:

```text
Admin account ready: rimon@ticketbus.com / 2002
```

### Port 5000 is already in use

Windows:

```powershell
Get-NetTCPConnection -LocalPort 5000 -State Listen
Stop-Process -Id YOUR_PROCESS_ID -Force
```

Then start the server again.

### Frontend shows network errors in production

Check:

- `VITE_API_URL` is set in Vercel.
- The value points to the Render service, not the frontend URL.
- Render `CLIENT_URL` points to the Vercel URL.
- Render `/health` responds successfully.
- The Render service has finished deploying.

### Vercel shows a 404 after refreshing a page

Confirm `client/vercel.json` is present and included in the deployment. It provides the SPA rewrite to `index.html`.

### Payment verification does not appear

- Submit a payment from a customer account.
- Confirm the booking status is `AWAITING_VERIFICATION`.
- Log in with the admin account.
- Open `Admin Panel` and choose `Payment Verification`.
- Refresh the queue.

### Bus images are missing

Bus images are populated from Cloudinary URLs during seeding. Check Cloudinary credentials and run:

```powershell
npm run seed
```

## Production Checklist

- [ ] MongoDB Atlas network access allows Render.
- [ ] Production JWT secrets are long and unique.
- [ ] Cloudinary credentials are configured.
- [ ] Render `CLIENT_URL` matches the Vercel URL.
- [ ] Vercel `VITE_API_URL` matches the Render URL.
- [ ] `/health` returns success.
- [ ] Admin login works.
- [ ] Customer registration and login work.
- [ ] Search and booking work.
- [ ] Payment verification works.
- [ ] Ticket PDF download works.
- [ ] No secrets are committed to Git.
- [ ] Admin password is changed from the development credential before public launch.

## Useful Commands

```powershell
# Install all workspace dependencies
npm install

# Run frontend and backend in development
npm run dev

# Seed database and catalog data
npm run seed

# Typecheck both workspaces
npm run typecheck

# Build both workspaces
npm run build

# Start compiled backend
npm start --workspace server
```

## License and Ownership

This project is maintained as the TicketBus application. Add an explicit license before distributing the code publicly.
