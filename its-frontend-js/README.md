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
React hooks used: `useState`, `useEffect`, `useRef`, `useContext`, `useNavigate`, `useLocation`, `useParams`.

## Milestones

| # | Milestone | Status |
|---|---|---|
| 1 | Login (React **controlled** form) and Signup (React **uncontrolled** form) | ✅ |
| 2 | Project Owner Dashboard | ✅ |
| 3 | Create Project | ✅ |
| 4 | Create Issue | ✅ |
| 5 | Issue Details | ✅ |
| 6 | Assignee Dashboard | ✅ |
| 7 | Back-end API integration | ⏳ |
| 8 | Push to GitHub | ⏳ |

## Milestone 1 – Login and Signup

| Screen | Component | Form type | Validation |
|---|---|---|---|
| Login `/login` | `components/Login.js` | **Controlled** – values in `useState`, inputs use `value` + `onChange` | Email required + format; password required, 6–100 chars, no spaces; role required; the chosen role must match the account |
| Signup `/signup` | `components/Signup.js` | **Uncontrolled** – no `value` props; values read from the DOM with `useRef` | Name required, not blank, letters only; email format; strong password (8+ chars, upper, lower, digit, special); profile image http(s) URL ending in an image extension; role required |

- Messages appear once the user interacts with a field; the submit button stays disabled while the form is invalid or the request is running.
- Login calls `POST /api/users/login` and opens `/owner/dashboard` or `/assignee/dashboard` by role.
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

## Milestone 4 – Create Issue (`/owner/issues/new`)

Component: `components/CreateIssue.js` – a React **controlled** form, with the sidebar and header.

| Field | Validation |
|---|---|
| Summary | required, max 150 characters, no special characters except `- / \| .` |
| Type | required drop-down: Bug, Task, Story / Feature |
| Project | required drop-down of the owner's projects (`GET /api/projects/owner/{ownerId}`) |
| Description | optional, max 500 characters |
| Priority | required drop-down: Low, Medium, High |
| Assignee | required drop-down of users with the Assignee role (`GET /api/users`) |
| Tags | text, max 100 characters |
| Sprint | numbers only: 1, 2, 3 ... |
| Story Point | numbers only, and only prime numbers (2, 3, 5, 7, 11, 13 ...) |
| Status | required drop-down, starts at To Do |

- **Create** is enabled only when the form is valid and disabled while `POST /api/issues` runs.
  On success the user goes to the project board of the issue's project with a success message; on failure the server's message is shown.
- **Reset** sets all fields to blank.
- Validation rules live in `model/Issue.js` (`validateIssue`, `isPrime`), the API call in `service/issueService.js` (`createIssue`).

### Assumptions (Milestone 4)
- The requirements map type 3 to STORY; the back end calls it FEATURE, so the option reads *Story / Feature* and sends `FEATURE`.
- The back end requires a description, so an empty one is saved as *"No description provided."*.
- Sprint and Story Point are optional (not marked required); when filled they must follow the rules above.
- The logged-in owner is sent as `createdBy`.

## Milestone 5 – Issue Details and Edit Issue (Project Owner)

Clicking an issue card on the Project Dashboard opens its details.

### Issue Detail (`/owner/issues/:issueId`) – `components/IssueDetails.js`
- Breadcrumb *Project Board / Issue Details* (back to the board of this issue's project).
- Title, description, type, tags (badges), story points, sprint, priority.
- Side panel: **Edit Issue** button, status, assignee (photo + name), created on, last updated (dd-mm-yyyy).
- The Edit Issue button is shown only for issues of projects the logged-in owner owns.

### Edit Issue (`/owner/issues/:issueId/edit`) – `components/EditIssue.js`
A React **controlled** form, filled with the issue's current values.

| Field | Validation |
|---|---|
| Summary | required, 5–100 characters |
| Project | required, from the owner's projects |
| Type | required: Bug, Task, Story / Feature |
| Priority | required: Low, Medium, High |
| Description | required, 10–500 characters |
| Assignee | required, from the users list |
| Sprint | required, positive whole number |
| Status | required: To Do, Development, Testing, Completed |
| Tags | optional, several tags separated by commas |
| Story Point | required, positive whole number |

- **Edit** is enabled only when all required fields are valid; it calls `PUT /api/issues/{id}` and returns to the details with a success message.
- **Reset** puts the form back to the values loaded from the server.
- Rules live in `model/Issue.js` (`validateEditIssue`, `issueToForm`), API calls in `service/issueService.js` (`getIssueById`, `updateIssue`) and `service/projectService.js` (`getProjectById`).

### Assumptions (Milestone 5)
- Older issues store the sprint as text such as "Sprint 3"; the edit form shows only the number (3) and saves it as "3".
- The assignee drop-down lists users with the Assignee role, plus the issue's current assignee if they have another role.

## Milestone 6 – Assignee Dashboard and Assignee Issue Details

### Assignee Dashboard (`/assignee/dashboard`) – `components/AssigneeDashboard.js`
| Component | Implementation |
|---|---|
| Header | search bar on the left, application name on the right |
| Search bar | filters issues whose summary or description matches the text as a RegEx (in the browser) |
| Side bar | profile image, name, email, number of issues assigned, Logout |
| Issue display | cards in To Do / Development / Testing / Completed with ID, title, description, created date, priority, assignee name and photo – from `GET /api/users/{userId}/issues` |

### Assignee Issue Details (`/assignee/issues/:issueId`) – `components/AssigneeIssueDetails.js`
- Opens when an issue card is clicked; breadcrumb *Issue Dashboard / Issue Details*.
- Shows title, description, type, tags, story points, sprint, priority, status, created on and last updated.
- A status drop-down; **Save Updates** becomes enabled only when the status is changed and saves it with `PATCH /api/issues/{id}/status`.
- Issues not assigned to the logged-in user are read-only.

API calls: `getAssignedIssues` in `service/userService.js`, `updateIssueStatus` in `service/issueService.js`.
