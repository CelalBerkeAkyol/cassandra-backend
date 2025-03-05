# Detailed Endpoint Documentation

If you want a summary of this project and routes, please check `summary.md`
Note: Some responses currently include sensitive information, which will be corrected.
You can add your requests, issues, and improvements at: https://github.com/CelalBerkeAkyol/Finance-blog-backend/issues

---

## Auth Endpoints

### Register User

- **POST /auth/register**

#### Request Body

```json
{
  "userName": "username",
  "email": "email@gmail.com",
  "password": "password"
}
```

#### Success Response

```json
{
 {
    "success": true,
    "message": "Yeni kullanıcı başarıyla oluşturuldu.",
    "user": {
        "id": "67c8a4e5377021aa758db624",
        "userName": "username",
        "role": "user"
    }
}
}
```

### Login User

- **POST /auth/login**

#### Request Body

```json
{
  "email": "email@gmail.com",
  "password": "password"
}
```

#### Success Response

```json
{
  "success": true,
  "message": "Giriş başarılı",
  "user": {
    "email": "email@gmail.com",
    "role": "user",
    "username": "username"
  }
}
```

### Logout User

- **POST /auth/logout**

#### Description

Requires valid access token. Clears session cookies.

#### Success Response

```json
{
  "success": true,
  "message": "Çıkış yapıldı."
}
```

### Refresh Access Token

- **POST /auth/refresh-token**

#### Description

Requires valid refresh token.

#### Success Response

```json
{
  "success": true,
  "message": "Yeni Access Token oluşturuldu.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YzhhNDBlY2M1Njg0Y2FhYjgzNDMzZiIsImlhdCI6MTc0MTIwMzQxMSwiZXhwIjoxNzQxMjA0MzExfQ.-UkXr9pzhZ6SFYpr6pfbYlvrlRn4zMxS6pl8YzEHOC0"
}
```

### Verify Token

- **POST /auth/verify-token**

#### Description

Validates current access token.

#### Success Response

```json
{
  "success": true,
  "valid": true,
  "user": {
    "id": "67c8a40ecc5684caab83433f",
    "iat": 1741203032,
    "exp": 1741203932
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YzhhNDBlY2M1Njg0Y2FhYjgzNDMzZiIsImlhdCI6MTc0MTIwMzAzMiwiZXhwIjoxNzQxMjAzOTMyfQ.gWGWuS8uvpbu6DHeTgh4CkL-r0h2R0-kxVttag-2wSg"
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
  "success": true,
  "message": "Bireysel kullanıcı bilgileriniz",
  "data": {
    "_id": "67c8a40ecc5684caab83433f",
    "userName": "username",
    "role": "user",
    "createdAt": "2025-03-05T19:20:46.714Z"
  }
}
```

### Delete User by ID

- **DELETE /user/:id**

#### Description

Requires admin privileges.

#### Success Response

```json
{
  "success": true,
  "message": "Kullanıcı başarıyla silindi."
}
```

### List All Users

