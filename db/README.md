# Database setup

Each microservice owns its own MySQL database, so services stay loosely coupled:

| Script | Database | Tables | Used by |
|---|---|---|---|
| `01_user_db.sql` | `user_db` | `users` | user-service |
| `02_project_db.sql` | `project_db` | `projects` | project-service |
| `03_issue_db.sql` | `issue_db` | `issues`, `comments` | issue-service |

Each script creates its database (if missing), recreates its tables and loads the sample data from the reference sheet. Running a script again **resets that database to the sample data**.

## Run the scripts

Requires MySQL 8.0.16 or later (for `CHECK` constraints).

**Terminal**

```bash
mysql -u root -p < db/01_user_db.sql
mysql -u root -p < db/02_project_db.sql
mysql -u root -p < db/03_issue_db.sql
```

**MySQL Workbench:** open each file (File → Open SQL Script) and run it with the lightning-bolt button.

## Check it worked

```sql
SELECT COUNT(*) FROM user_db.users;        -- 9
SELECT COUNT(*) FROM project_db.projects;  -- 5
SELECT COUNT(*) FROM issue_db.issues;      -- 9
```

## Design notes

- **Column names are snake_case** (`user_id`, `project_name`, `created_on`), which matches the ER diagram and Spring Boot's default JPA naming (a Java field `projectName` maps to column `project_name`).
- **No foreign keys across databases.** `projects.product_owner`, `issues.project`, `issues.assignee` and `issues.created_by` point to rows owned by other services. The services check these IDs by calling each other's APIs, not through MySQL constraints. `comments.issue_id` is a real foreign key because both tables live in `issue_db`.
- **Passwords are BCrypt hashes.** The sample passwords from the sheet (`abc123`, `def456`, …) still work for login; each one is noted in a comment next to its row.
- **Sample data is kept as given**, including two inconsistencies to discuss in review:
  - issue 207 is assigned to user 10, who doesn't exist;
  - some project owners (users 2, 3, 5) have the `assignee` role, and some issues are assigned to `productOwner` users (6, 8).
