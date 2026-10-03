# Issue Tracking System (ITS)

A microservices-based issue tracker built with **Spring Boot**, **Spring Cloud** and **MySQL**. Users sign up as *Project Owners* or *Assignees*. Owners create projects and issues; assignees work on the issues assigned to them.

See [PROJECT_STEPS.md](PROJECT_STEPS.md) for the full plan.

## Services

| Service | Port | Database | Status |
|---|---|---|---|
| [user-service](user-service/) | 8081 | `user_db` | Milestone 1 ✅ |
| [project-service](project-service/) | 8082 | `project_db` | Milestone 2 ✅ |
| [issue-service](issue-service/) | 8083 | `issue_db` | Milestone 3 ✅ |
| eureka-server | 8761 | – | Milestone 4 – next |
| api-gateway | 8080 | – | Milestone 7 |

## Getting started

1. Install **Spring Tool Suite 4** (it includes a JDK and Maven) and **MySQL 8**.
2. Create the databases: see [db/README.md](db/README.md).
3. In STS: *File → Import… → Maven → Existing Maven Projects*, select this repository folder and tick the services.
4. Start a service: see its README for the STS steps (for example [user-service/README.md](user-service/README.md)).
5. Import the Postman collections from [postman/](postman/).

## Repository layout

```
db/               MySQL scripts: one database per service, with sample data
postman/          Postman collections for testing each service
user-service/     Milestone 1 - sign up, login, user CRUD
project-service/  Milestone 2 - project CRUD, projects by owner
issue-service/    Milestone 3 - issue CRUD, status updates
```