- **GET /user/**

#### Description

Requires admin privileges.

#### Success Response

```json
[
  {
    "_id": "67c8a40ecc5684caab83433f",
    "userName": "username",
    "email": "email@gmail.com",
    "password": "$2a$10$3wJZ3/I/aVZon4XQCEai8eFoMdtbPvv8HO92i3597kCLNnN17pHOa",
    "profileImage": "https://example.com/default-profile.png",
    "role": "user",
    "isVerified": false,
    "refreshToken": "refresh-token",
    "deletedAt": null,
    "createdAt": "2025-03-05T19:20:46.714Z",
    "updatedAt": "2025-03-05T19:29:11.147Z",
    "__v": 0
  },
  {
    "_id": "67c8a4e5377021aa758db624",
    "userName": "username1",
    "email": "email1@gmail.com",
    "password": "$2a$10$MWUoCUEy2m9rar6uDki17OWLU04O2C1soj7VFIALBQsVrZzil13K2",
    "profileImage": "https://example.com/default-profile.png",
    "role": "user",
    "isVerified": false,
    "refreshToken": null,
    "deletedAt": null,
    "createdAt": "2025-03-05T19:24:21.889Z",
    "updatedAt": "2025-03-05T19:24:21.889Z",
    "__v": 0
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
  // any other params
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "67c816d30c0a3fec256078a7",
    "userName": "ahmet22",
    "email": "ahmet@gmail.com",
    "password": "$2a$10$Z1DVGim6JEWonzdy6g5d.OxXYsZpM5QC0RzMrhKbqKwe0Phl0b49i",
    "profileImage": "https://example.com/default-profile.png",
    "role": "user",
    "isVerified": false,
    "refreshToken": null,
    "deletedAt": null,
    "createdAt": "2025-03-05T09:18:11.345Z",
    "updatedAt": "2025-03-05T19:44:15.008Z",
    "__v": 0
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
  "count": 2,
  "total": 2,
  "pagination": {},
  "data": [
    {
      "_id": "67c49ac7c7d2131991f7ea1b",
      "title": "Yeni bir post daha",
      "content": "#deneme için bir post daha ",
      "author": {
        "_id": "67c40b52595059a4eda22361",
        "userName": "Celal Berke Akyol",
        "role": "admin"
      },
      "category": "kişisel-finans",
      "images": [],
      "status": "taslak",
      "views": 16,
      "likes": 2,
      "likedBy": ["67c40b52595059a4eda22361", "67c40d02595059a4eda2236b"],
      "dislikes": 0,
      "dislikedBy": [],
      "createdAt": "2025-03-02T17:52:07.017Z",
      "updatedAt": "2025-03-05T05:22:57.497Z",
      "slug": "Yeni-bir-post-daha",
      "__v": 2
    },
    {
      "_id": "67c42a05595059a4eda22442",
      "title": "Yeni post",
      "content": "Hello world ",
      "author": {
        "_id": "67c40b52595059a4eda22361",
        "userName": "Celal Berke Akyol",
        "role": "admin"
      },
      "category": "araştırma",
      "images": [],
      "status": "taslak",
      "views": 34,
      "likes": 2,
      "likedBy": ["67c40b52595059a4eda22361", "67c40d02595059a4eda2236b"],
      "dislikes": 0,
      "dislikedBy": [],
      "createdAt": "2025-03-02T09:51:01.235Z",
      "updatedAt": "2025-03-05T09:18:45.629Z",
      "slug": "Yeni-post",
      "__v": 2
    }
  ]
}
```

### Create New Post

- **POST /posts**

#### Description

Requires admin privileges.

#### Request Body

```json
{
  "title": "Finns neden önemlidir",
  "content": "Bu finance metnin içeriği",
  "category": "mikro-ekonomi"
  // other params
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "title": "Finns neden önemlidir",
    "content": "Bu finance metnin içeriği",
    "author": "67c40b52595059a4eda22361",
    "category": "mikro-ekonomi",
    "images": [],
    "status": "taslak",
    "views": 0,
    "likes": 0,
    "likedBy": [],
    "dislikes": 0,
    "dislikedBy": [],
    "_id": "67c8ac9556a0eccf69432ce0",
    "createdAt": "2025-03-05T19:57:09.420Z",
    "updatedAt": "2025-03-05T19:57:09.420Z",
    "slug": "Finns-neden-onemlidir",
    "__v": 0
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
    "_id": "67c49ac7c7d2131991f7ea1b",
    "title": "Yeni bir post daha",
    "content": "#deneme için bir post daha ",
    "author": {
      "_id": "67c40b52595059a4eda22361",
      "userName": "Celal Berke Akyol"
    },
    "category": "kişisel-finans",
    "images": [],
    "status": "taslak",
    "views": 16,
    "likes": 2,
    "likedBy": ["67c40b52595059a4eda22361", "67c40d02595059a4eda2236b"],
    "dislikes": 0,
    "dislikedBy": [],
    "createdAt": "2025-03-02T17:52:07.017Z",
    "updatedAt": "2025-03-05T05:22:57.497Z",
    "slug": "Yeni-bir-post-daha",
    "__v": 2
  }
}
```

### Update Post

- **PUT /posts/:id**

#### Description

Requires admin privileges.

#### Request

```json
{
  "title": "Yeni bir post daha2",
  "content": "#deneme için bir post daha2",

  "category": "kişisel-finans",
  "status": "taslak",

  "slug": "Yeni-bir-post-daha"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "67c49ac7c7d2131991f7ea1b",
    "title": "Yeni bir post daha2",
    "content": "#deneme için bir post daha2",
    "author": "67c40b52595059a4eda22361",
    "category": "kişisel-finans",
    "images": [],
    "status": "taslak",
    "views": 16,
    "likes": 2,
    "likedBy": ["67c40b52595059a4eda22361", "67c40d02595059a4eda2236b"],
    "dislikes": 0,
    "dislikedBy": [],
    "createdAt": "2025-03-02T17:52:07.017Z",
    "updatedAt": "2025-03-05T20:02:17.660Z",
    "slug": "Yeni-bir-post-daha2",
    "__v": 2
  }
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
  "message": "Post başarıyla silindi."
}
```

### Increment Post Views

- **PUT /posts/:id/view**

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "67c8ac9556a0eccf69432ce0",
    "title": "Finns neden önemlidir",
    "content": "Bu finance metnin içeriği",
    "author": "67c40b52595059a4eda22361",
    "category": "mikro-ekonomi",
    "images": [],
    "status": "taslak",
    "views": 1,
    "likes": 0,
    "likedBy": [],
    "dislikes": 0,
    "dislikedBy": [],
    "createdAt": "2025-03-05T19:57:09.420Z",
    "updatedAt": "2025-03-05T20:04:04.294Z",
    "slug": "Finns-neden-onemlidir",
    "__v": 0
  }
}
```

### Upvote Post

- **PUT /posts/:id/upvote**

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "67c8ac9556a0eccf69432ce0",
    "title": "Finns neden önemlidir",
    "content": "Bu finance metnin içeriği",
    "author": "67c40b52595059a4eda22361",
    "category": "mikro-ekonomi",
    "images": [],
    "status": "taslak",
    "views": 1,
    "likes": 1,
    "likedBy": ["67c40b52595059a4eda22361"],
    "dislikes": 0,
    "dislikedBy": [],
    "createdAt": "2025-03-05T19:57:09.420Z",
    "updatedAt": "2025-03-05T20:04:38.923Z",
    "slug": "Finns-neden-onemlidir",
    "__v": 1
  }
}
```

### Downvote Post

- **PUT /posts/:id/downvote**

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "67c8ac9556a0eccf69432ce0",
    "title": "Finns neden önemlidir",
    "content": "Bu finance metnin içeriği",
    "author": "67c40b52595059a4eda22361",
    "category": "mikro-ekonomi",
    "images": [],
    "status": "taslak",
    "views": 1,
    "likes": 0,
    "likedBy": [],
    "dislikes": 1,
    "dislikedBy": ["67c40b52595059a4eda22361"],
    "createdAt": "2025-03-05T19:57:09.420Z",
    "updatedAt": "2025-03-05T20:05:14.556Z",
    "slug": "Finns-neden-onemlidir",
    "__v": 2
  }
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
  "message": "mikro-ekonomi kategorisindeki postlar başarıyla getirildi.",
  "posts": [
    {
      "_id": "67c8ac9556a0eccf69432ce0",
      "title": "Finns neden önemlidir",
      "content": "Bu finance metnin içeriği",
      "author": "67c40b52595059a4eda22361",
      "category": "mikro-ekonomi",
      "images": [],
      "status": "taslak",
      "views": 1,
      "likes": 0,
      "likedBy": [],
      "dislikes": 1,
      "dislikedBy": ["67c40b52595059a4eda22361"],
      "createdAt": "2025-03-05T19:57:09.420Z",
      "updatedAt": "2025-03-05T20:05:14.556Z",
      "slug": "Finns-neden-onemlidir",
      "__v": 2
    }
  ]
}
```

### Get All Categories

- **GET /category/all-categories**

#### Success Response

```json
{
  "success": true,
  "message": "Tüm kategoriler başarıyla getirildi.",
  "allCategory": [
    "mikro-ekonomi",
    "makro-ekonomi",
    "kişisel-finans",
    "tasarruf",
    "temel-analiz",
    "teknik-analiz",
    "kategori-yok",
    "araştırma"
  ]
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
