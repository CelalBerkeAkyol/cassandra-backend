# Data Science Blog - Backend API 🚀

This repository contains the backend API for the **Data Science Blog**, a platform designed for data scientists and researchers to showcase their Python notebook projects.

The API provides robust endpoints for user authentication, post management, and media handling. It's built to be secure, scalable, and easy to integrate with a frontend application, allowing users to effortlessly convert Jupyter Notebooks (`.ipynb`) into polished, web-friendly articles.

---

## ✨ Features

#### 🔑 User Authentication & Management

- **Registration & Login:** Secure sign-up, login, and logout using JWT.
- **Password Reset:** Email-based password reset functionality.
- **Protected Routes:** Middleware to secure user-specific endpoints.
- **Profile Management:** Users can create, edit, and delete their own accounts.
- **Admin Controls:** Role-based access control to manage and delete users.

#### 📝 Post & Content Management

- **CRUD Operations:** Full create, read, update, and delete functionality for posts.
- **Jupyter Notebook Importer:** Seamlessly upload `.ipynb` files, which are automatically converted into formatted blog posts with images.
- **Engagement:** Like, dislike, and share posts.
- **Discovery:** Search, filter by category, and view the latest posts.
- **Frontend Support:** Designed to support modern frontend features like loading skeletons.

#### 🖼️ Media Management

- **Image Uploads:** Direct image uploads with processing via `multer` and `sharp`.
- **Image Library:** A personal gallery for users to view, select, and delete their uploaded images.

---

## 🛠️ Tech Stack

- **Framework:** Node.js, Express.js
- **Database:** MongoDB with Mongoose for object data modeling.
- **Authentication & Security:** JSON Web Tokens (JWT), bcrypt for hashing, `sanitize-html` for input cleaning.
- **File Handling:** Multer for file uploads, Sharp for image processing.
- **Email:** Nodemailer for sending transactional emails.
- **Core Dependencies:** `cors`, `cookie-parser`, `dotenv`, `slugify`.

---

## 🚀 Getting Started

Follow these steps to set up and run the project on your local machine.

### Prerequisites

- Node.js (v14 or higher)
- MongoDB instance (local or cloud-based)

### Installation

1.  **Clone the repository:**
    _(Note: I've used a placeholder for your repository URL.)_

    ```bash
    git clone https://github.com/CelalBerkeAkyol/cassandra-backend
    cd your-repo-name
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory and add the following variables.

    ```env
    # Server Configuration
    NODE_ENV=development
    PORT=3000
    ALLOWED_ORIGINS=http://localhost:5173 # Your frontend URL
    FRONTEND_URL=http://localhost:5173

    # Database
    MONGOOSE_URL=your_mongodb_connection_string

    # JWT Secrets
    JWT_SECRET=your_strong_jwt_secret
    REFRESH_TOKEN_SECRET=your_strong_refresh_token_secret

    # Email Service (Optional - for password resets)
    GOOGLE_MAIL=your_gmail_address
    GOOGLE_PASS=your_gmail_app_password
    ```

4.  **Initialize the database with seed data:**

    ```bash
    npm run seed
    ```

5.  **Run the development server:**
    The server will automatically restart on file changes thanks to `nodemon`.

    ```bash
    npm run dev
    ```

    The API will now be running at `http://localhost:3000` (or the port you specified).

### **🔗 Additional Links**

- 📌 **[Frontend Repo](https://github.com/CelalBerkeAkyol/cassandra-frontend)**

---

Feel free to reach out for any feedback or suggestions! 🚀
