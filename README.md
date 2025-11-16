# 🏨 Hostel Management System

A full-stack web application for managing hostel operations including student registration, room allocation, payment tracking, and complaint management. Built with React, Node.js, Express, and PostgreSQL.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://hostel-management-system-roan.vercel.app/)
[![Backend](https://img.shields.io/badge/backend-render-blue)](https://hostel-management-system-backend-pu9i.onrender.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 🌟 Features

### 👨‍💼 Admin Features
- **Dashboard Analytics**: View real-time statistics for students, rooms, payments, and complaints
- **Student Management**: Add, update, delete, and search student records
- **Room Management**: Manage room allocation, capacity, pricing, and availability
- **Payment Tracking**: Monitor payment status, generate reports, and manage transactions
- **Complaint Management**: View and resolve student complaints with status tracking
- **Report Generation**: Generate sales, occupancy, and financial reports

### 👨‍🎓 Student Features
- **User Registration & Authentication**: Secure sign-up and login system
- **Room Booking**: Browse available rooms and book with real-time availability
- **Payment Management**: Make rent payments online with multiple payment options
- **Complaint System**: Submit and track complaints with status updates
- **Profile Management**: Update personal information and view booking history
- **Order Tracking**: Track booking status from confirmation to check-in

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS 4
- **Routing**: React Router v6
- **State Management**: Context API
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: mySQL (Render)
- **ORM**: Native SQL with pg driver
- **Authentication**: JWT + bcrypt
- **Deployment**: Render

---

## 📁 Project Structure

```
Hostel-Management-System/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── Navbar.jsx
│   │   │   └── ui/
│   │   │       ├── Button.jsx
│   │   │       ├── Input.jsx
│   │   │       └── Card.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Students.jsx
│   │   │   │   ├── Rooms.jsx
│   │   │   │   ├── Payments.jsx
│   │   │   │   └── Complaints.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Rooms.jsx
│   │   │   ├── Payments.jsx
│   │   │   └── Complaints.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── backend/
    ├── config/
    │   └── db.js
    ├── controllers/
    │   ├── admin.controller.js
    │   ├── student.controller.js
    │   ├── room.controller.js
    │   ├── payment.controller.js
    │   └── complaint.controller.js
    ├── routes/
    │   ├── admin.route.js
    │   ├── student.route.js
    │   ├── room.route.js
    │   ├── payment.route.js
    │   └── complaint.route.js
    ├── middleware/
    │   └── auth.js
    ├── database/
    │   ├── schema.sql
    │   ├── seeds.sql
    │   └── initDB.js
    ├── utils/
    │   └── dbHelper.js
    ├── server.js
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/batman-rises/Hostel-Management-System.git
cd Hostel-Management-System
```

#### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
# Server Configuration
PORT=5000
HOST=0.0.0.0
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/hostel_management

# JWT Secret
JWT_SECRET=your_super_secret_key

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

Initialize the database:
```bash
npm run db:init   # Creates tables
npm run db:seed   # Seeds sample data
```

Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

#### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 🗄️ Database Schema

### Tables
- **admins**: Admin user accounts and authentication
- **students**: Student records with personal and contact information
- **rooms**: Room details including capacity, pricing, and availability
- **payments**: Payment transactions and history
- **complaints**: Student complaints with status tracking

### Key Relationships
- Students → Rooms (Many-to-One)
- Payments → Students (Many-to-One)
- Complaints → Students (Many-to-One)

---

## 📡 API Endpoints

### Authentication
```
POST   /api/admin/login          # Admin login
POST   /api/admin/register       # Admin registration
POST   /api/students/login       # Student login
POST   /api/students/register    # Student registration
GET    /api/admin/profile        # Get admin profile
GET    /api/students/me          # Get student profile
```

### Admin Endpoints
```
GET    /api/admin/dashboard      # Dashboard statistics
GET    /api/admin/students       # Get all students
GET    /api/admin/rooms          # Get all rooms
GET    /api/admin/payments       # Get all payments
GET    /api/admin/complaints     # Get all complaints
PUT    /api/admin/rooms/:id      # Update room status
PUT    /api/admin/complaints/:id # Update complaint status
```

### Student Endpoints
```
GET    /api/rooms                # Get available rooms
POST   /api/rooms/:id/book       # Book a room
GET    /api/payments/student/:id # Get student payments
POST   /api/payments/pay         # Make a payment
POST   /api/complaints           # Submit a complaint
```

---

## 🔐 Authentication & Authorization

### JWT-Based Authentication
- **Token Generation**: Upon successful login, a JWT token is generated
- **Token Storage**: Token stored in localStorage on client-side
- **Protected Routes**: Middleware validates JWT for protected endpoints
- **Role-Based Access**: Separate authentication for admin and student roles

### Password Security
- Passwords hashed using **bcrypt** (10 salt rounds)
- Password strength validation (min 8 chars, uppercase, number, special char)

---

## 🎨 UI/UX Highlights

### Design Features
- **Responsive Design**: Mobile-first approach, works on all devices
- **Modern UI**: Clean, intuitive interface with Tailwind CSS
- **Smooth Animations**: Framer Motion for delightful interactions
- **Dark Theme**: Professional color scheme with primary green (#10b981)
- **Loading States**: Skeleton loaders and spinners for better UX
- **Error Handling**: User-friendly error messages and validation

### Key Components
- Reusable UI components (Button, Input, Card)
- Role-based navigation (Admin vs Student views)
- Real-time cart updates with localStorage persistence
- Multi-step checkout process
- Interactive dashboard with statistics

---

## 🌐 Deployment

### Production Deployment

#### Frontend (Vercel)
```bash
# Build for production
cd frontend
npm run build

# Deploy to Vercel (automatic via GitHub)
# Connected to: https://hostel-management-system-roan.vercel.app
```

#### Backend (Render)
```bash
# Connected to: https://hostel-management-system-backend-pu9i.onrender.com
# Auto-deploys from main branch
```

#### Database (Render PostgreSQL)
- Free tier PostgreSQL instance
- Persistent storage with external access
- Automatic backups

### Environment Variables

**Vercel (Frontend)**:
```
VITE_API_URL=https://hostel-management-system-backend-pu9i.onrender.com/api
```

**Render (Backend)**:
```
NODE_ENV=production
PORT=10000
HOST=0.0.0.0
DATABASE_URL=<Render_PostgreSQL_URL>
JWT_SECRET=<production_secret>
FRONTEND_URL=https://hostel-management-system-roan.vercel.app
```

---

## 🧪 Testing

### Test Accounts

**Admin Login:**
```
Email: admin@example.com
Password: Admin@123
```

**Student Login:**
```
Email: test@gmail.com
Password: 123
```

---

## 📊 Features Roadmap

### Current Features ✅
- User authentication (Admin & Student)
- Room browsing and booking
- Payment processing and tracking
- Complaint management system
- Admin dashboard with analytics

### Upcoming Features 🚧
- [ ] Email notifications for bookings and payments
- [ ] PDF invoice generation
- [ ] Advanced search and filters
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Real-time chat support
- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Automated reminder system
- [ ] Hostel mess management

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Use ES6+ JavaScript features
- Follow React best practices and hooks patterns
- Write clean, maintainable code with comments
- Use meaningful variable and function names
- Format code with Prettier before committing

---

## 🐛 Known Issues

- **Cold Start Delay**: Render free tier spins down after inactivity (~30s first load)
- **Session Timeout**: JWT tokens expire after 7 days
- **Database Limit**: Free tier database expires after 90 days (can be renewed)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Batman Rises**

- GitHub: [@batman-rises](https://github.com/batman-rises)
- Project Link: [https://github.com/batman-rises/Hostel-Management-System](https://github.com/batman-rises/Hostel-Management-System)
- Live Demo: [https://hostel-management-system-roan.vercel.app/](https://hostel-management-system-roan.vercel.app/)

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [Express](https://expressjs.com/) - Backend framework
- [mySQL](https://www.postgresql.org/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Render](https://render.com/) - Backend hosting
- [Vercel](https://vercel.com/) - Frontend hosting
- [Lucide Icons](https://lucide.dev/) - Icon library
- [Framer Motion](https://www.framer.com/motion/) - Animation library

---

## 📞 Support

For support, email batman.rises@example.com or open an issue in the repository.

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by Batman Rises

</div>
