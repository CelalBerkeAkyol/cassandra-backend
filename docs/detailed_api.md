# Detailed Endpoint Documentation

if you want to summary of this project and routes on summary.md

## Auth Endpoints

### Register User

- POST /auth/register

```json
{
  "userName": "john_doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

### Login User

- POST /auth/login

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

### Logout User

- POST /auth/logout

Requires valid access token.

### Refresh Access Token

- **POST /auth/refresh-token**

  Requires valid refresh token.

### Verify Token

- **POST /auth/verify-token**

  Validates current access token.

### Admin Test

- **GET /auth/admin**

  Requires admin privileges.

---

## User Endpoints

### Get User by ID

- **GET /user/:id**

### Delete User by ID

- **DELETE /user/:id**

Requires admin privileges.

### List All Users

- **GET /user/**

Requires admin privileges.

### Delete All Users

- **DELETE /user/**

Requires admin privileges.

```json
{
  "delete_confirm": "DELETE ALL USER"
}
```

### Update User by Username

- **PUT /user/:username**

Requires admin privileges.

```json
{
  "role": "author",
  "bio": "Updated bio"
}
```

---

## Post Endpoints

### Get All Posts

- **GET /posts**
  Optional query params: `page`, `limit`

### Create New Post

- **POST /posts**

Requires admin privileges.

```json
{
  "title": "New Post",
  "content": "Post content",
  "category": "tech"
}
```

### Get Post by ID

- **GET /posts/one-post/:id**

### Update Post

- **PUT /posts/:id**

Requires admin privileges.

### Delete Post

- **DELETE /posts/:id**
  Requires admin privileges.

### Increment Post Views

- **PUT /posts/:id/view**

### Upvote Post

- **PUT /posts/:id/upvote**

### Downvote Post

- **PUT /posts/:id/downvote**

---

## Category Endpoints

### Get Posts by Category

- **GET /category/:category**

### Get All Categories

- **GET /category/all-categories**

---

## Image Endpoints

### List Images

- **GET /images**
  Optional query params: `page`, `limit`

### Upload Multiple Images

- **POST /images/multiple**
  Form data with multiple `image` files.

### Delete Image by ID

- **DELETE /images/:id**

---

## 6. Error Handling

| Status Code               | Meaning                 |
| ------------------------- | ----------------------- |
| 200 OK                    | Request successful      |
| 201 Created               | Resource created        |
| 400 Bad Request           | Invalid request data    |
| 401 Unauthorized          | Missing/invalid token   |
| 403 Forbidden             | Not authorized          |
| 404 Not Found             | Resource not found      |
| 500 Internal Server Error | Unexpected server error |

---

## 7. Additional Notes

- Tokens: 24-hour access tokens, 7-day refresh tokens.
- Admin routes: `/posts`, `/user` updates/deletes require admin role.
- Sanitization: Post content is sanitized to remove malicious HTML.
- Images: Stored locally under `uploads/`.
