# RR Technosoft LMS

**Developed by [Purandhar Achari Banthi Katla](https://www.linkedin.com/in/purandhar-achari-banthi-katla-726a73265)** · [purandharacharibanthikatla@gmail.com](mailto:purandharacharibanthikatla@gmail.com) · [LinkedIn](https://www.linkedin.com/in/purandhar-achari-banthi-katla-726a73265)

Enterprise Learning Management System — Spring Boot 3.3 (Java 21) backend, Next.js 15 (TypeScript) frontend, PostgreSQL 16, Redis 7. Covers course delivery, assignments/quizzes, attendance & live classes, certificates, placements, a coding practice portal, finance/fee collection (Razorpay), reports & analytics, platform administration, and a searchable audit log.

> **Read this before deploying.** This README is written to be accurate, not aspirational — see [Project Status](#project-status) for exactly what's done, what's partial, and what's still open. Every DevOps asset below (Docker, Compose, Kubernetes, Jenkins, Prometheus/Grafana, backups) is included and was reviewed for internal consistency, but **none of it has been run in this environment** (no network access, no Maven installed in the sandbox that built it). Run a real `mvn verify` and `npm run build` before you trust it in production.

---

## Table of contents

1. [Architecture](#architecture)
2. [Project status](#project-status)
3. [Local setup](#local-setup)
4. [Running with Docker Compose](#running-with-docker-compose)
5. [Testing guide](#testing-guide)
6. [CI/CD (Jenkins)](#cicd-jenkins)
7. [Kubernetes deployment](#kubernetes-deployment)
8. [Monitoring (Prometheus + Grafana)](#monitoring-prometheus--grafana)
9. [Security features](#security-features)
10. [Backup & recovery](#backup--recovery)
11. [API documentation](#api-documentation)
12. [Troubleshooting](#troubleshooting)
13. [Contributing](#contributing)
14. [Author](#author)

---

## Architecture

```
                        ┌─────────────────────┐
                        │   Next.js Frontend   │  (App Router, TS, Tailwind, shadcn/ui)
                        │   rr-technosoft-lms/ │
                        └──────────┬───────────┘
                                   │ REST (axios) — Bearer JWT
                                   ▼
                        ┌─────────────────────┐
                        │  Spring Boot Backend │  (Java 21, /api/v1)
                        │      backend/        │
                        └──┬────────┬──────────┘
                           │        │
                 ┌─────────▼──┐  ┌──▼───────┐
                 │ PostgreSQL │  │  Redis   │  (master data / feature-toggle cache)
                 │  (Flyway)  │  │          │
                 └────────────┘  └──────────┘

           Cross-cutting: Spring Security (JWT, RBAC), Actuator + Micrometer
           (→ Prometheus → Grafana), searchable audit log, Razorpay webhook,
           optional S3 for uploads, SMTP + WhatsApp (Twilio) notifications.
```

**Backend** (`backend/`) — layered `controller → service → repository` architecture, one Flyway migration per schema change (`V1`–`V16`), DTOs for every request/response (no entities leaked over the wire), `@PreAuthorize`-based authorization at the method level backed by coarse URL rules in `SecurityConfig`. 32 REST controllers, 42 services, 78 JPA entities.

**Frontend** (`rr-technosoft-lms/`) — Next.js App Router with route groups for `(admin)`, `(auth)`, and `(student)` layouts, a typed API client per domain under `src/lib/api/`, Zustand for auth state, React Hook Form + Zod for validated forms, shadcn/ui (Radix primitives) for the component layer. 63 pages, all backed by the real API layer — no mock data remains in the page components.

**Modules**: Auth/RBAC, Course Catalog & Lessons, Enrollments & Progress, Assignments, Quizzes, Attendance, Live Classes, Certificates, Placements (companies, job drives, applications, interview scheduling), Learning Resources, Video Library, Notifications (email/WhatsApp), Practice/Coding Portal, Finance (fee structures, installments, discounts, fines, Razorpay payments, refunds, receipts), Reports & Analytics (dashboard KPIs, Excel/PDF export), Administration (org profile, feature toggles, master data, permission matrix, security settings, backup config), and Audit Log History.

---

## Project status

Read this section before assuming any given piece is "done." It reflects the actual state of the code, not the original request.

| Area | Status | Notes |
|---|---|---|
| Backend compiles | **Not verified in this environment** | No network/Maven in the sandbox that built this. Static import/class-resolution checks pass (no unresolved `com.rrtechnosoft.*` references, no duplicate classes). Run `mvn clean compile` yourself first. |
| Frontend builds | **Not verified in this environment** | Same constraint — no `npm install` was possible. Static `@/...` import resolution passes across all 164 TS/TSX files; `tsconfig.json`/`package.json` are valid. Run `npm run build` yourself first. |
| Frontend ↔ API wiring | **Done** | 56+ of 63 pages call the real `@/lib/api/*` client layer; the remainder are thin wrappers around already-wired form components, or pages that legitimately don't need server data (login, forgot-password). |
| Audit logging | **Done** | 28 services already wrote to `audit_logs`; this pass added the missing read side — a filterable, paginated search API (`GET /administration/audit-logs`) and an admin UI screen at `/admin/settings/audit-logs`. |
| Automated tests | **Partial** | 13 backend test classes (12 unit + 1 Testcontainers-backed integration test) against 42 services. 4 frontend Jest/RTL test files. 1 Playwright E2E spec (login flow). This is a start, not comprehensive coverage — treat "add tests for the rest" as the top remaining backlog item. |
| Controller ↔ service coverage | **Verified, one gap closed** | Cross-checked every `*Service.java` against every controller and every frontend `API_ROUTES` entry against every `@RequestMapping` base path. Found and fixed two real gaps: `DailyTaskService`/repository/DTOs were fully implemented with a working frontend page calling `/daily-tasks`, but no `DailyTaskController` existed — added it, reusing the existing service as-is. `PlacementApplicationService.attachResume()` (S3 upload + audit log) was implemented but had no route or frontend upload control — added the endpoint (`POST /placements/applications/{id}/resume`) and wired the student placement detail page to it, following the exact FormData pattern already used for learning-resource/video uploads. No other service was found unreachable from a controller, and no frontend `API_ROUTES` entry was found without a matching backend mapping. |
| CI/CD | **Done (unverified)** | `Jenkinsfile` covers build → unit test → integration test → lint/typecheck → frontend test → E2E → Docker build/push → staging deploy → manual-approval production deploy. Never run against a real Jenkins controller. |
| Containerization | **Done** | Multi-stage `Dockerfile` for both services (non-root users, `-XX:MaxRAMPercentage` tuning on the backend, Next.js `standalone` output on the frontend); `docker-compose.yml` (app stack) + `docker-compose.monitoring.yml` (optional Prometheus/Grafana overlay). |
| Kubernetes | **Done (unverified)** | `k8s/base` (Kustomize) with Deployments, Services, HPA, Ingress, ConfigMap, a backup CronJob, and a `secret.example.yaml` documenting required keys; `k8s/overlays/{staging,production}` for environment-specific namespaces. Never applied to a real cluster. |
| Monitoring | **Done** | Actuator + `micrometer-registry-prometheus` (this dependency was missing before this pass — `/actuator/prometheus` would have 404'd), readiness/liveness probe groups, Prometheus scrape config + 5 alert rules, a provisioned Grafana dashboard (latency percentiles, error rate, JVM heap, CPU). |
| Caching | **Done** | Redis was a running, unused container before this pass. Now backs `@Cacheable` master-data and feature-toggle lookups with sensible TTLs. |
| Backup & recovery | **Done** | In-app scheduled backups now actually read the configurable cron/retention that the admin UI always exposed but nothing enforced (`BackupScheduler`), plus standalone POSIX `scripts/backup.sh` / `scripts/restore.sh` for disaster recovery independent of the running app, plus a Kubernetes CronJob wired to the same script via a generated ConfigMap. |
| Security hardening | **Ongoing** | BCrypt(12), JWT rotation, account lockout, RBAC at both URL and method level, Razorpay webhook HMAC verification, CORS allow-list. Not independently penetration-tested. |
| Documentation | **This README** | Consolidates what were previously two thin per-service READMEs plus a merge report. |

**Known limitations carried over from the original merge** (see `MERGE_REPORT.md` for full history): the Practice Portal, AI chatbot, and Daily Tasks features have database schema and some backend groundwork but were flagged as "not yet built" in the original Phase 1 handoff — verify their actual completeness against `MERGE_REPORT.md §7` before assuming they're live.

---

## Local setup

### Prerequisites
- Java 21, Maven 3.9+
- Node.js 20+, npm
- PostgreSQL 16 and Redis 7 (or use Docker Compose for these — see below)

### Backend
```bash
cd backend
cp .env.example .env    # if present; otherwise export the vars docker-compose.yml lists
mvn clean compile
mvn spring-boot:run
# API base path: http://localhost:8080/api/v1
# Swagger UI:    http://localhost:8080/api/v1/docs/swagger-ui.html
```
On first run with `SEED_DATA=true` (default), a Super Admin account is created using `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`.

### Frontend
```bash
cd rr-technosoft-lms
npm install
cp .env.example .env.local
npm run dev
# http://localhost:3000
```

---

## Running with Docker Compose

```bash
cp .env.example .env        # fill in the REQUIRED values (DB_PASSWORD, JWT_SECRET, SUPER_ADMIN_PASSWORD, GRAFANA_ADMIN_PASSWORD)
docker compose up -d                                          # app stack: postgres, redis, backend, frontend
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d   # + prometheus, grafana
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/api/v1/docs/swagger-ui.html |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |

---

## Testing guide

### Backend
```bash
cd backend
mvn test                          # unit tests only (JUnit 5 + Mockito), excludes *IT classes
mvn verify -Pintegration-test     # Testcontainers-backed *IT classes (needs Docker on the runner)
```
JaCoCo produces a coverage report under `target/site/jacoco/` after `mvn test`.

**Pattern for new tests**: unit tests mock every repository dependency with Mockito (see `AuditLogServiceTest.java` for the current reference example — mocks the repo, asserts on the mapped response, no Spring context). Integration tests spin up real Postgres + Redis via Testcontainers and hit the app over HTTP with REST Assured (see `AuthControllerIT.java`) — no mocks, real Flyway migrations, real seeded data.

### Frontend
```bash
cd rr-technosoft-lms
npm run test              # Jest + React Testing Library
npm run test:coverage     # with coverage report
npm run e2e                # Playwright E2E (starts the dev server automatically outside CI)
```

---

## CI/CD (Jenkins)

`Jenkinsfile` at the repo root. Stages: checkout → backend build/unit-test → backend integration-test (Testcontainers, needs Docker-in-Docker on the agent) → backend package → frontend install/lint/typecheck → frontend unit tests → frontend build → frontend E2E (main/develop only) → Docker image build → Docker image push → deploy to staging (`develop` branch) → manual-approval gate → deploy to production (`v*` tags).

**Required Jenkins credentials**: `docker-registry-creds` (username/password), `kubeconfig-staging`, `kubeconfig-production` (secret files), optionally `sonarqube-token`.
**Required plugins**: Pipeline, Docker Pipeline, Kubernetes CLI, JUnit, HTML Publisher, (optional) Slack Notification.

This pipeline has not been run against a live Jenkins controller — validate credential IDs and agent capabilities (Docker socket access for Testcontainers) against your actual infrastructure before relying on it.

---

## Kubernetes deployment

```bash
kubectl create namespace rr-lms-staging
kubectl -n rr-lms-staging create secret generic lms-backend-secrets --from-env-file=.env
kubectl -n rr-lms-staging create secret generic lms-db-secrets \
  --from-literal=POSTGRES_DB=rr_lms --from-literal=POSTGRES_USER=lms_user --from-literal=POSTGRES_PASSWORD=<...>

kubectl apply -k k8s/overlays/staging      # or overlays/production
```

`k8s/base/` contains: `deployment.yaml` (backend + frontend, rolling updates, resource requests/limits, readiness/liveness/startup probes wired to Actuator's `/actuator/health/{readiness,liveness}` groups), `data-stores.yaml`, `configmap.yaml`, `hpa.yaml`, `ingress.yaml`, `backup-cronjob.yaml` (daily Postgres dump via a Kustomize-generated ConfigMap running `scripts/backup.sh`), and `secret.example.yaml` documenting every required secret key without committing real values. `k8s/overlays/{staging,production}` layer namespace and environment-specific patches via Kustomize.

Never applied to a real cluster in this pass — dry-run (`kubectl apply -k ... --dry-run=client`) before a first real rollout.

---

## Monitoring (Prometheus + Grafana)

- Backend exposes `/actuator/prometheus` (Micrometer's Prometheus registry — this dependency was missing before this pass and would have made the endpoint 404 despite being listed in `management.endpoints.web.exposure.include`).
- `monitoring/prometheus/prometheus.yml` scrapes the backend every 15s; `monitoring/prometheus/alert.rules.yml` defines 5 alerts: `BackendDown`, `HighErrorRate` (>5% 5xx over 5m), `HighP99Latency` (>2s), `JvmHeapNearLimit` (>90%), `DiskSpaceLow` (<10%).
- `monitoring/grafana/provisioning/` auto-provisions the Prometheus datasource and a "Backend Overview" dashboard (request rate, p50/p95/p99 latency, error rate, JVM heap, CPU) on Grafana startup — no manual dashboard import needed.
- Health probe groups (`management.health.readinessstate`/`livenessstate`, `management.health.db`/`redis`) back the Kubernetes probes above.

---

## Security features

- **Authentication**: stateless JWT access tokens (15 min default) + rotating opaque refresh tokens (7 days default, stored only as SHA-256 hashes, revocable).
- **Authorization**: three roles (`SUPER_ADMIN` — capped at 1 by a DB partial unique index, `ADMIN` — capped at 10, `STUDENT`), enforced at both the URL level (`SecurityConfig`) and the method level (`@PreAuthorize`) so a gap in one layer doesn't silently open access.
- **Password storage**: BCrypt, strength 12.
- **Account lockout**: configurable max failed attempts / lockout duration (Security Settings admin screen), enforced server-side.
- **Payment webhook security**: Razorpay webhook signature verified via HMAC against the raw request body before anything is trusted (`PaymentController`/`PaymentService`) — the only unauthenticated write path in the system, and it's cryptographically gated rather than open.
- **CORS**: explicit origin allow-list (`CORS_ORIGINS`), not a wildcard.
- **Audit trail**: every sensitive action (auth events, admin/student lifecycle changes, course/content mutations, finance actions, backup runs) is written to `audit_logs` with actor, action, entity, IP, and timestamp — searchable via `/administration/audit-logs` (SUPER_ADMIN only).
- **Secrets**: never committed — `.env.example` documents every key without values, `k8s/base/secret.example.yaml` does the same for Kubernetes.

---

## Backup & recovery

Two independent mechanisms, deliberately not dependent on each other:

1. **In-app scheduler** (`BackupScheduler`) — reads the cron expression and retention window from the Administration → Backup & Restore screen (previously stored but never actually read by anything) and triggers backups / prunes expired runs automatically once enabled.
2. **Standalone scripts** (`scripts/backup.sh`, `scripts/restore.sh`) — POSIX `/bin/sh`, no bashisms, so they run unmodified inside a minimal `postgres:16-alpine` container. Work independently of whether the Spring Boot app is even running — the point of disaster recovery. `restore.sh` requires typing the database name to confirm (or `--yes` for scripted/CI use) since it drops and recreates the schema before restoring.

```bash
# Manual backup
DB_HOST=localhost DB_NAME=rr_lms DB_USER=lms_user DB_PASSWORD=... ./scripts/backup.sh

# Restore
DB_HOST=localhost DB_NAME=rr_lms DB_USER=lms_user DB_PASSWORD=... ./scripts/restore.sh /var/backups/rr-lms/rr-lms-backup-20260802-030000.sql.gz
```

In Kubernetes, `k8s/base/backup-cronjob.yaml` runs `scripts/backup.sh` daily against a `PersistentVolumeClaim`, sourcing DB credentials from the same `lms-db-secrets` Secret as the app.

---

## API documentation

Swagger/OpenAPI UI is served at `/api/v1/docs/swagger-ui.html` when the backend is running (raw spec at `/api/v1/docs/api-docs`). This is generated from the actual controller annotations, so it stays in sync with the code — treat it as the source of truth over any static doc.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Backend won't start: `SUPER_ADMIN_PASSWORD` / `DB_PASSWORD` / `JWT_SECRET` error | A required env var wasn't set | Check `.env.example` — every `REQUIRED` variable there has no safe default. |
| `/actuator/prometheus` returns 404 | Missing `micrometer-registry-prometheus` on the classpath | Already fixed in this pass — confirm it's still present in `backend/pom.xml`. |
| Prometheus target shows `environment` label as a literal `${...}` string | Prometheus's own config file doesn't expand shell-style `${VAR}` (docker-compose does, Prometheus doesn't) | Generate `prometheus.yml` from a template at deploy time (e.g. `envsubst` in CI) if you need per-environment labels, or hardcode per overlay. |
| Radix UI components (`Select`, `Dialog`, etc.) throw in Jest tests | jsdom doesn't implement `matchMedia`/`ResizeObserver` | Already polyfilled in `jest.setup.ts` — make sure new test files don't bypass it. |
| Integration tests hang or fail to start containers | Docker not available / no socket access on the CI agent | Testcontainers needs a working Docker daemon; Jenkins agents need Docker-in-Docker or a mounted socket. |
| Flyway migration checksum mismatch on deploy | An already-applied migration file was edited after the fact | Never edit a shipped `V*.sql` file — add a new `V{n+1}__*.sql` migration instead. |
| Backup CronJob's ConfigMap doesn't match `scripts/backup.sh` | `kustomization.yaml`'s `configMapGenerator` re-hashes on every script change (unless `disableNameSuffixHash` is set, which it is here) | Re-apply the Kustomize overlay after any script edit: `kubectl apply -k k8s/overlays/<env>`. |

---

## Contributing

1. Branch from `develop`, not `main`.
2. Every new migration is a new `V{n+1}__description.sql` file — never edit a shipped one.
3. New backend service logic needs a matching unit test (Mockito-mocked dependencies, no Spring context — fast). New end-to-end flows that must be verified against a real database belong in `src/test/java/.../integration/*IT.java` instead.
4. New frontend components that carry real logic (not pure layout) get a Jest/RTL test under `__tests__/`.
5. Run `mvn test` and `npm run test` locally before opening a PR — the Jenkins pipeline will re-run both plus integration/E2E tests, but catching failures locally is faster.
6. Keep `SecurityConfig` changes small and explicit — it's the one file in this codebase where a mistake has real security consequences (see the inline comments there for the reasoning behind the current rule set).

---

## Author

**Purandhar Achari Banthi Katla**
Email: [purandharacharibanthikatla@gmail.com](mailto:purandharacharibanthikatla@gmail.com)
LinkedIn: [www.linkedin.com/in/purandhar-achari-banthi-katla-726a73265](https://www.linkedin.com/in/purandhar-achari-banthi-katla-726a73265)
GitHub: [github.com/PurandharAchariBanthikatla](https://github.com/PurandharAchariBanthikatla)

---

## License

MIT — see `LICENSE`.
