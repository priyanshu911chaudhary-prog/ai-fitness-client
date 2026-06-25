import { NavLink, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, Utensils, Settings, LogOut, BrainCircuit } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Workouts', path: '/workouts', icon: Dumbbell },
    { name: 'Meals', path: '/meals', icon: Utensils },
  ];

  const handleLogout = async () => {
    try {
      await import('../../utils/api').then(({ api }) => api.post('/auth/logout'));
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <aside className="flex h-dvh w-64 flex-col border-r border-white/5 bg-black/60 p-6 backdrop-blur-2xl shadow-2xl">
      <div className="mb-10 flex items-center gap-2">
        <BrainCircuit className="h-7 w-7 text-white shrink-0" />
        <span className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          AIFit
        </span>
      </div>

      <nav className="flex-1 space-y-3">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                isActive 
                  ? 'bg-white/10 text-white shadow-[inset_4px_0_0_rgba(255,255,255,1)]' 
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-2 border-t border-white/5 pt-6">
        <Link to="/profile" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white hover:translate-x-1 transition-all duration-300">
          <Settings className="h-5 w-5 shrink-0" />
          Settings
        </Link>
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-zinc-400 hover:bg-red-500/10 hover:text-red-400 hover:translate-x-1 transition-all duration-300"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Log Out
        </button>
      </div>
    </aside>
  );
}