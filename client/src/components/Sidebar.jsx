import { BookOpen, MessageCircle, Upload, User, LogOut, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const navItems = [
  { label: 'Chat', tab: 'chat', icon: <MessageCircle className="w-6 h-6" />, path: '/dashboard' },
  { label: 'Uploads', tab: 'upload', icon: <Upload className="w-6 h-6" />, path: '/dashboard?tab=upload' },
  { label: 'FlashCards', tab: 'flashcards', icon: <Brain className="w-6 h-6" />, path: '/flashcards' },
  { label: 'Profile', tab: 'profile', icon: <User className="w-6 h-6" />, path: '/dashboard?tab=profile' },
];

export default function Sidebar({ activeTab, onTabChange }) {
  const navigate = useNavigate();
  return (
    <aside className="fixed top-0 left-0 h-screen w-20 bg-gradient-to-b from-slate-900/80 to-purple-900/80 backdrop-blur-xl border-r border-gray-700/40 flex flex-col items-center py-6 z-50 shadow-2xl">
      <div className="mb-10 flex flex-col items-center">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-2">
          <BookOpen className="w-7 h-7 text-white" />
        </div>
        <span className="text-xs text-gray-300 font-bold tracking-widest">UniDash</span>
      </div>
      <nav className="flex flex-col gap-8 flex-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 hover:bg-blue-500/20 focus:outline-none ${activeTab === item.tab ? 'bg-blue-500/30 shadow-lg' : ''} text-gray-300 hover:text-white`}
            onClick={() => {
              onTabChange && onTabChange(item.tab);
              navigate(item.path);
            }}
            aria-label={item.label}
            title={item.label}
          >
            {item.icon}
          </button>
        ))}
      </nav>
      <div className="mt-auto flex flex-col items-center gap-4">
        <button
          className="flex items-center justify-center w-12 h-12 rounded-xl hover:bg-red-500/20 transition-all duration-200"
          onClick={async () => {
            try {
              await axios.post('/api/auth/logout', {}, { withCredentials: true });
            } catch (_) {}
            navigate('/login');
          }}
          aria-label="Logout"
          title="Logout"
        >
          <LogOut className="w-6 h-6 text-red-400" />
        </button>
      </div>
    </aside>
  );
}