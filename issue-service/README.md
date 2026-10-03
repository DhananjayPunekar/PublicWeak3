# Issue Service

Milestone 3 of the Issue Tracking System: issues within projects (Project Owner and Assignee views).

| | |
|---|---|
| Port | `8083` |
| Database | `issue_db` (create it with [`db/03_issue_db.sql`](../db/03_issue_db.sql)) |
| Swagger UI | http://localhost:8083/swagger-ui.html |
| Postman | [`postman/issue-service.postman_collection.json`](../postman/issue-service.postman_collection.json) |

## Run it in Spring Tool Suite (STS)

The steps are the same as for the [User Service](../user-service/README.md#run-it-in-spring-tool-suite-sts):

1. **Create the database** (once): run [`db/03_issue_db.sql`](../db/03_issue_db.sql).
2. **Import**: *File → Import… → Maven → Existing Maven Projects*. Select the `PublicWeak3` folder and tick `issue-service`.
3. **MySQL password**: in `src/main/resources`, copy `application-local.properties.example` to `application-local.properties` and fill in your MySQL username and password.
4. **Start**: right-click `IssueServiceApplication.java` → *Run As → Spring Boot App*, or use the Boot Dashboard. The console should end with `Tomcat started on port 8083`.
5. **Tests**: right-click the project → *Run As → JUnit Test*. They don't need MySQL.

**If you copy the files into your own STS project**, the main class (`IssueServiceApplication`) must sit in the base package and every other class in a sub-package of it, for example `com.deloitte` and `com.deloitte.controller`. Update the `package` and `import` lines to match.

## Endpoints

| Method | Endpoint | View | Description | Success |
|---|---|---|---|---|
| POST | `/api/issues` | Owner | Create an issue | 201 |
| GET | `/api/issues` | Owner | All issues | 200 |
| GET | `/api/issues/{id}` | Owner / Assignee | One issue | 200 |
| GET | `/api/issues/project/{projectId}` | Owner | Issues of a project | 200 |
| GET | `/api/issues/assignee/{assigneeId}` | Assignee | Issues assigned to a user | 200 |
| PUT | `/api/issues/{id}` | Owner | Update any fields (partial) | 200 |
| PATCH | `/api/issues/{id}/status` | Assignee | Change only the status | 200 |
| DELETE | `/api/issues/{id}` | Owner | Delete an issue | 200 |

### Inter-service endpoint (Milestone 5)

| Method | Endpoint | Calls | How | Success |
|---|---|---|---|---|
| GET | `/api/issues/owner/{ownerId}` | project-service `GET /api/projects/owner/{ownerId}`, then loads those projects' issues | Feign (`ProjectClient`) | 200 |

- "Issues owned by a user" means the issues of every project that user owns. If the user owns no projects, the result is an empty list.
- **503** if the Project Service is down or not registered in Eureka.
- `GET /api/issues/project/{projectId}` and `GET /api/issues/assignee/{assigneeId}` above are the endpoints the Project and User services call.

### Field values

| Field | Allowed values | Default |
|---|---|---|
| `type` | `BUG`, `FEATURE`, `TASK` | `TASK` |
| `priority` | `HIGH`, `MEDIUM`, `LOW` | required |
| `status` | `TO DO`, `DEVELOPMENT`, `TESTING`, `COMPLETED` | `TO DO` |
| `createdOn` | date `yyyy-MM-dd`, not in the future | today |
| `lastUpdated` | set by the server | today, on every change |

Values are case-insensitive. For status, `TO_DO`, `to-do` and `todo` are also accepted. Responses always use the exact values shown above.

### Create example

```http
POST /api/issues
Content-Type: application/json

{ "summary": "Login page crashes", "type": "BUG", "project": 101,
  "description": "Clicking Login with an empty password shows a stack trace",
  "priority": "HIGH", "assignee": 2, "createdBy": 1,
  "tags": "Authentication", "sprint": "Sprint 10", "storyPoint": 5 }
```

```json
{
  "message": "Issue created successfully",
  "issueId": 210,
  "issue": { "id": 210, "summary": "Login page crashes", "type": "BUG", "project": 101,
             "status": "TO DO", "createdOn": "2026-10-03", "lastUpdated": "2026-10-03", "...": "..." }
}
```

### Errors

The error body has the same shape as in the other services.

| Status | When |
|---|---|
| 400 | Missing/invalid fields, unknown type/priority/status (the message lists the allowed values), future `createdOn`, broken JSON, non-numeric ID |
| 404 | Issue doesn't exist |

## Design decisions / assumptions

- **Project Owner vs Assignee:** owners use `PUT` to change any field; assignees use `PATCH …/status`, which can only change the status. Each role will be restricted to its own endpoints once login tokens (JWT) are added.
- **`project`, `assignee` and `createdBy` are plain IDs**, because projects and users live in other services. They aren't checked against those services when an issue is saved (assumption: the client sends valid IDs).
- **Dates:** `lastUpdated` is always set by the server. `createdOn` may be given, for example when importing old issues, but can't be in the future.
- **`comments`** is a free-text field on the issue itself, as in the specification.

## Code layout

```
com.its.issueservice
├── controller   IssueController - REST endpoints, ResponseEntity everywhere
├── service      IssueService + impl - defaults, partial update, status update
├── repository   IssueRepository - Spring Data JPA
├── entity       Issue, IssueStatus (+ converter for 'TO DO'), Priority, IssueType
├── dto          request/response records with Bean Validation
├── exception    custom exceptions + GlobalExceptionHandler (@RestControllerAdvice)
└── config       Swagger metadata, Clock (for testable dates)
```
