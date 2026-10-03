# Eureka Server

Milestone 4 of the Issue Tracking System: the **service registry**. Every microservice registers itself here on startup. The services (and, in Milestone 7, the API Gateway) can then find each other by **name**, for example `PROJECT-SERVICE`, instead of a hard-coded `localhost:8082`.

| | |
|---|---|
| Port | `8761` |
| Dashboard | http://localhost:8761 |
| Database | none |

## Run it in Spring Tool Suite (STS)

1. **Import**: *File → Import… → Maven → Existing Maven Projects*. Select the `PublicWeak3` folder and tick `eureka-server`.
2. **Start it first**: right-click `EurekaServerApplication.java` → *Run As → Spring Boot App*, or use the Boot Dashboard. The console should end with `Tomcat started on port 8761`.
3. **Then start the services**: `user-service`, `project-service` and `issue-service`, in any order.
4. Open http://localhost:8761. Under **"Instances currently registered with Eureka"** you should see:

   | Application | Status |
   |---|---|
   | ISSUE-SERVICE | UP (1) |
   | PROJECT-SERVICE | UP (1) |
   | USER-SERVICE | UP (1) |

   A service can take up to about 30 seconds to appear after it starts.

5. Take a screenshot of this page for the project README / review.

## Creating it with the STS wizard instead

*File → New → Spring Starter Project*: Spring Boot **3.5.x**, Java 17, and the dependencies **Eureka Server** and **Spring Boot DevTools**. Then:

- add `@EnableEurekaServer` to the main class (see `EurekaServerApplication.java`);
- copy `src/main/resources/application.properties` from this folder.

## How the services register

The three services were changed in this milestone (see their `pom.xml` and `application.properties`):

- **pom.xml**: dependency `spring-cloud-starter-netflix-eureka-client`, plus the `spring-cloud-dependencies` BOM (version `2025.0.0`, which matches Spring Boot 3.5.x). In the STS wizard this dependency is called **Eureka Discovery Client**.
- **application.properties**:
  ```properties
  eureka.client.service-url.defaultZone=${EUREKA_URL:http://localhost:8761/eureka/}
  eureka.instance.prefer-ip-address=true
  ```

No annotation is needed on the services' main classes: with the Eureka client on the classpath, Spring Cloud registers the service automatically, using `spring.application.name` as its name. (`@EnableEurekaClient` no longer exists in current Spring Cloud. `@EnableDiscoveryClient` is optional.)

## Good to know

- **If Eureka isn't running**, the services still start and work. Their consoles just log connection errors every 30 seconds until Eureka comes up, and then they register.
- **Self-preservation is switched off** (development setting), so a stopped service disappears from the dashboard after a short while instead of staying listed.
- `eureka.instance.prefer-ip-address=true` registers services by IP address rather than computer name, which avoids hostname problems on Windows.
