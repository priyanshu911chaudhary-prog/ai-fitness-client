import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Dashboard from './pages/dashboard/Dashboard';
import Meals from './pages/meals/Meals';
import CreateMeal from './pages/meals/CreateMeal';
import Workouts from './pages/workouts/Workouts';
import CreateWorkout from './pages/workouts/CreateWorkout';
import AIWorkoutGenerator from './pages/workouts/AIWorkoutGeneratr';
import AIMealGenerator from './pages/meals/AIMealGenerator';
import Profile from './pages/dashboard/Profile';

import Landing from './pages/Landing';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-emerald-500/30 text-zinc-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute />}>
          {/* All routes inside here require an accessToken */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          
          <Route path="/workouts">
            <Route index element={<Workouts />} />
            <Route path="create" element={<CreateWorkout />} />
            <Route path="generate" element={<AIWorkoutGenerator />} />
            <Route path=":id" element={<div>Workout Details</div>} />
          </Route>

          <Route path="/meals">
            <Route index element={<Meals />} />
            <Route path="create" element={<CreateMeal />} />
            <Route path="generate" element={<AIMealGenerator />} />
            <Route path=":id" element={<div>Meal Details</div>} />
          </Route>
        </Route>

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}