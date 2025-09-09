# MOH Intranet API Routes

This package sets up all API routes for the **MOH Intranet backend** using **Fiber**.

---

## Table of Contents

- [Setup](#setup)
- [Middleware](#middleware)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Partners](#partners)
  - [Thematic Areas](#thematic-areas)
  - [Partner Categories](#partner-categories)
  - [Internal Groups](#internal-groups)
  - [Emails](#emails)
  - [Contacts](#contacts)
  - [API Tokens](#api-tokens)

---

## Setup

Import the `routes` package and call `SetupRoutes(app)` in your main application:

```go
import (
    "github.com/gofiber/fiber/v2"
    "moh-intranet.com/routes"
)

func main() {
    app := fiber.New()
    routes.SetupRoutes(app)
    app.Listen(":7088")
}
```

---

## Middleware

All routes are protected by the `AuthMiddleware`:

```go
app.Use(middleware.AuthMiddleware())
```

Static frontend files are served from:

```go
app.Static("/", "./frontend")
```

---

## API Endpoints

### Authentication

| Method | Endpoint                  | Description            |
| ------ | ------------------------- | ---------------------- |
| POST   | `/api/v1/signin`          | User login             |
| POST   | `/api/v1/forgot-password` | Request password reset |
| PUT    | `/api/v1/reset-password`  | Reset password         |
| POST   | `/api/v1/validate-token`  | Validate JWT token     |

---

### Users

| Method | Endpoint                            | Description              |
| ------ | ----------------------------------- | ------------------------ |
| POST   | `/api/v1/users/register`            | Register new user        |
| GET    | `/api/v1/users`                     | Get all users            |
| GET    | `/api/v1/users/:uuid`               | Get user by UUID         |
| PUT    | `/api/v1/users/change-password`     | Change user password     |
| PUT    | `/api/v1/users/change-scope`        | Change user scope        |
| PUT    | `/api/v1/users/change-status/:uuid` | Activate/deactivate user |
| POST   | `/api/v1/users/set-password`        | Set a new password       |

---

### Partners

| Method | Endpoint                             | Description                           |
| ------ | ------------------------------------ | ------------------------------------- |
| POST   | `/api/v1/partners`                   | Create partner (supports file upload) |
| GET    | `/api/v1/partners`                   | Get all partners                      |
| GET    | `/api/v1/partners/support-documents` | Get partner support documents         |
| GET    | `/api/v1/partners/:uuid`             | Get partner by UUID                   |
| PUT    | `/api/v1/partners/:uuid`             | Update partner by UUID                |
| PUT    | `/api/v1/partners/contact/:id`       | Update partner contact                |
| DELETE | `/api/v1/partners/:uuid`             | Delete partner by UUID                |

---

### Thematic Areas

| Method | Endpoint                      | Description                |
| ------ | ----------------------------- | -------------------------- |
| POST   | `/api/v1/thematic-areas`      | Create thematic area       |
| POST   | `/api/v1/thematic-areas/bulk` | Bulk create thematic areas |
| DELETE | `/api/v1/thematic-areas/:id`  | Delete thematic area       |

---

### Partner Categories

| Method | Endpoint                          | Description                    |
| ------ | --------------------------------- | ------------------------------ |
| POST   | `/api/v1/partner-categories`      | Create partner category        |
| POST   | `/api/v1/partner-categories/bulk` | Bulk create partner categories |
| DELETE | `/api/v1/partner-categories/:id`  | Delete partner category        |

---

### Internal Groups

| Method | Endpoint                        | Description                   |
| ------ | ------------------------------- | ----------------------------- |
| POST   | `/api/v1/internal-groups`       | Create internal group         |
| GET    | `/api/v1/internal-groups`       | List internal groups          |
| GET    | `/api/v1/internal-groups/:uuid` | Get internal group by UUID    |
| PUT    | `/api/v1/internal-groups/:uuid` | Update internal group by UUID |
| DELETE | `/api/v1/internal-groups/:uuid` | Delete internal group by UUID |

---

### Emails

| Method | Endpoint             | Description        |
| ------ | -------------------- | ------------------ |
| POST   | `/api/v1/emails`     | Create email       |
| GET    | `/api/v1/emails`     | Get all emails     |
| GET    | `/api/v1/emails/:id` | Get email by ID    |
| PUT    | `/api/v1/emails/:id` | Update email by ID |
| DELETE | `/api/v1/emails/:id` | Delete email by ID |

---

### Contacts

| Method | Endpoint           | Description    |
| ------ | ------------------ | -------------- |
| POST   | `/api/v1/contacts` | Create contact |
| PUT    | `/api/v1/contacts` | Update contact |

---

### API Tokens

| Method | Endpoint             | Description      |
| ------ | -------------------- | ---------------- |
| POST   | `/api/v1/tokens`     | Create API token |
| GET    | `/api/v1/tokens`     | List API tokens  |
| DELETE | `/api/v1/tokens/:id` | Delete API token |
