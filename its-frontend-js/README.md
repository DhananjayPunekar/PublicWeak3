# ITS Front End – React (JavaScript) + Bootstrap

Week 4 front end for the Issue Tracking System, built **milestone by milestone** in plain JavaScript with Bootstrap classes (no custom CSS files).
It calls the Week 2 Spring Boot back end through the API Gateway on `http://localhost:8080`.

## Run it

1. Start the back end (see the root [README](../README.md)): MySQL → `eureka-server` → `user-service`, `project-service`, `issue-service` → `api-gateway`.
2. In this folder:

   ```bash
   npm install
   npm run dev
   ```

3. Open **http://localhost:3000**. Sample logins: `alice.smith@example.com` / `abc123` (Project Owner), `bob.johnson@example.com` / `def456` (Assignee).

The dev server forwards every `/api` call to the gateway, so the back end needs no CORS setup.

## Folder structure

```
its-frontend-js/
├── index.html
├── vite.config.js            dev server on port 3000, /api proxy to the gateway
├── package.json
└── src/
    ├── main.jsx              router + AuthProvider, imports Bootstrap
    ├── App.jsx               routes (dashboards only for the matching logged-in role)
    ├── components/           pages and UI pieces
    ├── model/                field values, role constants and validation rules
    ├── service/              API calls (fetch wrapper + one service per microservice)
    └── context/              logged-in user (AuthContext)
```

Styling uses Bootstrap classes only; the few values Bootstrap has no class for (e.g. the card's max width) are inline `style` attributes.
React hooks used: `useState`, `useEffect`, `useRef`, `useContext`, `useNavigate`, `useLocation`.

## Milestones

| # | Milestone | Status |
|---|---|---|
| 1 | Login (React **controlled** form) and Signup (React **uncontrolled** form) | ✅ |
| 2 | Project Owner Dashboard | ⏳ |
| 3 | Create Project | ⏳ |
| 4 | Create Issue | ⏳ |
| 5 | Issue Details | ⏳ |
| 6 | Assignee Dashboard | ⏳ |
| 7 | Back-end API integration | ⏳ |
| 8 | Push to GitHub | ⏳ |

## Milestone 1 – Login and Signup

| Screen | Component | Form type | Validation |
|---|---|---|---|
| Login `/login` | `components/Login.jsx` | **Controlled** – values in `useState`, inputs use `value` + `onChange` | Email required + format; password required, 6–100 chars, no spaces; role required; the chosen role must match the account |
| Signup `/signup` | `components/Signup.jsx` | **Uncontrolled** – no `value` props; values read from the DOM with `useRef` | Name required, not blank, letters only; email format; strong password (8+ chars, upper, lower, digit, special); profile image http(s) URL ending in an image extension; role required |

- Messages appear once the user interacts with a field; the submit button stays disabled while the form is invalid or the request is running.
- Login calls `POST /api/users/login` and opens `/owner/dashboard` or `/assignee/dashboard` by role (a simple welcome page until Milestones 2 and 6).
- Signup calls `POST /api/users` and shows *"Your account is created successfully"* with a link to the login page (email pre-filled).
- Server errors (wrong password, duplicate email, gateway down) are shown above the form.

### Assumptions
- The back end logs in with email + password only; the role on the login form is checked against the account's role.
- Login accepts passwords of 6+ characters so the sample accounts (e.g. `abc123`) work; new accounts need a strong password.
- The logged-in user is kept in `sessionStorage` (the back end issues no token), so it is cleared when the tab closes.
