# Lead Manager – Full‑Stack Assignment

## Live URLs
- Frontend: https://lead-manager-eta-black.vercel.app
- Backend: https://lead-manager-api-efe2.onrender.com

## Test Credentials
- Admin: admin@test.com / admin123
- Member 1: member1@test.com / member123
- Member 2: member2@test.com / member123

## Features
- Public lead capture form
- Role-based dashboard (Admin & Member)
- Lead lifecycle: New → Contacted → Qualified → Proposal → Negotiation → Won / Lost
- Lead assignment, notes, activity trail
- Full CRUD (edit, delete leads by admin)
- Paginated API with filtering
- Automated tests (auth + assignment flow)

## Run Locally
1. cd server && npm install
2. Copy server/.env.example to server/.env and fill your MongoDB URI & JWT_SECRET
3. Run seed: node server/utils/seed.js
4. Start server: cd server && npm run dev
5. cd client && npm install && npm run dev

## Run Tests
cd server && npm test
