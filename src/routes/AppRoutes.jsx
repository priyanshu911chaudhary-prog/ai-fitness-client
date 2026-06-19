import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import Dashboard from "../pages/dashboard/Dashboard";
import Workouts from "../pages/workouts/Workouts";
import Meals from "../pages/meals/Meals";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/workouts" element={<Workouts />} />
                <Route path="/meals" element={<Meals />} />
            </Routes>
        </BrowserRouter>
    );
}