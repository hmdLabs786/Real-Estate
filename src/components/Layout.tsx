import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Calendar, User, LayoutDashboard, LogIn, LogOut, MessageSquare } from 'lucide-react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const location = useLocation();

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Properties', path: '/properties', icon: Search },
    { name: 'My Bookings', path: '/bookings', icon: Calendar, protected: true },
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, adminOnly: true },
  ];

  // Admin check (simple for now)
  const isAdmin = user?.email === 'habban.madani786@gmail.com';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="h-16 border-b border-slate-200 bg-white flex items-center sticky top-0 z-40 px-6 shrink-0 shadow-sm">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight">KarachiProperty<span className="text-blue-600">Hub</span></h1>
            </Link>
            <span className="ml-4 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-wider hidden sm:inline-block">Agent Enterprise v2.4</span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              if (item.protected && !user) return null;
              if (item.adminOnly && !isAdmin) return null;
              
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-xs font-bold uppercase tracking-widest transition-colors hover:text-blue-600 ${
                    isActive ? 'text-blue-600' : 'text-slate-500'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
            
            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                <div className="flex flex-col items-end">
                  <p className="text-[10px] font-bold leading-none">{user.displayName}</p>
                  <p className="text-[9px] text-slate-400">Authorized User</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-full h-full p-2 text-slate-500" />
                  )}
                </div>
                <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-white border-t border-[#141414]/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-[#141414] rounded flex items-center justify-center">
                  <span className="text-white font-bold text-[10px] uppercase">KE</span>
                </div>
                <span className="font-bold tracking-tight uppercase">Karachi Estates</span>
              </div>
              <p className="text-sm text-[#141414]/60 max-w-xs">
                Modern real estate management solution for Karachi's primary areas. 
                Providing verified listings and smart lead filtering.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Areas</h4>
              <ul className="text-sm text-[#141414]/60 space-y-2 uppercase tracking-wide">
                <li>DHA Karachi</li>
                <li>Clifton</li>
                <li>Bahria Town</li>
                <li>Gulshan-e-Iqbal</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Contact</h4>
              <ul className="text-sm text-[#141414]/60 space-y-2 uppercase tracking-wide">
                <li>info@karachiestates.com</li>
                <li>+92 21 34567890</li>
                <li>Phase 6, DHA, Karachi</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-[#141414]/5 text-[10px] text-[#141414]/40 uppercase tracking-widest text-center">
            © 2026 Karachi Estates. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
