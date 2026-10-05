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

## Testing client-side load balancing

Every service adds a response header **`X-Served-By`** (for example `user-service:8091`) and logs `user-service:8091 handled GET /api/users`. That shows which instance answered each request.

1. Start everything as usual: Eureka → the three services → gateway.
2. **Start a second user-service on port 8091.** In STS: *Run → Run Configurations… → Spring Boot App*, right-click the user-service configuration → *Duplicate*. In the copy, on the *Spring Boot* tab under *Override properties*, add `server.port` = `8091`. Click *Run*.
3. Open http://localhost:8761. You should see **USER-SERVICE: UP (2)**, with entries ending in `:8081` and `:8091`.
4. **Wait about 1 minute.** The gateway refreshes its list of instances every ~30 seconds.
5. Call `http://localhost:8080/api/users` several times, in Postman or the browser. In Postman's response **Headers** tab, `X-Served-By` alternates: `user-service:8081`, `user-service:8091`, `user-service:8081`, …
   - Quicker: run *Load balancing check* in `postman/api-gateway.postman_collection.json` with the Collection Runner, *Iterations: 10*. The Postman Console (*View → Show Postman Console*) prints `Served by: …` for each call.
6. **Failover:** stop the 8091 instance. Within ~30–60 seconds every request is served by 8081 (a few may fail during that window).

Inter-service calls are balanced the same way. Run a second `issue-service` with `server.port` = `8093`, then call `http://localhost:8080/api/users/2/issues` several times. The issue-service consoles take turns logging `issue-service:8083 handled GET /api/issues/assignee/2` and `issue-service:8093 handled …`. (Feign's own response header isn't passed back to the client, so watch the consoles here.)

## When a service is down

If no instance of a service is registered, the gateway answers **503 Service Unavailable** for that service's paths. The other services keep working through the gateway.

## Why routes are in Java, not application.properties

Spring Cloud Gateway is moving its route properties to a new prefix (`spring.cloud.gateway.server.webflux.routes…` instead of `spring.cloud.gateway.routes…`), and the right one depends on the version. The Java `RouteLocatorBuilder` works the same in both, so the routes can't silently stop matching after an upgrade.
