import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Dashboard from './pages/dashboard/Dashboard';
import Meals from './pages/meals/Meals';
import CreateMeal from './pages/meals/CreateMeal';
import Workouts from './pages/workouts/Workouts';
import CreateWorkout from './pages/workouts/CreateWorkout';
import AIWorkoutGenerator from './pages/workouts/AIWorkoutGeneratr';
import WorkoutDetail from './pages/workouts/WorkoutDetail';
import AIMealGenerator from './pages/meals/AIMealGenerator';
import MealDetail from './pages/meals/MealDetail';
import Profile from './pages/dashboard/Profile';

import Landing from './pages/Landing';

export default function App() {
  return (
    <div className="min-h-screen bg-black font-sans selection:bg-white/20 text-white">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/verify email/:token" element={<VerifyEmail />} />
        <Route path="/verify%20email/:token" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset password/:token" element={<ResetPassword />} />
        <Route path="/reset password" element={<ResetPassword />} />
        <Route path="/reset%20password/:token" element={<ResetPassword />} />
        <Route path="/reset%20password" element={<ResetPassword />} />
        
        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute />}>
          {/* All routes inside here require an accessToken */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          
          <Route path="/workouts">
            <Route index element={<Workouts />} />
            <Route path="create" element={<CreateWorkout />} />
            <Route path="generate" element={<AIWorkoutGenerator />} />
            <Route path=":id" element={<WorkoutDetail />} />
          </Route>

          <Route path="/meals">
            <Route index element={<Meals />} />
            <Route path="create" element={<CreateMeal />} />
            <Route path="generate" element={<AIMealGenerator />} />
            <Route path=":id" element={<MealDetail />} />
          </Route>
        </Route>

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}