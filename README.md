# QuickDesk - A Simple & Efficient Help Desk Solution

QuickDesk is a straightforward, easy-to-use help desk application designed to streamline communication between users and support teams. It allows end-users to raise support tickets, and support staff to efficiently manage, resolve, and communicate updates on these tickets.

## Table of Contents

-   [Features](#features)
-   [Roles](#roles)
-   [Technology Stack](#technology-stack)
-   [Project Structure](#project-structure)
-   [Setup and Installation](#setup-and-installation)
    -   [Prerequisites](#prerequisites)
    -   [Backend Setup](#backend-setup)
    -   [Frontend Setup](#frontend-setup)
    -   [Running the Application](#running-the-application)
-   [API Endpoints](#api-endpoints)
-   [Database Schema](#database-schema)
-   [User Flow](#user-flow)
-   [Security Considerations](#security-considerations)
-   [Future Enhancements](#future-enhancements)
-   [Contributing](#contributing)
-   [License](#license)

## Features

-   **User Authentication:** Secure registration and login for different user roles.
-   **Ticket Creation:** Users can create tickets with subject, description, category, and optional file attachments.
-   **Ticket Tracking:** Users can view the status of their submitted tickets.
-   **Dashboard & Filtering:** Comprehensive dashboard with search, filtering (status, category, user's own tickets), and sorting options (recently modified, most replied, upvotes).
-   **Ticket Management:** Support agents can view, assign, update status (Open → In Progress → Resolved → Closed), and add comments to tickets.
-   **Admin Panel:** Admins can manage users (roles, permissions) and ticket categories.
-   **Comments/Conversations:** Threaded conversation view for each ticket.
-   **Voting System:** Users can upvote and downvote questions/tickets.
-   **Email Notifications:** Automated email alerts on ticket creation and status changes.

## Roles

QuickDesk supports three main user roles, each with specific permissions:

1.  **End User (Employees/Customers):**
    *   Register/Login.
    *   Create and view their own tickets.
    *   Add comments to their own tickets.
    *   Upvote/Downvote tickets (excluding their own).
    *   View profile and settings.
2.  **Support Agent:**
    *   Register/Login (can also be created by Admin).
    *   View all tickets.
    *   Assign tickets to themselves or other agents.
    *   Update ticket status.
    *   Add comments to any ticket.
    *   Create tickets (like an end-user).
    *   Upvote/Downvote tickets.
    *   View profile and settings.
3.  **Admin:**
    *   Register/Login (first user can be admin, or manually set in DB).
    *   Full CRUD (Create, Read, Update, Delete) on all tickets.
    *   Manage users (create, update roles, delete).
    *   Manage ticket categories (create, update, delete).
    *   All functionalities of a Support Agent.
    *   View profile and settings.

## Project Structure

```
QuickDesk/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Common/
│   │   │   ├── Dashboard/
│   │   │   ├── Layout/
│   │   │   └── TicketDetail/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   ├── Admin/
│   │   │   ├── Auth/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── ...
├── server/
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

## Technology Stack

-   **Frontend:** React.js (with Vite for fast development)
-   **Backend:** Node.js (with Express.js framework)
-   **Database:** MongoDB (with Mongoose ODM)
-   **Authentication:** JSON Web Tokens (JWT)
-   **Password Hashing:** `bcryptjs`
-   **Email Notifications:** `Nodemailer`
-   **Environment Variables:** `dotenv`
-   **File Uploads:** `multer`
-   **UI Styling:** Tailwind CSS (recommended for `client/src/index.css`)
-   **Date Formatting:** `moment.js`

## Setup and Installation

Follow these steps to get QuickDesk up and running on your local machine.

### Prerequisites

-   Node.js (LTS version recommended, e.g., v18.x or v20.x)
-   npm (comes with Node.js) or Yarn
-   MongoDB instance (local or cloud-hosted like MongoDB Atlas)

### Backend Setup

1.  **Navigate to the `server` directory:**
    ```bash
    cd quickdesk/server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    ```
3.  **Create `.env` file:**
    Copy the example environment variables file:
    ```bash
    cp .env.example .env
    ```
    Open the newly created `.env` file and fill in your details. Required variables:
    
    ```env
    # MongoDB connection string
    MONGO_URI=mongodb://127.0.0.1:27017/quickdesk_db

    # JWT secret for authentication
    JWT_SECRET=your_jwt_secret_here

    # SMTP configuration for email notifications
    EMAIL_HOST=smtp.example.com
    EMAIL_PORT=587
    EMAIL_USER=your_email_username
    EMAIL_PASS=your_email_password

    # (Optional) Other environment variables
    NODE_ENV=development
    PORT=5000
    ```
4.  **Create `uploads` directory:**
    Multer needs a place to store uploaded files. Create this directory:
    ```bash
    mkdir uploads
    ```

### Frontend Setup

1.  **Navigate to the `client` directory:**
    ```bash
    cd quickdesk/client
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    ```
3.  **Create `.env` file:**
    Copy the example environment variables file:
    ```bash
    cp .env.example .env
    ```
    Open the `.env` file and set the required variables:
    
    ```env
    # Base URL for backend API
    VITE_API_BASE_URL=http://localhost:5000/api

    # (Optional) Other environment variables for client
    VITE_APP_NAME=QuickDesk
    VITE_FEATURE_FLAG=true
    ```

### Running the Application

1.  **Start the MongoDB server** (if running locally).

2.  **Start the Backend Server:**
    Open a new terminal, navigate to `quickdesk/server`, and run:
    ```bash
    npm run dev
    # or yarn dev
    ```
    You should see a message like `Server running in development mode on port 5000`.

3.  **Start the Frontend Development Server:**
    Open another new terminal, navigate to `quickdesk/client`, and run:
    ```bash
    npm run dev
    # or yarn dev
    ```
    Vite will provide a local URL, usually `http://localhost:5173`.

4.  **Access the Application:**
    Open your web browser and navigate to the URL provided by the Vite development server (e.g., `http://localhost:5173`).

You can now register a new user and start using QuickDesk! The first registered user can be manually set to 'admin' role in MongoDB if needed for initial admin access.

## API Endpoints

The backend exposes the following primary API endpoints:

-   **`/api/auth`**:
    -   `POST /register`: Register a new user.
    -   `POST /login`: Authenticate and receive a JWT.
    -   `GET /me`: Get current user's profile (Private).
-   **`/api/users`**: (Admin only, except for self-update)
    -   `GET /`: Get all users.
    -   `POST /`: Create a new user.
    -   `GET /:id`: Get a single user.
    -   `PUT /:id`: Update user details (Admin or user's own profile).
    -   `DELETE /:id`: Delete a user.
-   **`/api/categories`**: (Admin can CRUD, others can view)
    -   `GET /`: Get all categories.
    -   `POST /`: Create a new category (Admin).
    -   `GET /:id`: Get a single category.
    -   `PUT /:id`: Update a category (Admin).
    -   `DELETE /:id`: Delete a category (Admin).
-   **`/api/tickets`**: (Private)
    -   `GET /`: Get all tickets (filtered by role, search, sort, paginate).
    -   `POST /`: Create a new ticket (with optional attachments).
    -   `GET /:id`: Get single ticket details.
    -   `PUT /:id`: Update ticket (status, assignment, etc. based on role).
    -   `DELETE /:id`: Delete a ticket (Admin only).
    -   `POST /:id/comment`: Add a comment to a ticket.
    -   `PUT /:id/upvote`: Upvote a ticket.
    -   `PUT /:id/downvote`: Downvote a ticket.
-   **`/uploads`**:
    -   `GET /:filename`: Serve static uploaded files (attachments).

## Database Schema

See the `server/models` directory for detailed Mongoose schemas:

-   `User.js`: Defines user properties (username, email, hashed password, role, timestamps).
-   `Category.js`: Defines ticket category properties (name, description, timestamps).
-   `Ticket.js`: Defines ticket properties (subject, description, category, createdBy, assignedTo, status, comments, attachments, upvotes, downvotes, timestamps).

## User Flow

1.  **User registers/logs in.**
2.  **User creates a ticket** with subject, description, category, and optional attachment. The ticket status is `Open`.
3.  **Admins/Support Agents** are notified via email (if configured) about the new ticket.
4.  **Support Agent picks up** the ticket, sets its status to `In Progress`, and optionally assigns it to themselves.
5.  **Users receive email updates** when their ticket's status changes or a new comment is added by an agent. They can also view updates and add replies (comments) on their own tickets.
6.  **Agent resolves** the issue, updates the status to `Resolved`, and adds a final comment.
7.  **Admin or Agent closes** the ticket after confirmation or a set period, changing status to `Closed`.

## Security Considerations

-   **Password Hashing:** Passwords are never stored in plain text; `bcryptjs` is used for strong hashing.
-   **JWT Authentication:** JSON Web Tokens are used for stateless authentication, making the API scalable.
-   **Role-Based Access Control (RBAC):** Middleware (`authMiddleware.js`) ensures that users can only access routes and perform actions permitted by their role.
-   **Input Validation:** Mongoose schemas include basic validation (e.g., `required`, `match` for email, `minlength` for password). Further validation can be added on the backend using libraries like Joi or Express-validator.
-   **CORS:** Configured to allow cross-origin requests from the frontend.
-   **Environment Variables:** Sensitive information (database URI, JWT secret, email credentials) are stored in `.env` files and loaded via `dotenv`, keeping them out of the codebase.
-   **File Uploads:** `multer` configuration includes file type and size limits to prevent malicious uploads. Stored attachments are served statically but not directly executable by the server.

## Future Enhancements

-   **Real-time Updates:** Implement WebSockets (e.g., Socket.IO) for real-time ticket updates and chat.
-   **Rich Text Editor:** Integrate a WYSIWYG editor for ticket descriptions and comments.
-   **Advanced Search & Filtering:** More sophisticated search capabilities, full-text search indexing.
-   **Reporting & Analytics:** Dashboard for agents/admins to view ticket trends, performance metrics.
-   **Multi-tenancy:** Support multiple organizations or departments with isolated data.
-   **SLA Management:** Define and track Service Level Agreements.
-   **Public Knowledge Base:** Allow resolved tickets/FAQs to be searchable by public users.
-   **User Avatars/Profiles:** Option to upload profile pictures.
-   **Two-Factor Authentication (2FA):** Enhance login security.
-   **More Robust Error Handling:** Detailed logging, potentially integration with error monitoring services.
-   **Containerization:** Dockerize the application for easier deployment.
-   **Automated Testing:** Unit, integration, and end-to-end tests.

## Contributing

Contributions are welcome! Please feel free to open issues, submit pull requests, or suggest improvements.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details (if you wish to add one).