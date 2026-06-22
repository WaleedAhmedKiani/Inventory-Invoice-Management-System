<h1>Inventory & Invoice SaaS</h1>

A high-performance, multi-tenant SaaS platform built to handle end-to-end inventory tracking and automated invoicing. Designed with data integrity, security, and scalability as core pillars.

<h2>Key Architectural Pillars</h2>

Multi-Tenant Data Isolation: Every database operation is scoped by organizationId at the ORM level (Prisma), ensuring users only access data belonging to their organization.

Stateless Authentication: Secure JWT-based auth using HTTP-only cookies to eliminate risks associated with localStorage.

<b>Efficient State Management:</b>

Server State: React Query (TanStack Query) handles caching, synchronization, and background updates.

Client State: Zustand provides a lightweight, scalable store for UI/Session state.

Performance: Redis caching implemented for analytics and frequently queried products to reduce database load.

<h2>Tech Stack</h2> 

<b>Frontend</b>

Core: React (TypeScript), React Router

State: Zustand, React Query

Forms: React Hook Form + Zod (Strict validation)

Styling: Tailwind CSS

Analytics: Recharts

UI: React Hot Toast

<b>Backend</b>

Runtime: Node.js + Express

Database: PostgreSQL + Prisma ORM

Caching: Redis

Auth: JWT (Access + Refresh tokens)

<b>Integrations:</b>

Payments: Stripe (Subscription lifecycle management)

File Storage: Cloudinary

Transactional Email: Resend

<b>Security & RBAC</b>

Roles: OWNER, ADMIN, STAFF.

Validation: Zod-based request validation on every API endpoint.

Observability: Centralized logging using Winston/Pino.

<h2>Getting Started</h2>

Prerequisites

Node.js (v20+)

PostgreSQL

Redis

Stripe Account

Cloudinary Account

Resend API Key

Installation

Clone the repository

git clone <your-repo-url>
cd <project-folder>


<b>Backend Setup</b>

cd backend
npm install
# Copy .env.example to .env and fill in your credentials
npx prisma generate
npx prisma migrate deploy
npm run dev


<b>Frontend Setup</b>

cd ../frontend
npm install
# Copy .env.example to .env and set VITE_API_URL
npm run dev


📂 <b>Project Structure</b>

/src
 ├─ /api         # Centralized Axios client & endpoint definitions
 ├─ /components  # Shared UI components
 ├─ /pages       # Routed application views
 ├─ /hooks       # Custom React Query hooks
 ├─ /store       # Zustand state management
 ├─ /types       # Shared TS interfaces
 ├─ /utils       # Helper functions
 └─ /styles      # Global design system


Built for production scale. Data-isolated by design.
