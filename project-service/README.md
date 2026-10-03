# Project Service

Milestone 2 of the Issue Tracking System: creating and managing projects (the Project Owner view).

| | |
|---|---|
| Port | `8082` |
| Database | `project_db` (create it with [`db/02_project_db.sql`](../db/02_project_db.sql)) |
| Swagger UI | http://localhost:8082/swagger-ui.html |
| Postman | [`postman/project-service.postman_collection.json`](../postman/project-service.postman_collection.json) |

## Run it in Spring Tool Suite (STS)

The steps are the same as for the [User Service](../user-service/README.md#run-it-in-spring-tool-suite-sts):

1. **Create the database** (once): run [`db/02_project_db.sql`](../db/02_project_db.sql).
2. **Import**: *File → Import… → Maven → Existing Maven Projects*. Select the `PublicWeak3` folder and tick `project-service`. If it's already imported, right-click the project → *Maven → Update Project…*
3. **MySQL password**: in `src/main/resources`, copy `application-local.properties.example` to `application-local.properties` and fill in your MySQL username and password.
4. **Start**: in the *Boot Dashboard*, select `project-service` and click ▶. The console should end with `Tomcat started on port 8082`.
5. **Tests**: right-click the project → *Run As → JUnit Test*. They don't need MySQL.

You can run the User Service and the Project Service at the same time, because they use different ports.

## Endpoints

| Method | Endpoint | Description | Success |
|---|---|---|---|
| POST | `/api/projects` | Create a project. Body: `projectName`, `productOwner` (user ID), `startDate`, `endDate` | 201 |
| GET | `/api/projects` | All projects | 200 |
| GET | `/api/projects/{projectId}` | One project | 200 |
| GET | `/api/projects/owner/{ownerId}` | Projects owned by a user (empty list if none) | 200 |
| PUT | `/api/projects/{projectId}` | Update any of `projectName`, `productOwner`, `startDate`, `endDate` | 200 |
| DELETE | `/api/projects/{projectId}` | Delete a project | 200 |

The two issue lookups (`/api/projects/{projectId}/issues`, `/api/projects/projectName/{projectName}/issues`) need the Issue Service and come in Milestone 5.

### Create example

```http
POST /api/projects
Content-Type: application/json

{ "projectName": "Project Zeta", "productOwner": 1,
  "startDate": "2026-01-01", "endDate": "2026-12-31" }
```

```json
{
  "message": "Project created successfully",
  "projectId": 106,
  "project": { "id": 106, "projectName": "Project Zeta", "productOwner": 1,
               "startDate": "2026-01-01", "endDate": "2026-12-31" }
}
```

Dates use the format `yyyy-MM-dd`.

### Errors

The error body has the same shape as in the User Service (`timestamp`, `status`, `error`, `message`, `path`, plus `fieldErrors` for validation errors).

| Status | When |
|---|---|
| 400 | Missing/invalid fields, end date before start date, invalid date such as `2026-13-01`, broken JSON (the message gives the line and column), non-numeric ID |
| 404 | Project ID doesn't exist |
| 409 | Project name already exists |

## Design decisions / assumptions

- **Project names are unique** (case-insensitive), because projects can also be looked up by name (Milestone 5).
- **The end date may equal the start date**, but may not be earlier.
- **`productOwner` is a plain user ID.** The user lives in the User Service's database, so there's no database foreign key. Milestone 5 adds a call to the User Service to check that the owner exists.
- **Update is partial**: only the fields present in the body change. The date rule is checked against the resulting dates, so sending only a new `startDate` is checked against the existing `endDate`.
- **Deleting a project** removes only the project for now. What happens to its issues is decided in Milestone 5, once the services talk to each other.

## Code layout

```
com.its.projectservice
├── controller   ProjectController - REST endpoints, ResponseEntity everywhere
├── service      ProjectService + impl - business rules (unique name, date order, partial update)
├── repository   ProjectRepository - Spring Data JPA
├── entity       Project
├── dto          request/response records with Bean Validation
├── exception    custom exceptions + GlobalExceptionHandler (@RestControllerAdvice)
└── config       Swagger metadata
```
