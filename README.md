# FocusCircle

FocusCircle is a full‑stack productivity and community management app where users can manage tasks, collaborate in small groups, and track shared goals securely.

## Features

- **Authentication**: Secure register/login with JWT.
- **Personal Tasks**: Create, update, and delete personal tasks.
- **Communities**: Create and join micro-communities.
- **Shared Tasks**: Collaborative task management within communities.

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Frontend**: React.js (Vite), Tailwind CSS
- **Icons**: Lucide-React
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js
- MongoDB (or MongoDB Atlas)

### Setup

1. **Clone the repository**
2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create a .env file based on the provided backend/.env
   npm start
   ```
3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Development

The backend runs on `http://localhost:5000` and the frontend on `http://localhost:5173`.
