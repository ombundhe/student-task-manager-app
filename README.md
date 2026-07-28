# 📚 Student Task Manager

A full-stack web app with **Login/Register**, **JWT Auth**, and **CRUD Tasks**.

---

## 🛠 Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Auth:** JWT + bcrypt

---

## 🚀 How to Run (VS Code)

### Prerequisites
- Install [Node.js](https://nodejs.org) (v18+)
- Install [MongoDB Community](https://www.mongodb.com/try/download/community) OR use [MongoDB Atlas](https://cloud.mongodb.com) (free cloud)

---

### Step 1 – Open in VS Code
```
File → Open Folder → select "student-task-manager"
```

### Step 2 – Install Backend Dependencies
Open the VS Code terminal (Ctrl + `) and run:
```bash
cd server
npm install
```

### Step 3 – Configure Environment
The `.env` file is already set up for local MongoDB:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=mysecretkey123
```
> If using MongoDB Atlas, replace MONGO_URI with your Atlas connection string.

### Step 4 – Start the Backend
```bash
cd server
npm run dev
```
You should see:
```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

### Step 5 – Open the Frontend
- Install the **Live Server** extension in VS Code
- Right-click `client/index.html` → **"Open with Live Server"**
- Your app opens at `http://127.0.0.1:5500/client/index.html`

---

## 📁 Folder Structure
```
student-task-manager/
├── server/
│   ├── server.js             ← Main backend entry
│   ├── .env                  ← Environment variables
│   ├── package.json
│   ├── models/
│   │   ├── User.js           ← User schema
│   │   └── Task.js           ← Task schema
│   ├── routes/
│   │   ├── auth.js           ← /register and /login
│   │   └── tasks.js          ← CRUD for tasks
│   └── middleware/
│       └── authMiddleware.js ← JWT verification
└── client/
    ├── index.html            ← Login / Register page
    ├── dashboard.html        ← Main task dashboard
    ├── style.css             ← All styles
    └── app.js                ← All frontend JS logic
```

---

## ✅ Features
- User Register & Login
- Password hashing with bcrypt
- JWT token-based auth (7-day expiry)
- Protected API routes
- Add, Edit, Delete tasks
- Mark task as Done / Undo
- Filter by status (Pending / In Progress / Completed)
- Task stats dashboard
- Fully responsive UI

---

## 🔑 API Endpoints

| Method | Endpoint            | Auth | Description         |
|--------|---------------------|------|---------------------|
| POST   | /api/auth/register  | No   | Register new user   |
| POST   | /api/auth/login     | No   | Login user          |
| GET    | /api/tasks          | Yes  | Get all user tasks  |
| POST   | /api/tasks          | Yes  | Create a task       |
| PUT    | /api/tasks/:id      | Yes  | Update a task       |
| DELETE | /api/tasks/:id      | Yes  | Delete a task       |
