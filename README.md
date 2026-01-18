# GreenEnergy Management Platform

A smart web-based Energy Management Platform that analyzes electricity consumption and provides intelligent recommendations to reduce energy waste.

## 🌟 Features

- **Smart Dashboard** with real-time energy consumption visualizations
- **AI-Powered Analytics** for consumption prediction and anomaly detection
- **Personalized Recommendations** for energy savings
- **Multi-User Support** (Companies, Households, Individuals)
- **Budget Tracking** and cost analysis
- **PDF Reports** generation
- **Real-time Alerts** for unusual consumption patterns

## 🏗️ Project Structure

```
GreenEnergy/
├── frontend/          # React + TypeScript + Vite frontend
│   ├── src/
│   ├── package.json
│   └── README.md     # Frontend deployment guide
├── backend/           # Node.js + Express + Prisma backend
│   ├── src/
│   ├── prisma/
│   └── package.json
└── README.md         # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. **Clone the repository**:

   ```bash
   git clone <your-repo-url>
   cd GreenEnergy
   ```

2. **Install root dependencies** (for running both frontend and backend):

   ```bash
   npm install
   ```

3. **Install frontend dependencies**:

   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Set up environment variables**:
   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/greenenergy?schema=public"
   JWT_SECRET="your-secret-key"
   PORT=5000
   NODE_ENV=development
   ```

5. **Set up the database**:
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   cd ..
   ```

### Running the Application

**Development mode** (runs both frontend and backend):

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

**Backend only**:

```bash
npm run start-backend
```

**Frontend only**:

```bash
cd frontend
npm run dev
```

## 📦 Building for Production

### Frontend

```bash
cd frontend
npm run build
```

### Backend

```bash
npm run build
```

## 🌐 Deployment

### Frontend Deployment (Vercel)

The frontend is configured for easy deployment to Vercel. See [frontend/README.md](frontend/README.md) for detailed instructions.

**Quick deploy**:

```bash
cd frontend
vercel --prod
```

### Backend Deployment

The backend can be deployed to any Node.js hosting service (Render, Railway, Heroku, etc.).

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **React Router** - Routing
- **Axios** - HTTP client

### Backend

- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 📄 License

ISC

## 👥 Authors

GreenEnergy Team
