# **Data Science & ML Blog Backend**

## **📌 Project Description**

This project is a **blog backend API** designed to manage content related to **Data Science** and **Machine Learning**. Utilizing **RESTful API** architecture, it allows users to manage blog content, categorize posts, and leave comments.

> **Note:** This project consists of **two components**:
>
> - **Frontend**: [Data Science & ML Blog Frontend](https://github.com/username/data-science-ml-frontend)
> - **Backend** (this repository): Provides API services.

---

## **🚀 Features**

- ✅ Blog content management via **RESTful API**
- ✅ Secure authentication using **JWT Authentication**
- ✅ **RBAC (Role-Based Access Control)** for authorization
- ✅ Management of **categories, blogs, and users**
- ✅ **Markdown support** for content formatting
- ✅ Media management with **image upload API**
- ✅ Robust API architecture with **Unit & Integration Tests**

---

## **🛠 Technologies Used**

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, Bcrypt
- **Security:** Sanitize-HTML, Cookie-Parser
- **Environment Management:** Dotenv
- **Routing & Middleware:** CORS, Slugify

---

## **📌 API Endpoints**

### **🔹 User Operations**

- **`/user`** → User operations (profile view, update, delete)
- **`/auth`** → Authentication operations (register, login, logout, refresh token)

### **🔹 Blog Management**

- **`/posts`** → Blog post operations (create, update, delete, list)
- **`/category`** → Blog categories (list all, get posts by category)

### **🔹 Media Management**

- **`/images`** → Image upload and management

---

## **📂 Folder Structure**

```
📂 src

 ┣ 📂 controllers     # API endpoint controllers
 ┣ 📂 helpers         # Utility functions
 ┣ 📂 middlewares     # Authentication and error handling
 ┣ 📂 models          # MongoDB schemas
 ┣ 📂 routers         # API routing files
 ┣ 📂 docs            # Documentation files
 ┣ 📜 .env            # Environment Variables
 ┗ 📜 server.js       # Main server file
```

---

## **🚀 Setup & Run**

### **1️⃣ Requirements**

- Node.js **14+**
- MongoDB **4.x** (Cloud)

### **2️⃣ Clone the Project**

```bash
git clone https://github.com/CelalBerkeAkyol/Finance-blog-backend
cd finance-blog-backend
```

### **3️⃣ Install Dependencies**

```bash
npm install
```

### **4️⃣ Configure Environment Variables**

Create a `.env` file and configure it as follows:

```
MONGOOSE_URL=mongodb://localhost:27017/ds_ml_blog
JWT_SECRET=supersecuresecret
REFRESH_TOKEN_SECRET=supersecuresecret
```

### **5️⃣ Initialize Database**

```bash
npm run seed
```

### **6️⃣ Start Server**

```bash
npm run dev
```

---

## **📌 API Documentation**

You can view all endpoints via the Swagger interface:

📌 **DOCS:** [`summary.md`](./docs/summary.md) [`detailed api.md`](./docs/detailed_api.md)

---

## **📌 Contributing**

If you would like to contribute to the project, please follow these steps:

1. **Fork** the repository and clone it.
2. Create a new **branch**:
   ```bash
   git checkout -b feature/new-feature
   ```
3. Make your changes and commit:
   ```bash
   git commit -m "Added new feature"
   ```
4. Open a **Pull Request** 🚀

---

## **📜 License**

This project is distributed under the **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)** license. This license prohibits **commercial use** and **derivative works**. For more information, see the [LICENSE](LICENSE) file.

---

## **📩 Contact**

📧 **Email:** [buscberke@gmail.com](mailto:buscberke@gmail.com)  
🚀 **Developer:** [GitHub](https://github.com/CelalBerkeAkyol)

---

### **🔗 Additional Links**

- 📌 **[Frontend Repo](https://github.com/CelalBerkeAkyol/Finance-blog-frontend)**

---
