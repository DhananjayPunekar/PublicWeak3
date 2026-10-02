# Issue Tracking System (ITS) — Project Steps

A step-by-step plan for building the **Issue Tracking System** described in the problem statement: a Spring Boot microservices application backed by MySQL, with Eureka service discovery, a Spring Cloud API Gateway, inter-service calls (Feign / RestTemplate), Swagger docs, and the code pushed to GitHub.

---

## 1. What we are building (summary)

| Component | Responsibility | Own database |
|---|---|---|
| **Eureka Server** | Service registry – every service registers here | – |
| **API Gateway** (Spring Cloud Gateway) | Single entry point; routes `/user`, `/project`, `/issue` traffic; client-side load balancing | – |
| **User Service** | Sign up, login, user CRUD, roles (Project Owner / Assignee) | `user_db` |
| **Project Service** | Project CRUD, projects by owner | `project_db` |
| **Issue Service** | Issue CRUD, issues by project / owner / assignee, comments | `issue_db` |

**Inter-service communication (from the architecture diagram)**

- User Service → Project Service: **RestTemplate**
- User Service ↔ Issue Service and Project Service ↔ Issue Service: **Feign Client**

**Tools & technologies:** Spring Boot, Spring Cloud (Eureka, Gateway, OpenFeign, LoadBalancer), MySQL, Swagger/OpenAPI, Postman, Git/GitHub.

---

## 2. Step 0 — Prerequisites & environment setup

- [ ] Install **JDK 17+**, **Maven**, **MySQL 8**, **Postman**, **Git**, and **Spring Tool Suite (STS)** as the IDE.
- [ ] Create a GitHub repository (e.g. `issue-tracking-system`) and clone it locally.
- [ ] Decide versions once and use them in every service: **Spring Boot 3.x** with the **matching Spring Cloud release train** (check the compatibility table on spring.io).
- [ ] Create the three MySQL databases:
  ```sql
  CREATE DATABASE user_db;
  CREATE DATABASE project_db;
  CREATE DATABASE issue_db;
  ```
- [ ] Agree on ports (suggestion):

  | Service | Port |
  |---|---|
  | eureka-server | 8761 |
  | api-gateway | 8080 |
  | user-service | 8081 |
  | project-service | 8082 |
  | issue-service | 8083 |

### Suggested repository layout

```
issue-tracking-system/
├── eureka-server/
├── api-gateway/
├── user-service/
├── project-service/
├── issue-service/
├── postman/                  # exported Postman collection(s)
├── db/                       # schema.sql + sample-data.sql per service
├── .gitignore
└── README.md                 # how to run, assumptions, endpoint list
```

### Standard package structure inside each service

```
com.its.<service>
├── controller      # @RestController – returns ResponseEntity<>
├── service         # business logic (interface + impl)
├── repository      # Spring Data JPA repositories
├── entity          # JPA entities
├── dto             # request/response DTOs (never expose entities directly)
├── client          # Feign clients / RestTemplate wrappers
├── exception       # custom exceptions + @RestControllerAdvice
└── config          # Swagger, RestTemplate bean, security, etc.
```

---

## 3. Step 1 — Data model (per service)

Each service owns **only its own tables** (loose coupling). Cross-service references (e.g. `issue.assignee` → user) are stored as plain IDs and validated through API calls — not database foreign keys across databases.

### 3.1 User Service — `users`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| userId | INT | PK, AUTO_INCREMENT | |
| name | VARCHAR(255) | NOT NULL | |
| email | VARCHAR(255) | NOT NULL, UNIQUE (assumption) | used for login |
| password | VARCHAR(255) | NOT NULL | store **encrypted/hashed** (BCrypt) |
| role | ENUM('productOwner','assignee') | NOT NULL | |
| profile | VARCHAR(255) | nullable | profile image URL/path (optional) |

### 3.2 Project Service — `projects`

