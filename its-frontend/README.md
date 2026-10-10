# ITS Front End (React + Bootstrap)

React + TypeScript + Bootstrap 5 user interface for the Issue Tracking System.
It talks to the Spring Boot microservices **only through the API Gateway** (`http://localhost:8080`).

## Run it

1. Start the back end (see the root [README](../README.md)): MySQL → `eureka-server` → `user-service`, `project-service`, `issue-service` → `api-gateway`.
2. Install [Node.js 20+](https://nodejs.org/), then in this folder:

   ```bash
   npm install
   npm run dev
   ```

3. Open **http://localhost:3000**.

The Vite dev server forwards every `/api/**` call to the gateway, so no CORS setup is needed.
To use a different gateway URL, copy `.env.example` to `.env.local` and change `VITE_GATEWAY_URL`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server on port 3000 with hot reload |
| `npm run build` | Type-check and build the production bundle into `dist/` |
| `npm run preview` | Serve the built bundle (also proxies `/api` to the gateway) |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | ESLint |

## Milestones

| # | Screen | Status |
|---|---|---|
| 1 | Login (React **controlled** form) and Signup (React **uncontrolled** form) | ✅ |
| 2 | Project Owner Dashboard: project drop-down, owner and dates, issue board, assignee/priority filters, RegEx search, "No Projects Available" screen | ✅ |
| 3 | Create Project: validated form, owner drop-down from the Users API, date range check, redirect to the new project's dashboard | ✅ |
| 4 | Create Issue: all field validations (prime story points, numeric sprint, length limits), project and assignee drop-downs, redirect to the project board | ✅ |
