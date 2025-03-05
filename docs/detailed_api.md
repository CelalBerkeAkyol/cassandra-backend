# Detailed Endpoint Documentation

If you want a summary of this project and routes, please check `summary.md`

---

## Auth Endpoints

### Register User

- **POST /auth/register**

#### Request Body

```json
{
  "userName": "john_doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

#### Success Response

```json
{
  "message": "User registered successfully",
  "user": "john@example.com"
}
```

### Login User

- **POST /auth/login**

#### Request Body

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

#### Success Response

```json
{
  "user": {
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "user",
    "username": "john_doe"
  },
  "message": "Login successful"
}
```

### Logout User

- **POST /auth/logout**

#### Description

Requires valid access token. Clears session cookies.

#### Success Response

```json
{
  "message": "Logout successful"
}
```

### Refresh Access Token

- **POST /auth/refresh-token**

#### Description

Requires valid refresh token.

#### Success Response

```json
{
  "message": "New Access Token created"
}
```

### Verify Token

- **POST /auth/verify-token**

#### Description

Validates current access token.

#### Success Response

```json
{
  "valid": true,
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "role": "user",
    "email": "john@example.com"
  }
}
```

### Admin Test

- **GET /auth/admin**

#### Description

Requires admin privileges.

#### Success Response

```
Welcome Admin! You have access.
```

---

## User Endpoints

### Get User by ID

- **GET /user/:id**

#### Success Response

```json
{
  "userName": "john_doe",
  "role": "user",
  "createdAt": "2025-03-05T12:34:56.789Z"
}
```

### Delete User by ID

- **DELETE /user/:id**

#### Description

Requires admin privileges.

#### Success Response

```
User has been deleted successfully
```

### List All Users

- **GET /user/**

#### Description

Requires admin privileges.

#### Success Response

```json
[
  {
    "userName": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
]
```

### Delete All Users

- **DELETE /user/**

#### Description

Requires admin privileges.

#### Request Body

```json
{
  "delete_confirm": "DELETE ALL USER"
}
```

#### Success Response

```json
{
  "success": true,
  "message": "All users deleted successfully"
}
```

### Update User by Username

- **PUT /user/:username**

#### Description

Requires admin privileges.

#### Request Body

```json
{
  "role": "author",
  "bio": "Updated bio"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "role": "author",
    "bio": "Updated bio"
  }
}
```

---

## Post Endpoints

### Get All Posts

- **GET /posts**

#### Optional Query Params

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 15)

#### Success Response

```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "pagination": { "next": { "page": 2, "limit": 15 } },
  "data": []
}
```

### Create New Post

- **POST /posts**

#### Description

Requires admin privileges.

#### Request Body

```json
{
  "title": "New Post",
  "content": "Post content",
  "category": "tech"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "title": "New Post",
    "content": "Post content",
    "category": "tech"
  }
}
```

### Get Post by ID

- **GET /posts/one-post/:id**

#### Success Response

```json
{
  "success": true,
  "post": {
    "title": "Sample Post",
    "content": "This is content",
    "author": "john_doe"
  }
}
```

### Update Post

- **PUT /posts/:id**

#### Description

Requires admin privileges.

#### Success Response

```json
{
  "success": true,
  "data": {}
}
```

### Delete Post

- **DELETE /posts/:id**

#### Description

Requires admin privileges.

#### Success Response

```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

### Increment Post Views

- **PUT /posts/:id/view**

#### Success Response

```json
{
  "success": true,
  "data": {}
}
```

### Upvote Post

- **PUT /posts/:id/upvote**

#### Success Response

```json
{
  "success": true,
  "data": {}
}
```

### Downvote Post

- **PUT /posts/:id/downvote**

#### Success Response

```json
{
  "success": true,
  "data": {}
}
```

---

## Category Endpoints

### Get Posts by Category

- **GET /category/:category**

#### Success Response

```json
{
  "success": true,
  "posts": []
}
```

### Get All Categories

- **GET /category/all-categories**

#### Success Response

```json
{
  "success": true,
  "allCategory": ["tech", "finance"]
}
```

---

## Image Endpoints

### List Images

- **GET /images**

#### Optional Query Params

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 9)

#### Success Response

```json
{
  "images": [],
  "page": 1,
  "totalPages": 5
}
```

### Upload Multiple Images

- **POST /images/multiple**

#### Description

Form data with multiple `image` files.

#### Success Response

```json
{
  "message": "Images uploaded successfully",
  "images": []
}
```

### Delete Image by ID

- **DELETE /images/:id**

#### Success Response

```json
{
  "message": "Image deleted successfully"
}
```

---

## Error Handling

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

## Additional Notes

- Tokens: 24-hour access tokens, 7-day refresh tokens.
- Admin routes: `/posts`, `/user` updates/deletes require admin role.
- Sanitization: Post content is sanitized to remove malicious HTML.
- Images: Stored locally under `uploads/`.
