# API Gateway

Milestone 7 of the Issue Tracking System: the **single entry point** for all clients. Every request goes to port **8080**. The gateway forwards it to the right service based on the URL path, finding the service in Eureka and spreading requests across instances (**client-side load balancing**).

| | |
|---|---|
| Port | `8080` |
| Routes | [`config/GatewayRoutesConfig.java`](src/main/java/com/its/apigateway/config/GatewayRoutesConfig.java) |
| Postman | [`postman/api-gateway.postman_collection.json`](../postman/api-gateway.postman_collection.json) |
| Database | none |

## Routes

| Request path | Forwarded to | Service port |
|---|---|---|
| `/api/users/**` | `lb://user-service` | 8081 |
| `/api/projects/**` | `lb://project-service` | 8082 |
| `/api/issues/**` | `lb://issue-service` | 8083 |

`lb://` means "look the service up in Eureka by name and let Spring Cloud LoadBalancer choose an instance". The path isn't changed, so `http://localhost:8080/api/users/2/issues` goes to `user-service` as `/api/users/2/issues`.

## Run it in Spring Tool Suite (STS)

1. **Import**: *File → Import… → Maven → Existing Maven Projects*. Select the `PublicWeak3` folder and tick `api-gateway`.
2. **Start in this order**: `eureka-server` → `user-service`, `project-service`, `issue-service` → `api-gateway`.
3. Check http://localhost:8761. **API-GATEWAY** should be listed alongside the three services.
4. Call any endpoint through port 8080, for example:
   - http://localhost:8080/api/users
   - http://localhost:8080/api/projects/101/issues
   - http://localhost:8080/api/issues/owner/1

   Or run `postman/api-gateway.postman_collection.json`, which has every request from the other collections pointed at the gateway.

## Creating it with the STS wizard instead

*File → New → Spring Starter Project*: Spring Boot **3.5.x**, Java 17, and the dependencies:

| Wizard name | Artifact |
|---|---|
| **Reactive Gateway** | `spring-cloud-starter-gateway-server-webflux` |
| **Eureka Discovery Client** | `spring-cloud-starter-netflix-eureka-client` |
| **Spring Boot DevTools** | `spring-boot-devtools` |

Don't add **Spring Web**: the gateway runs on WebFlux, and Spring Web would conflict with it. Then copy `GatewayRoutesConfig.java` and `application.properties` from this folder.

## Showing client-side load balancing

1. In STS, right-click `user-service` → *Run As → Run Configurations…* → select its Spring Boot configuration → *Duplicate*.
2. In the copy, on the *Arguments* tab, add the program argument `--server.port=8091` and click *Run*.
3. The Eureka dashboard now shows **USER-SERVICE (2)**: one instance on 8081, one on 8091.
4. Call `http://localhost:8080/api/users` several times. The requests alternate between the two instances, which you can see in each instance's console (Hibernate logs a query for each request if you set `spring.jpa.show-sql=true`).
5. Stop one instance. After Eureka notices (up to about 30 seconds), all requests go to the remaining one.

## When a service is down

If no instance of a service is registered, the gateway answers **503 Service Unavailable** for that service's paths. The other services keep working through the gateway.

## Why routes are in Java, not application.properties

Spring Cloud Gateway is moving its route properties to a new prefix (`spring.cloud.gateway.server.webflux.routes…` instead of `spring.cloud.gateway.routes…`), and the right one depends on the version. The Java `RouteLocatorBuilder` works the same in both, so the routes can't silently stop matching after an upgrade.
