# SportsConnect Frontend

React frontend for the SportsConnect platform.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── config/          # Configuration files
│   │   └── api.js       # API endpoints
│   ├── context/         # React contexts
│   │   └── AuthContext.jsx
│   ├── layouts/         # Layout components
│   │   ├── MainLayout.jsx
│   │   └── DashboardLayout.jsx
│   ├── pages/           # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Coaches.jsx
│   │   ├── CoachProfile.jsx
│   │   ├── coach/       # Coach dashboard pages
│   │   └── sportif/     # Sportif dashboard pages
│   ├── services/        # API services
│   │   └── api.js       # Axios instance
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── .env.example         # Environment variables template
├── vite.config.js       # Vite configuration
└── package.json
```

## 🎨 Features

### Public Pages
- **Home** - Landing page with hero, features, and stats
- **Coaches** - Coach listing with filters (city, sport, availability)
- **Coach Profile** - Detailed coach profile with booking

### Coach Dashboard
- **Dashboard** - Stats, pending requests, today's sessions
- **Availabilities** - Manage time slots
- **Reservations** - View and manage bookings
- **Settings** - Profile management

### Sportif Dashboard
- **Dashboard** - Stats and upcoming sessions
- **Reservations** - View and cancel bookings
- **Settings** - Profile management

## 🔧 Configuration

### Environment Variables

```env
VITE_API_URL=http://localhost:8000/api
```

## 🛠 Tech Stack

- **React 19** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **date-fns** - Date formatting
- **react-hot-toast** - Toast notifications
- **react-icons** - Icon library
- **Vite** - Build tool

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🌐 API Integration

The frontend connects to the PHP backend API running on `http://localhost:8000/api`.

All API calls are authenticated using JWT tokens stored in localStorage.

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px
