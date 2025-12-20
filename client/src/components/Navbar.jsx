import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <nav className="bg-gradient-to-r from-red-700 to-red-600 text-white p-4 shadow-lg sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-extrabold tracking-tight hover:text-red-100 transition">
                    Nintendo<span className="text-red-200">Loans</span>
                </Link>
                <div className="flex items-center gap-6">
                    <Link to="/" className="hover:text-red-200 transition font-medium">Home</Link>
                    <Link to="/my-games" className="hover:text-red-200 transition font-medium">My Games</Link>
                    <Link to="/loans" className="hover:text-red-200 transition font-medium">Loans</Link>
                    <div className="flex items-center gap-4 ml-4 pl-4 border-l border-red-500">
                        <span className="font-semibold text-sm">Hi, {user.username}</span>
                        <button
                            onClick={logout}
                            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-bold transition backdrop-blur-sm border border-white/20"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
