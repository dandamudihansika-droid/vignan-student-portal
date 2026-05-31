# Vignan Student Life Analysis Portal

A comprehensive full-stack web application for Vignan University students to track and analyze their academic performance, study habits, and well-being.

## Features

### Student Portal
- **Authentication**: Vignan ID format login (241fa0XXXX, 251fa0XXXX, etc.)
- **Study Timer**: Track study sessions with concentration analysis
- **Academic Tracking**: Monitor attendance, internal marks, and semester performance
- **Sleep Analysis**: Personalized sleep schedule tips and recommendations
- **Data Visualization**: Comparative analysis across semesters

### Technology Stack

#### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- bcrypt for password hashing
- CORS for API security

#### Frontend
- React 18 with TypeScript
- TailwindCSS for styling
- shadcn/ui components
- Chart.js for data visualization
- React Router for navigation

## Project Structure

```
student-life-analysis/
|-- backend/
|   |-- src/
|   |   |-- controllers/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- middleware/
|   |   |-- utils/
|   |   |-- config/
|   |   `-- app.js
|   |-- package.json
|   `-- .env
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- hooks/
|   |   |-- services/
|   |   |-- utils/
|   |   `-- App.tsx
|   |-- package.json
|   `-- public/
`-- README.md
```

## Installation

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Student ID Format

The system follows Vignan University's student ID format:
- **241fa0XXXX**: 2024-2028 batch
- **251fa0XXXX**: 2025-2029 batch
- **261fa0XXXX**: 2026-2030 batch

Password is set as the student ID by default for first-time login.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - Student login
- `GET /api/auth/profile` - Get student profile

### Study Timer
- `POST /api/study/session` - Start/stop study session
- `GET /api/study/sessions` - Get study history
- `GET /api/study/analytics` - Get concentration analysis

### Academics
- `GET /api/academics/attendance` - Get attendance data
- `GET /api/academics/marks` - Get marks and performance
- `POST /api/academics/attendance` - Update attendance

### Sleep Analysis
- `GET /api/sleep/recommendations` - Get sleep tips
- `POST /api/sleep/schedule` - Update sleep schedule

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student-life-analysis
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
