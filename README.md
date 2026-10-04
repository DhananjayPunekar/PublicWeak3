# Issue Tracking System (ITS)

A microservices-based issue tracker built with **Spring Boot**, **Spring Cloud** and **MySQL**. Users sign up as *Project Owners* or *Assignees*. Owners create projects and issues; assignees work on the issues assigned to them.

See [PROJECT_STEPS.md](PROJECT_STEPS.md) for the full plan.

## Services

| Service | Port | Database | Status |
|---|---|---|---|
| [user-service](user-service/) | 8081 | `user_db` | Milestone 1 ✅ |
| [project-service](project-service/) | 8082 | `project_db` | Milestone 2 ✅ |
| [issue-service](issue-service/) | 8083 | `issue_db` | Milestone 3 ✅ |
| [eureka-server](eureka-server/) | 8761 | – | Milestone 4 ✅ |
| [api-gateway](api-gateway/) | 8080 | – | Milestone 7 ✅ |

## Getting started

1. Install **Spring Tool Suite 4** (it includes a JDK and Maven) and **MySQL 8**.
2. Create the databases: see [db/README.md](db/README.md).
3. In STS: *File → Import… → Maven → Existing Maven Projects*, select this repository folder and tick the services.
4. Start **eureka-server first**, then `user-service`, `project-service` and `issue-service`, and finally `api-gateway`. See each README for the STS steps.
   Check http://localhost:8761: all four should be listed as UP.
5. Call everything through the gateway: **http://localhost:8080**/api/users, /api/projects, /api/issues …
6. Import the Postman collections from [postman/](postman/). `api-gateway.postman_collection.json` sends every request through the gateway.

## Inter-service communication (Milestone 5) ✅

| From | To | How | Endpoint |
|---|---|---|---|
| user-service | issue-service | Feign | `GET /api/users/{userId}/issues`, `GET /api/users/username/{username}/issues` |
| user-service | project-service | RestTemplate | `GET /api/users/{userId}/projects` |
| project-service | issue-service | Feign | `GET /api/projects/{projectId}/issues`, `GET /api/projects/projectName/{projectName}/issues` |
| issue-service | project-service | Feign | `GET /api/issues/owner/{ownerId}` |

Services find each other by name through Eureka (for example `http://project-service/...`), never by host and port. If a called service is down, the caller answers **503**. Postman: [`postman/inter-service.postman_collection.json`](postman/inter-service.postman_collection.json).

## Repository layout

```
db/               MySQL scripts: one database per service, with sample data
postman/          Postman collections for testing each service
user-service/     Milestone 1 - sign up, login, user CRUD
project-service/  Milestone 2 - project CRUD, projects by owner
issue-service/    Milestone 3 - issue CRUD, status updates
eureka-server/    Milestone 4 - service registry (dashboard on port 8761)
api-gateway/      Milestone 7 - single entry point on port 8080, routes via Eureka
```
