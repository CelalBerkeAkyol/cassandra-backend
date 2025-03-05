# API Documentation for Blogging Platform

## 1. API Overview

This API provides endpoints for a blogging platform with user management, authentication, post creation, image uploads, and category-based content retrieval. Key features include:

- **User management** (registration, listing, deletion, etc.)
- **Authentication** using JSON Web Tokens (JWT) and cookies
- **Post management** (create, read, update, delete)
- **Image upload** and listing
- **Category-based post queries**
- **Admin privileges** for certain routes

---

## 2. Authorization Details

The API uses **JWT tokens** (access and refresh tokens) stored primarily as **HTTP-only cookies**. Some endpoints require the user to have an **admin role** to perform specific actions (e.g., deleting other users or creating posts).

- **Access Token**: Expires in 24 hours. Sent as a cookie named `token`.
- **Refresh Token**: Expires in 7 days. Sent as a cookie named `refreshToken`.

### How to Include the Token

- **Cookies**: Sent automatically if `credentials: include` is set in the frontend.
- **Authorization Header**: Alternatively, send as:
  ```
  Authorization: Bearer <token>
  ```

---

## 3. Base URL

```
https://localhost:5173/blog
```

---

## 4. Endpoint Summary

### 4.1 Auth Endpoints

| Method | Endpoint            | Description           | Auth Required | Admin Only |
| ------ | ------------------- | --------------------- | ------------- | ---------- |
| POST   | /auth/register      | Register new user     | No            | No         |
| POST   | /auth/login         | Log in and get tokens | No            | No         |
| POST   | /auth/logout        | Log out user          | Yes           | No         |
| POST   | /auth/refresh-token | Get new access token  | Yes           | No         |
| POST   | /auth/verify-token  | Verify token          | No            | No         |
| GET    | /auth/admin         | Admin test route      | Yes           | Yes        |

### 4.2 User Endpoints

| Method | Endpoint        | Description             | Auth Required | Admin Only |
| ------ | --------------- | ----------------------- | ------------- | ---------- |
| GET    | /user/:id       | Get user by ID          | Yes           | No         |
| DELETE | /user/:id       | Delete user by ID       | Yes           | Yes        |
| GET    | /user/          | List all users          | Yes           | Yes        |
| DELETE | /user/          | Delete all users        | Yes           | Yes        |
| PUT    | /user/:username | Update user by username | Yes           | Yes        |

### 4.3 Post Endpoints

| Method | Endpoint            | Description               | Auth Required | Admin Only |
| ------ | ------------------- | ------------------------- | ------------- | ---------- |
| GET    | /posts              | Get all posts (paginated) | No            | No         |
| POST   | /posts              | Create new post           | Yes           | Yes        |
| GET    | /posts/one-post/:id | Get post by ID            | No            | No         |
| PUT    | /posts/:id          | Update post               | Yes           | Yes        |
| DELETE | /posts/:id          | Delete post               | Yes           | Yes        |
| PUT    | /posts/:id/view     | Increment view count      | No            | No         |
| PUT    | /posts/:id/upvote   | Upvote post               | Yes           | No         |
| PUT    | /posts/:id/downvote | Downvote post             | Yes           | No         |

### 4.4 Category Endpoints

| Method | Endpoint                 | Description           | Auth Required | Admin Only |
| ------ | ------------------------ | --------------------- | ------------- | ---------- |
| GET    | /category/:category      | Get posts by category | No            | No         |
| GET    | /category/all-categories | Get all categories    | No            | No         |

### 4.5 Image Endpoints

| Method | Endpoint         | Description             | Auth Required | Admin Only |
| ------ | ---------------- | ----------------------- | ------------- | ---------- |
| GET    | /images          | List images (paginated) | No            | No         |
| POST   | /images/multiple | Upload multiple images  | No            | No         |
| DELETE | /images/:id      | Delete image by ID      | No            | No         |

## Additional Doc

if you want to learn more about api check : [Detailed API](./detailed_api.md)
