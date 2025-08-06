# ⚙️ LIMS Inventory Management System

A full-stack, MERN-based inventory management solution designed to streamline component tracking in labs and technical environments. This system features real-time monitoring, low-stock alerts, user role-based access, and in-app/email notifications.

---

## 🌐 Live Demo
🚀 **[View Live Application](https://f1lims.netlify.app/)**



## 🚀 Features

### 📦 Inventory Management
- Add, edit, delete, and search components
- Support for categories, tags, location bins, part numbers, datasheet links
- Track unit price, quantities, suppliers, and images

### 🔔 Notifications
- **In-app notifications** for low stock, stale stock, and inventory changes
- **Automated email alerts** for critical stock conditions using NodeMailer

### 🔍 Smart Stock Monitoring
- Automatically flags **low stock** (below critical threshold)
- Detects **stale stock** (unused in last 90+ days)
- Color-coded priorities and expiration for alerts

### 📊 Logs & Audit Trail
- Full transaction history (inward, outward, adjustments)
- Stores supplier invoice, batch ID, project association, etc.
- Timestamped by user and action

### 👥 User & Role Management
- Authentication with **JWT**
- Role-based access: Admin, Lab Technician, Researcher, Engineer
- Password encryption using **bcrypt**

### 📚 Categorization System
- Dynamic category schema with color/icon and activation toggle
- Linked directly to component model

### 🛠️ Tech Stack
- **Frontend**: React.js + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **Auth**: JWT
- **Email**: NodeMailer (Gmail SMTP)
- **Notifications**: In-app + Email
- **Dev Tools**: Nodemon, concurrently, dotenv

---

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/your-username/lims-inventory.git
cd lims-inventory
```

### 2. Install dependencies
```bash
cd frontend
npm install
cd server
npm install
```

### 3. Set up environment variables
Create a `.env` file inside the `server` directory with the following:
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/lims_inventory

# JWT configuration
JWT_SECRET=drftgyhujiklcfgvbhnjhihjkihkjhibgiugih
JWT_EXPIRES_IN=7d

# Frontend URL (used in CORS and emails)
FRONTEND_URL=http://localhost:5173

# Email (NodeMailer Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server
PORT=5000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```
> ⚠️ Make sure your Gmail account allows app-specific passwords and has "Less secure app access" enabled or use Gmail App Password.

### 4. Run the full stack (frontend + backend)
In the root directory:
```bash
npm run dev
```
This will:
- Start the backend on [http://localhost:5000](http://localhost:5000)
- Start the frontend (Vite) on [http://localhost:5173](http://localhost:5173)

---

## 🔗 API Overview

## 🗂️ Full API Endpoints

### 🔐 Authentication Routes (`/api/auth`)
- `POST /api/auth/register` — Register new user (Admin only)
- `POST /api/auth/login` — User login
- `GET /api/auth/profile` — Get current user profile
- `PUT /api/auth/profile` — Update user profile
- `PUT /api/auth/change-password` — Change user password
- `GET /api/auth/users` — Get all users with pagination (Admin only)
- `PUT /api/auth/users/:id` — Update user (Admin only)
- `DELETE /api/auth/users/:id` — Delete user (Admin only)

### 🧪 Component Management Routes (`/api/components`)
- `GET /api/components` — Get all components with filtering and pagination
- `GET /api/components/:id` — Get component by ID with logs
- `POST /api/components` — Create new component
- `PUT /api/components/:id` — Update component
- `DELETE /api/components/:id` — Delete component
- `POST /api/components/:id/inward` — Record inward stock movement
- `POST /api/components/:id/outward` — Record outward stock movement
- `POST /api/components/:id/adjust` — Adjust stock quantity
- `GET /api/components/:id/logs` — Get component activity logs
- `GET /api/components/categories/list` — Get all categories
- `GET /api/components/locations/list` — Get all locations

### 🔔 Notification Routes (`/api/notifications`)
- `GET /api/notifications` — Get user notifications with pagination
- `GET /api/notifications/unread-count` — Get unread notification count
- `POST /api/notifications/:id/read` — Mark notification as read
- `POST /api/notifications/mark-all-read` — Mark all notifications as read

### 🤖 Chatbot Routes (`/api/chatbot`)
- `POST /api/chatbot/chat` — Send message to chatbot
- `GET /api/chatbot/history` — Get chat history

### 📊 Analytics Routes (`/api/analytics`)
- `GET /api/analytics/dashboard` — Get dashboard statistics
- `GET /api/analytics/trends` — Get inventory trends data
- `GET /api/analytics/top-components` — Get top components by usage
- `GET /api/analytics/user-activity` — Get user activity analytics
- `GET /api/analytics/health-score` — Get inventory health score
- `GET /api/analytics/export` — Export analytics data

### 📤 Export Routes (`/api/export`)
- `GET /api/export/components` — Export components to CSV
- `GET /api/export/logs` — Export activity logs to CSV
- `GET /api/export/low-stock` — Export low stock components to CSV
- `GET /api/export/stale-stock` — Export stale stock components to CSV
- `GET /api/export/valuation` — Export inventory valuation to CSV
- `GET /api/export/users` — Export users to CSV

### 🌐 Public Routes (`/api/public`)
- `GET /api/public/components` — Get components (public access)
- `GET /api/public/categories` — Get categories (public access)
- `GET /api/public/stats` — Get basic statistics (public access)

### 🏥 System Routes
- `GET /api/health` — Health check endpoint

---
---

## 🖥️ User Roles (Sample for Testing)

| Role          | Access                                |
| ------------- | ------------------------------------- |
| **Admin**     | Full access, user management          |
| **Lab Technician** | Add/update stock                 |
| **Researcher**    | View inventory, request stock     |
| **Engineer**      | Partial access to stock           |



---

## 🏗️ Project Structure
```
lims-inventory/
├── client/         # React frontend
├── server/         # Node/Express backend
│   ├── models/     # Mongoose schemas
│   ├── middlewares/ # Middlewares
│   ├── routes/     # API routes
│   ├── controllers/
│   ├── utils/      # Nodemailer, StockChecker
│   └── .env        # Env vars
└── README.md
```

---

## 📈 Future Improvements

- QR code support for components
- Real-time WebSocket notifications
- Component request/approval system
- PDF invoice generation and export

---

## 🧠 Contributing

Contributions are welcome! Please create an issue first to discuss your proposed change.

---

## 📄 License

This project is licensed under the MIT License.

---

