# Back-end API integration

The React app talks to the Spring Boot microservices from the Week 2 case study **only through the API Gateway**.

```
Browser ──/api/**──▶ Vite dev server (port 3000, proxy) ──▶ API Gateway :8080 ──▶ Eureka lookup
                                                                ├─ /api/users/**    → user-service    :8081
                                                                ├─ /api/projects/** → project-service :8082
                                                                └─ /api/issues/**   → issue-service   :8083
```

Because the browser only ever calls its own origin (`http://localhost:3000/api/...`), **no CORS configuration is needed** in the back end. `npm run preview` proxies the same way. To call a gateway directly instead (for example from a static web server), set `VITE_API_BASE_URL=http://localhost:8080` at build time and allow that origin with CORS in the gateway.

## Layers

| Layer | Folder | Purpose |
|---|---|---|
| Models | `src/models/` | TypeScript interfaces matching the back-end DTOs (`UserResponse`, `ProjectResponse`, `IssueResponse`, request bodies, `ApiError`) |
| HTTP client | `src/services/httpClient.ts` | `fetch` wrapper: JSON in/out, 15 s timeout, turns failures into an `ApiError` with a readable message |
| Endpoints | `src/services/endpoints.ts` | Every URL in one place |
| Services | `src/services/userService.ts`, `projectService.ts`, `issueService.ts` | One typed function per endpoint |
| Hooks | `src/hooks/useApi.ts`, `useUsers.ts`, `useIssueWithProject.ts` | Loading / error / reload state for screens |

## Screens and the endpoints they use

| Screen | Endpoint(s) |
|---|---|
| Login | `POST /api/users/login` |
| Signup | `POST /api/users` |
| Session restore (page refresh) | `GET /api/users/{userId}` |
| Sidebar – Project Owner counters | `GET /api/projects/owner/{ownerId}`, `GET /api/issues/owner/{ownerId}` |
| Sidebar – Assignee counter | `GET /api/users/{userId}/issues` |
| Project Owner Dashboard | `GET /api/projects/owner/{ownerId}`, `GET /api/projects/{projectId}/issues`, `GET /api/users` |
| Create Project | `GET /api/users` (owner drop-down), `POST /api/projects` |
| Create Issue | `GET /api/projects/owner/{ownerId}`, `GET /api/users`, `POST /api/issues` |
| Issue Details (owner) | `GET /api/issues/{id}`, `GET /api/projects/{projectId}`, `GET /api/users` |
| Edit Issue | the three above + `PUT /api/issues/{id}` |
| Assignee Dashboard | `GET /api/users/{userId}/issues` |
| Assignee Issue Details | `GET /api/issues/{id}`, `GET /api/projects/{projectId}`, `PATCH /api/issues/{id}/status` |

## Value mapping

| Field | UI | Sent to / received from the API |
|---|---|---|
| Role | Project Owner / Assignee | `productOwner` / `assignee` |
| Status (1–4) | To Do, Development, Testing, Completed | `TO DO`, `DEVELOPMENT`, `TESTING`, `COMPLETED` |
| Priority (1–3) | Low, Medium, High | `LOW`, `MEDIUM`, `HIGH` |
| Type (1–3) | Bug, Task, Story / Feature | `BUG`, `TASK`, `FEATURE` (the back end has no `STORY`) |
| Dates | `dd-mm-yyyy` | ISO `yyyy-MM-dd` |
| Sprint | number 1, 2, 3 … | text, e.g. `"2"` |
| Tags | comma-separated, shown as badges | one text value, e.g. `"#login, #ui"` |

## Error handling

| Situation | What the user sees |
|---|---|
| 400 validation error | The back end's message plus each field message (`fieldErrors`) |
| 401 on login | "Invalid email or password" (from the server) |
| 404 | e.g. "Issue with ID 99 not found", with a link back |
| 409 | e.g. "A project named 'X' already exists" / duplicate email |
| 503 (a microservice is down) | The gateway/service message |
| Gateway not running / network error | "Unable to reach the server. Please check that the API gateway (port 8080) is running." with *Try again* |
| No answer within 15 s | "The server took too long to respond." |

## Extension point: issue events

`src/services/issueEvents.ts` is a small publish/subscribe hub. Screens publish `issue-created`, `issue-updated` and `status-changed` events; `NotificationToasts` subscribes and shows a notification when an issue changes status. Real-time updates (WebSocket / Server-Sent Events), targeted notifications or in-issue comments can be added by subscribing to, or emitting into, this hub without touching the screens.

## Differences from the API list in the requirements

- The requirements list `/api/v1/...` URLs; the Week 2 back end exposes the same resources under `/api/...`, so those are used.
- `GET /api/v1/projects/{projectId}/insights` is listed but not implemented by the back end, and no screen needs it.
- `GET /api/users/username/{username}/issues` and `GET /api/projects/projectName/{projectName}/issues` exist in the back end but no screen needs them.
