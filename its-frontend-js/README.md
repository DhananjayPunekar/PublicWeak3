# ITS Front End – React (JavaScript) + Bootstrap

Week 4 front end for the Issue Tracking System, built **milestone by milestone** in plain JavaScript (Create React App) with Bootstrap classes (no custom CSS files).
It calls the Week 2 Spring Boot microservices directly (user-service 8081, project-service 8082, issue-service 8083).

## Run it

This is a **Create React App** project. The front end calls the three microservices **directly** (no API Gateway):

| Service | URL used by the front end |
|---|---|
| user-service | `http://localhost:8081/api/users` |
| project-service | `http://localhost:8082/api/projects` |
| issue-service | `http://localhost:8083/api/issues` |

If your services run on other ports, change the URL constant at the top of the matching file in `src/service/`.
Each service allows the React app's origin `http://localhost:3000` through its `config/CorsConfig.java`.

1. Start the back end (see the root [README](../README.md)): MySQL → `eureka-server` → `user-service`, `project-service`, `issue-service`.
2. In this folder:

   ```bash
   npm install
   npm start
   ```

3. Open **http://localhost:3000**. Sample logins: `alice.smith@example.com` / `abc123` (Project Owner), `bob.johnson@example.com` / `def456` (Assignee).

## Folder structure

```
its-frontend-js/
├── package.json              dependencies and scripts
├── public/
│   └── index.html            page with <div id="root"> (required by Create React App)
└── src/
    ├── index.js              entry point: router + AuthProvider, imports Bootstrap
    ├── App.js                routes (dashboards only for the matching logged-in role)
    ├── components/           pages and UI pieces
    ├── model/                field values, role constants and validation rules
    ├── service/              API calls with axios: userService, projectService, issueService
    └── context/              logged-in user (AuthContext)
```

API calls use **axios**. Each service file exports one `async` function per endpoint (e.g. `loginUser`, `registerUser`, `getProjectsByOwner`) that returns `response.data` and, on failure, throws an `Error` with the server's message (`error.response.data.message`).

Styling uses Bootstrap classes only; the few values Bootstrap has no class for (e.g. the card's max width) are inline `style` attributes.
React hooks used: `useState`, `useEffect`, `useRef`, `useContext`, `useNavigate`, `useLocation`.

## Milestones

| # | Milestone | Status |
|---|---|---|
| 1 | Login (React **controlled** form) and Signup (React **uncontrolled** form) | ✅ |
| 2 | Project Owner Dashboard | ✅ |
| 3 | Create Project | ✅ |
| 4 | Create Issue | ⏳ |
| 5 | Issue Details | ⏳ |
| 6 | Assignee Dashboard | ⏳ |
| 7 | Back-end API integration | ⏳ |
| 8 | Push to GitHub | ⏳ |

## Milestone 1 – Login and Signup

| Screen | Component | Form type | Validation |
|---|---|---|---|
| Login `/login` | `components/Login.js` | **Controlled** – values in `useState`, inputs use `value` + `onChange` | Email required + format; password required, 6–100 chars, no spaces; role required; the chosen role must match the account |
| Signup `/signup` | `components/Signup.js` | **Uncontrolled** – no `value` props; values read from the DOM with `useRef` | Name required, not blank, letters only; email format; strong password (8+ chars, upper, lower, digit, special); profile image http(s) URL ending in an image extension; role required |

- Messages appear once the user interacts with a field; the submit button stays disabled while the form is invalid or the request is running.
- Login calls `POST /api/users/login` and opens `/owner/dashboard` or `/assignee/dashboard` by role (a simple welcome page until Milestones 2 and 6).
- Signup calls `POST /api/users` and shows *"Your account is created successfully"* with a link to the login page (email pre-filled).
- Server errors (wrong password, duplicate email, service down) are shown above the form.

### Assumptions (Milestone 1)
- The back end logs in with email + password only; the role on the login form is checked against the account's role.
- Login accepts passwords of 6+ characters so the sample accounts (e.g. `abc123`) work; new accounts need a strong password.
- The logged-in user is kept in `sessionStorage` (the back end issues no token), so it is cleared when the tab closes.

## Milestone 2 – Project Owner Dashboard (`/owner/dashboard`)

| Part | Component | What it does |
|---|---|---|
| Sidebar | `components/Sidebar.js` | Profile image (initials if none), name, email, *Projects Created* and *Issues Created* counters, links to Project Dashboard / Create Project / Create Issue, Logout |
| Header | `components/Header.js` | Search bar on the left, application name on the right |
| Dashboard | `components/ProjectDashboard.js` | Project drop-down (first project selected by default), project owner name, start/end date as dd-mm-yyyy, filters by assignee and priority, "No Projects Available!" with a Create Project link |
| Issue board | `components/IssueBoard.js` | Cards in To Do / Development / Testing / Completed with ID, creation date, title, description, assignee photo + name and priority |

APIs: `GET /api/projects/owner/{ownerId}`, `GET /api/projects/{projectId}/issues`, `GET /api/issues/owner/{ownerId}`, `GET /api/users`.
Search (RegEx on summary/description), assignee filter and priority filter all run in the browser (`filterIssues` in `model/Issue.js`).

### Assumptions (Milestone 2)
- *Issues Created* counts the issues of every project the owner owns.
- The assignee filter lists the team members of the selected project, i.e. everyone assigned to one of its issues.
- Invalid RegEx text in the search bar (e.g. `(`) is searched as plain text.
- The Create Issue link leads back to the dashboard until Milestone 4.

## Milestone 3 – Create Project (`/owner/projects/new`)

Component: `components/CreateProject.js` – a React **controlled** form, with the sidebar and header.

| Field | Validation |
|---|---|
| Project Name | required, max 150 characters, no special characters except `- / \| .` |
| Project Owner | required drop-down of users with the Project Owner role (`GET /api/users`); the logged-in owner is preselected |
| Project Start Date | required date picker |
| Project End Date | required date picker, not earlier than the start date |

- **Create** is enabled only when the form is valid and disabled while `POST /api/projects` runs.
  On success the user goes to the Project Dashboard with the new project selected and a success message; on failure the server's message is shown (e.g. *A project named 'X' already exists*).
- **Reset** sets all fields to blank.
- Validation rules live in `model/Project.js` (`validateProject`), the API call in `service/projectService.js` (`createProject`).
