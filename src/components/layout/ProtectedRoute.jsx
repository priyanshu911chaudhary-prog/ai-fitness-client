import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function ProtectedRoute() {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('accessToken');

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-zinc-950 p-6 md:p-8">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}