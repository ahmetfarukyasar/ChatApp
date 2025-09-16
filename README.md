# ChatApp

> Real-time chat application (React + Vite, Node.js, Express, Socket.IO, MongoDB, JWT)

---

## 📖 Table of Contents

- [Overview](#-overview)  
- [Features](#-features)  
- [Technologies](#-technologies)  
- [Architecture](#-architecture)  
- [Installation](#-installation)  
- [Running the App](#-running-the-app)   
- [Environment Variables](#-environment-variables)  
- [License](#-license)  
- [Contact](#-contact)

---

## 📌 Overview

**ChatApp** is a modern **real-time messaging** application built with cutting-edge web technologies.  
The frontend is developed using **React (Vite)**, while the backend is powered by **Node.js, Express, and Socket.IO**.  
Data is stored in **MongoDB**, and user authentication is handled using **JWT**.

---

## 🚀 Features

- 🔑 User registration & login (JWT authentication)  
- 💬 Real-time messaging with Socket.IO  
- 🕑 Message history saved in MongoDB  
- 👤 Online / offline user status tracking    
- ⚡ Fast development with Vite  
- 🔒 Secure password hashing & token-based auth  

---

## 🛠️ Technologies

| Layer / Component | Technology |
|-------------------|-------------|
| **Frontend**      | React + Vite |
| **Backend**       | Node.js + Express |
| **Realtime**      | Socket.IO |
| **Database**      | MongoDB & Mongoose |
| **Auth**          | JWT, bcrypt |
| **UI**            | TailwindCSS *(if used)* |
| **Deploy**        | *(e.g., Render, Vercel, Docker, etc.)* |

---

## 🏗️ Architecture

1. **Frontend (React + Vite)**  
   - User interface  
   - Message sending/receiving  
   - Auth header management with JWT  

2. **Backend (Express)**  
   - REST API endpoints (auth, users, messages)  
   - Real-time communication with Socket.IO  

3. **Database (MongoDB)**  
   - Users  
   - Messages  
   - Chat rooms / groups  

4. **Authentication (JWT)**  
   - Token generation during login/register  
   - Token validation for protected routes  

---

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/ahmetfarukyasar/ChatApp.git
cd ChatApp
```

### Backend setup

```bash
cd backend
npm install
```

### Frontend setup

```bash
cd ../frontend
npm install
```

---

## ▶️ Running the App

### Backend

```bash
cd backend
npm start
```

### Frontend

```bash
cd frontend
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) by default.

---

## 🔑 Environment Variables

Copy `.env` files inside the backend and frontend directories with the following variables:

Backend:

```env
FRONTEND_URL=http://locahost:5173(by default)
MONGO_URL=your_mongodb_connection_string
SECRET_KEY=your_secret_key
```

Frontend:

```env
VITE_BACKEND_URL=backend_server_url
```

---

## 🤝 Contributing

Contributions are welcome 🎉  

1. Fork the repo  
2. Create a new branch (`feature/your-feature`)  
3. Commit your changes  
4. Submit a pull request  

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 📬 Contact

- **Author:** Ahmet Faruk Yaşar  
- **GitHub:** [ahmetfarukyasar](https://github.com/ahmetfarukyasar)