| Column | Type | Constraints |
|---|---|---|
| id | INT | PK, AUTO_INCREMENT |
| projectName | VARCHAR(255) | NOT NULL |
| productOwner | INT | NOT NULL — user ID of the owner (validated against User Service) |
| startDate | DATE | NOT NULL |
| endDate | DATE | NOT NULL (must be ≥ startDate) |

### 3.3 Issue Service — `issues`

| Column | Type | Constraints |
|---|---|---|
| id | INT | PK, AUTO_INCREMENT |
| summary | VARCHAR(255) | NOT NULL |
| type | ENUM('BUG','FEATURE','TASK') | |
| project | INT | NOT NULL — project ID (validated against Project Service) |
| description | TEXT | NOT NULL |
| priority | ENUM('HIGH','MEDIUM','LOW') | NOT NULL |
| assignee | INT | NOT NULL — user ID (validated against User Service) |
| createdBy | INT | user ID of creator |
| tags | VARCHAR(255) | |
| sprint | VARCHAR(255) | |
| storyPoint | INT | |
| status | ENUM('TO DO','DEVELOPMENT','TESTING','COMPLETED') | NOT NULL |
| createdOn | DATE | NOT NULL |
| lastUpdated | DATE | NOT NULL |
| comments | TEXT | optional |

### 3.4 Issue Service — `comments` (extension)

| Column | Type | Constraints |
|---|---|---|
| commentId | INT | PK, AUTO_INCREMENT |
| issueId | INT | FK → issues(id) |
| text | TEXT | NOT NULL |
| createdDate | DATE | NOT NULL |
| lastUpdated | DATE | NOT NULL |

- [ ] Create JPA entities for each table (use `@Enumerated(EnumType.STRING)` for enums).
- [ ] Write `db/<service>-schema.sql` and `db/<service>-data.sql` with the **sample data** from the reference sheet (9 users, projects 101–105, issues 201–209). The sample data is only a reference; the code must work for any data.

---

## 4. Step 2 — Milestone 1: User Microservice

- [ ] Generate a Spring Boot project (`user-service`) with: Spring Web, Spring Data JPA, MySQL Driver, Validation, Eureka Discovery Client, OpenFeign, Lombok (optional), springdoc-openapi.
- [ ] Configure `application.yml` (datasource → `user_db`, `spring.application.name: user-service`, port 8081).
- [ ] Implement entity, DTOs, repository, service and controller.
- [ ] Endpoints:

  | Method | Endpoint | Description |
  |---|---|---|
  | POST | `/api/users` | **Sign up** – create user (name, email, password, profile image, role). Response: *"Your account is created successfully"* + link to login |
  | POST | `/api/users/login` | **Login** – authenticate; response includes role so the client can redirect to the right dashboard |
  | GET | `/api/users` | List all users |
  | GET | `/api/users/{userId}` | Get user by ID |
  | PUT | `/api/users/{userId}` | Update user (name, password, role) |
  | DELETE | `/api/users/{userId}` | Delete user |
  | GET | `/api/users/{userId}/issues` | Issues assigned to the user — *inter-service* (Milestone 5) |
  | GET | `/api/users/username/{username}/issues` | Issues assigned to the user by username — *inter-service* (Milestone 5) |

- [ ] Validation: required fields, valid email format, unique email, role must be `productOwner` or `assignee`.
- [ ] Hash passwords with **BCrypt**; never return the password in responses.
- [ ] Test every endpoint in **Postman**; save the collection to `postman/`.
- [ ] Commit & push: `feat(user-service): user CRUD, signup and login`.

---

## 5. Step 3 — Milestone 2: Project Microservice

- [ ] Generate `project-service` (same dependencies), datasource → `project_db`, port 8082.
- [ ] Endpoints:

  | Method | Endpoint | Description |
  |---|---|---|
  | POST | `/api/projects` | Create project (projectName, productOwner, startDate, endDate) → returns project ID |
  | GET | `/api/projects` | List all projects |
  | GET | `/api/projects/{projectId}` | Get project by ID |
  | PUT | `/api/projects/{projectId}` | Update project |
  | DELETE | `/api/projects/{projectId}` | Delete project |
  | GET | `/api/projects/owner/{ownerId}` | Projects owned by a user |
  | GET | `/api/projects/{projectId}/issues` | Issues in a project — *inter-service* (Milestone 5) |
  | GET | `/api/projects/projectName/{projectName}/issues` | Issues in a project by name — *inter-service* (Milestone 5) |

