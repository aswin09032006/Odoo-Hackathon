# QuickDesk Documentation

Welcome to QuickDesk! This documentation will help you set up, use, and contribute to the project.

---

## Table of Contents
- Introduction
- Features
- Project Structure
- Setup & Installation
- Environment Variables
- Running the Application
- API Endpoints
- Database Schema
- User Roles & Flow
- Security
- Troubleshooting
- Contributing
- License

---

## Introduction
QuickDesk is a help desk solution for managing support tickets, users, and communication between end-users and support teams.

---

## Features
- User authentication (JWT)
- Ticket creation, tracking, and management
- Dashboard with filtering and sorting
- Admin panel for user/category management
- Comments and threaded conversations
- Voting system for tickets
- Email notifications

---

## Project Structure
```
QuickDesk/
├── client/         # Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── ...
├── server/         # Backend (Node.js + Express)
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   └── package.json
├── README.md
└── ...
```

---

## Setup & Installation
### Prerequisites
- Node.js (v18.x or v20.x recommended)
- npm or Yarn
- MongoDB (local or Atlas)

### Backend Setup
1. Navigate to `server/`
2. Install dependencies: `npm install`
3. Create `.env` file with:
    ```env
    MONGO_URI=mongodb://127.0.0.1:27017/quickdesk_db
    JWT_SECRET=your_jwt_secret_here
    EMAIL_HOST=smtp.example.com
    EMAIL_PORT=587
    EMAIL_USER=your_email_username
    EMAIL_PASS=your_email_password
    NODE_ENV=development
    PORT=5000
    ```
4. Create `uploads/` directory for file uploads

### Frontend Setup
1. Navigate to `client/`
2. Install dependencies: `npm install`
3. Create `.env` file with:
    ```env
    VITE_API_BASE_URL=http://localhost:5000/api
    VITE_APP_NAME=QuickDesk
    VITE_FEATURE_FLAG=true
    ```

---

## Running the Application
1. Start MongoDB server
2. Start backend: `npm run dev` (in `server/`)
3. Start frontend: `npm run dev` (in `client/`)
4. Access app at `http://localhost:5173`

---

## API Endpoints
- `/api/auth` (register, login, profile)
- `/api/users` (CRUD users)
- `/api/categories` (CRUD categories)
- `/api/tickets` (CRUD tickets, comments, votes)
- `/uploads` (serve attachments)

---

## Database Schema
- `User.js`: User info & roles
- `Category.js`: Ticket categories
- `Ticket.js`: Ticket details, comments, votes

---

## User Roles & Flow
- End User: Register, create/view tickets, comment, vote
- Support Agent: Manage tickets, assign, comment, vote
- Admin: Manage users, categories, all tickets

---

## Security
- Passwords hashed with bcryptjs
- JWT authentication
- Role-based access control
- Input validation
- CORS enabled
- File upload restrictions

---

## Troubleshooting
- Check `.env` files for correct values
- Ensure MongoDB is running
- Check terminal for errors
- Review logs in `logs/` directory

---

## Contributing
- Fork the repo, create a branch, submit PRs
- Open issues for bugs or suggestions

---

## License
MIT License. See `LICENSE.md` for details.
