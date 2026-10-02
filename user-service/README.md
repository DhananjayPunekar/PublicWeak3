# User Service

Milestone 1 of the Issue Tracking System: sign up, login and user management.

| | |
|---|---|
| Port | `8081` |
| Database | `user_db` (create it with [`db/01_user_db.sql`](../db/01_user_db.sql)) |
| Swagger UI | http://localhost:8081/swagger-ui.html |
| Postman | [`postman/user-service.postman_collection.json`](../postman/user-service.postman_collection.json) |

## Run it in Spring Tool Suite (STS)

Requirements: STS 4 (bundles a JDK and Maven), MySQL 8.

**1. Create the database (once).** Run [`db/01_user_db.sql`](../db/01_user_db.sql) in MySQL Workbench, or in a terminal:
`mysql -u root -p < db/01_user_db.sql`

**2. Import the project**
1. *File → Import… → Maven → Existing Maven Projects → Next*.
2. *Root Directory*: choose the cloned `PublicWeak3` folder, then *Browse*. STS lists every `pom.xml` it finds. Tick `user-service` (and later the other services) and click *Finish*.
3. Wait for the Maven download to finish (progress bar at the bottom right). If the project shows red errors afterwards, right-click it → *Maven → Update Project…* → *OK*.

**3. Set your MySQL password**
1. In `src/main/resources`, copy `application-local.properties.example` to a new file named `application-local.properties` in the same folder.
2. Put your MySQL username and password in it.

This file is git-ignored, so your password is never pushed to GitHub. If your MySQL login is `root` / `root`, you can skip this step.

**4. Start the service.** In the *Boot Dashboard* view (bottom left), select `user-service` and click the ▶ start button. Or right-click the project → *Run As → Spring Boot App*.

The console should end with `Tomcat started on port 8081`. Then open http://localhost:8081/swagger-ui.html.

With **DevTools** included, the service restarts by itself every time you save a Java file.

**5. Run the tests** (they don't need MySQL). Right-click the project → *Run As → JUnit Test*. Or *Run As → Maven test*.

### Command line (optional)

```bash
cd user-service
mvn spring-boot:run      # uses application-local.properties if present
mvn test
```

The settings resolve in this order: environment variables (`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`), then `application-local.properties`, then the defaults (`localhost:3306`, `root` / `root`).

## Endpoints

| Method | Endpoint | Description | Success |
|---|---|---|---|
| POST | `/api/users` | Sign up. Body: `name`, `email`, `password`, `role`, optional `profileImage` | 201 |
| POST | `/api/users/login` | Login with `email` + `password`; returns the user and the dashboard for their role | 200 |
| GET | `/api/users` | All users | 200 |
| GET | `/api/users/{userId}` | One user | 200 |
| PUT | `/api/users/{userId}` | Update any of `name`, `email`, `password`, `role`, `profileImage` | 200 |
| DELETE | `/api/users/{userId}` | Delete a user | 200 |

The two issue lookups (`/api/users/{userId}/issues`, `/api/users/username/{username}/issues`) need the Issue Service and come in Milestone 5.

### Sign up example

```http
POST /api/users
Content-Type: application/json

{ "name": "Alice Smith", "email": "alice@example.com", "password": "abc123",
  "profileImage": "https://example.com/alice.png", "role": "productOwner" }
```

```json
{
  "message": "Your account is created successfully",
  "loginUrl": "http://localhost:8081/api/users/login",
  "user": { "userId": 10, "name": "Alice Smith", "email": "alice@example.com",
            "role": "productOwner", "profileImage": "https://example.com/alice.png" }
}
```

### Error format

Every error has the same shape. `fieldErrors` appears only when validation fails.

```json
{
  "timestamp": "2026-10-02T12:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/users",
  "fieldErrors": { "email": "Email must be a valid email address" }
}
```

| Status | When |
|---|---|
| 400 | Invalid or missing fields, unknown role, malformed JSON, non-numeric ID |
| 401 | Wrong email or password at login |
| 404 | User ID doesn't exist |
| 409 | Email already registered |

## Design decisions / assumptions

- **Login uses email + password.** Email is unique, and the role stored on the account decides the dashboard (`/dashboard/project-owner` or `/dashboard/assignee`). The login screen in the brief also lists name, profile image and role; those come back in the response instead of being typed in.
- **Passwords are hashed with BCrypt** and never returned by the API.
- **Emails are stored lower-case and trimmed**, so `Alice@Example.com` and `alice@example.com` count as the same account.
- **Profile image is stored as a URL/path** (the `profile` column), not as an uploaded file.
- **Role** accepts `productOwner` or `assignee`. `PRODUCT_OWNER` and `product owner` are also accepted.
- **Update is partial**: only the fields present in the body change.
- **Authentication tokens (JWT) come later**, with the security requirement. For now, login checks the credentials and returns the user.

## Code layout

```
com.its.userservice
├── controller   UserController - REST endpoints, ResponseEntity everywhere
├── service      UserService + impl - business rules (uniqueness, hashing, partial update)
├── repository   UserRepository - Spring Data JPA
├── entity       User, Role (+ RoleConverter for the MySQL ENUM)
├── dto          request/response records with Bean Validation
├── exception    custom exceptions + GlobalExceptionHandler (@RestControllerAdvice)
└── config       BCrypt PasswordEncoder bean, Swagger metadata
```