- [ ] Validation: name not blank, `endDate >= startDate`, product owner exists **and** has role `productOwner` (check via User Service once Milestone 5 is in place).
- [ ] Test in Postman; commit & push.

---

## 6. Step 4 — Milestone 3: Issue Microservice

- [ ] Generate `issue-service`, datasource → `issue_db`, port 8083.
- [ ] Endpoints:

  | Method | Endpoint | Description |
  |---|---|---|
  | POST | `/api/issues` | Create issue → returns issue ID |
  | GET | `/api/issues` | List all issues |
  | GET | `/api/issues/{id}` | Get issue by ID |
  | PUT | `/api/issues/{id}` | Update issue (status, assignee, priority, etc.) — set `lastUpdated` automatically |
  | DELETE | `/api/issues/{id}` | Delete issue |
  | GET | `/api/issues/project/{projectId}` | Issues of a project — *called by Project Service* |
  | GET | `/api/issues/assignee/{assigneeId}` | Issues assigned to a user — *called by User Service* |
  | GET | `/api/issues/owner/{ownerId}` | Issues owned by a project owner (issues across all projects owned by that user) — *inter-service* |

- [ ] Set `createdOn` / `lastUpdated` server-side; default `status` to `TO DO` if not provided.
- [ ] Validation: required fields, valid enum values, project exists, assignee exists.
- [ ] **Assignee view:** an assignee can view their issues and update **status only**; a project owner can update all fields. (Enforce using the caller's role.)
- [ ] Optional extension: comments endpoints (`POST /api/issues/{id}/comments`, `GET /api/issues/{id}/comments`, …) using the `comments` table.
- [ ] Test in Postman; commit & push.

---

## 7. Step 5 — Milestone 4: Eureka Server & service registration

- [ ] Create `eureka-server` (dependency: Eureka Server), annotate main class with `@EnableEurekaServer`.
- [ ] `application.yml`: port 8761, `register-with-eureka: false`, `fetch-registry: false`.
- [ ] In each microservice add the Eureka client dependency and:
  ```yaml
  eureka:
    client:
      service-url:
        defaultZone: http://localhost:8761/eureka/
  ```
- [ ] Start Eureka first, then the services; verify **USER-SERVICE, PROJECT-SERVICE, ISSUE-SERVICE** (and later API-GATEWAY) appear on the dashboard at `http://localhost:8761`.
- [ ] Take a screenshot of the dashboard for the README.
- [ ] Commit & push.

---

## 8. Step 6 — Milestone 5: Inter-service communication

Implement every endpoint marked *inter-service* above.

| Caller | Endpoint | Calls | Mechanism |
|---|---|---|---|
| User Service | `GET /api/users/{userId}/issues` | Issue `GET /api/issues/assignee/{id}` | Feign |
| User Service | `GET /api/users/username/{username}/issues` | look up user by name → Issue `GET /api/issues/assignee/{id}` | Feign |
| User Service | (e.g. user's owned projects) | Project `GET /api/projects/owner/{ownerId}` | **RestTemplate** (`@LoadBalanced`) |
| Project Service | `GET /api/projects/{projectId}/issues` | Issue `GET /api/issues/project/{id}` | Feign |
| Project Service | `GET /api/projects/projectName/{name}/issues` | look up project by name → Issue `GET /api/issues/project/{id}` | Feign |
| Project Service | create/update project | User `GET /api/users/{id}` (validate owner) | Feign |
| Issue Service | `GET /api/issues/owner/{ownerId}` | Project `GET /api/projects/owner/{ownerId}` → issues for those projects | Feign |
| Issue Service | create/update issue | Project `GET /api/projects/{id}`, User `GET /api/users/{id}` (validation) | Feign |

- [ ] Add `@EnableFeignClients` and create `@FeignClient(name = "issue-service")` style interfaces (use **service names**, not hard-coded URLs, so Eureka resolves them).
- [ ] Declare a `@Bean @LoadBalanced RestTemplate` in User Service for the RestTemplate call.
- [ ] Handle downstream failures gracefully (404 from another service → meaningful error, service down → 503).
- [ ] Test all inter-service endpoints in Postman; commit & push.

---

## 9. Step 7 — Milestone 6: ResponseEntity, exception handling & Swagger

- [ ] Return `ResponseEntity<>` from **every** controller method with correct status codes:
  - `201 Created` – create; `200 OK` – get/update; `204 No Content` (or 200 with message) – delete
  - `400 Bad Request` – validation errors; `401 Unauthorized` – bad login; `404 Not Found` – missing resource; `409 Conflict` – duplicate email; `503` – downstream service unavailable
- [ ] Create custom exceptions (`ResourceNotFoundException`, `DuplicateResourceException`, `InvalidRequestException`, …).
- [ ] Add a global `@RestControllerAdvice` returning a consistent error body:
  ```json
  { "timestamp": "...", "status": 404, "error": "Not Found", "message": "Issue 999 not found", "path": "/api/issues/999" }
  ```
- [ ] Add `@Valid` + Bean Validation annotations (`@NotBlank`, `@Email`, `@NotNull`, …) on request DTOs.
- [ ] Add **springdoc-openapi** to each service; verify Swagger UI at `http://localhost:<port>/swagger-ui.html`; annotate endpoints with `@Operation` / `@ApiResponse` descriptions.
- [ ] Commit & push.

---

## 10. Step 8 — Milestone 7: API Gateway

- [ ] Create `api-gateway` with Spring Cloud Gateway + Eureka Client (+ LoadBalancer).
- [ ] Configure routes using `lb://` URIs (client-side load balancing via Eureka):
  ```yaml
  spring:
    cloud:
      gateway:
        routes:
          - id: user-service
            uri: lb://USER-SERVICE
            predicates: [ Path=/api/users/** ]
          - id: project-service
            uri: lb://PROJECT-SERVICE
            predicates: [ Path=/api/projects/** ]
          - id: issue-service
            uri: lb://ISSUE-SERVICE
            predicates: [ Path=/api/issues/** ]
  ```
- [ ] Verify all endpoints work through `http://localhost:8080/...` only.
- [ ] (Optional) Demonstrate load balancing by running two instances of one service on different ports.
- [ ] (Optional) Add a fallback / circuit breaker for failure handling, and aggregate Swagger docs at the gateway.
- [ ] Update the Postman collection to use the gateway base URL; commit & push.

---

## 11. Step 9 — Non-functional requirements

- [ ] **Authentication / security:** secure the application and data — e.g. login returns a **JWT**; the gateway (or each service) validates the token; role-based access (Project Owner vs Assignee). Passwords stored with BCrypt.
- [ ] **Low latency / high throughput:** pagination on list endpoints (optional), DB indexes on foreign-key columns (`project`, `assignee`, `productOwner`), avoid N+1 calls between services.
- [ ] **Scalable & maintainable:** stateless services, config externalised in `application.yml`, layered code, DTOs, clear naming.
- [ ] **Extensibility:** keep the design open to plug in later features (real-time updates, notifications on status change, in-issue commenting) — e.g. a service-layer hook/event when an issue's status changes.

---

## 12. Step 10 — Code quality & best practices checklist

- [ ] Clear, consistent resource naming (nouns: `/users`, `/projects`, `/issues`).
- [ ] RESTful HTTP methods: GET fetch, POST create, PUT/PATCH update, DELETE remove.
- [ ] Appropriate HTTP status codes on every response.
- [ ] Dependency injection (constructor injection or `@Autowired`) for services/repositories.
- [ ] Global exception handling with `@RestControllerAdvice` and meaningful error messages.
- [ ] Relevant comments / Javadoc on classes and public methods.
- [ ] Unit tests for service layer (JUnit 5 + Mockito) and a few controller tests (`@WebMvcTest`).
- [ ] No secrets committed (DB passwords via environment variables or a local, git-ignored profile).

---

## 13. Step 11 — Milestone 8: Push to GitHub

- [ ] `.gitignore` for `target/`, `.idea/`, `*.iml`, `.vscode/`, local config.
- [ ] Work on feature branches (`feature/user-service`, `feature/project-service`, …), open **pull requests**, merge to `main`, and resolve any conflicts (the guidelines ask for this explicitly).
- [ ] Write the **README.md**:
  - architecture diagram / description
  - tech stack and versions
  - how to set up MySQL and run each service (start order: Eureka → services → Gateway)
  - endpoint list + link to Swagger UIs
  - **assumptions made** (see §14)
  - Eureka dashboard and Postman screenshots
- [ ] Include `postman/ITS.postman_collection.json` and `db/*.sql`.
- [ ] Final push of the complete build to the GitHub repository.

---

## 14. Step 12 — Prepare for the technical interview

The final evaluation is a discussion of **assumptions, functionalities and validations**. Keep a list ready:

**Assumptions to document**

- Login is by **email + password** (the login screen also lists name, profile image and role — role is returned by the API and used to choose the dashboard).
- `email` is unique per user.
- An issue can only be created for an existing project and assigned to an existing user with role `assignee`.
- Assignees may update only an issue's **status**; project owners can update everything.
- `createdOn` / `lastUpdated` are set by the server.
- Deleting a project: decide and document — block if it has issues, or delete its issues too.

**Gaps / inconsistencies noticed in the reference material (worth mentioning)**

- The document's endpoint table uses `/api/...` while the spreadsheet uses `/users`, `/projects`, … without `/api` — pick `/api/...` consistently.
- The document lists no PUT/DELETE for users or DELETE for issues, but the spreadsheet does — implement the full CRUD set.
- The spreadsheet's `Users` table omits `email` and `profile`, and the `Issues` table omits `type`, `sprint`, `tags`, `storyPoint`, `createdBy` — but the ER diagram and sample data include them, so include them.
- Sample data has issue 207 assigned to user **10**, who doesn't exist (users are 1–9) — a good example for your "assignee must exist" validation.
- Sample projects 102, 104 and 105 have owners (users 3, 2, 5) whose role is `assignee`, and issues 205, 206 and 209 are assigned to users 6 and 8, whose role is `productOwner` — decide whether to enforce role checks on owner/assignee (and say so), since strict checks would reject some of the sample data.
- The spreadsheet has a "Comments Endpoints" section that is cut off in the photos; check the original sheet for the exact endpoints.

**Demo flow**

1. Show Eureka dashboard with all services registered.
2. Sign up → login (owner and assignee) via the gateway.
3. Owner creates a project → creates issues → assigns them.
4. Assignee fetches their issues → updates status.
5. Show inter-service endpoints (`/api/users/{id}/issues`, `/api/projects/{id}/issues`, `/api/issues/owner/{id}`).
6. Show validation errors and the global error response format.
7. Show Swagger UI for each service.

---

## 15. Milestone tracker

| # | Milestone | Done |
|---|---|---|
| 1 | User Microservice + endpoints, tested in Postman | ☐ |
| 2 | Project Microservice + endpoints, tested in Postman | ☐ |
| 3 | Issue Microservice + endpoints, tested in Postman | ☐ |
| 4 | Eureka Server; all services registered on dashboard | ☐ |
| 5 | All inter-service communication endpoints | ☐ |
| 6 | ResponseEntity everywhere + Swagger documentation | ☐ |
| 7 | API Gateway with load balancing; all endpoints via gateway | ☐ |
| 8 | Build pushed to GitHub repository | ☐ |
| – | Technical interview: assumptions, functionality, validations | ☐ |
