import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(username, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-red-600 to-red-900">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 transform transition-all hover:scale-105 duration-300">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-red-600 mb-2">Switch Loans</h1>
                    <p className="text-gray-500">Welcome back!</p>
                </div>

                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition duration-300 shadow-lg">
                        Sign In
                    </button>
                </form>
                <div className="mt-6 text-center text-sm">
                    <p className="text-gray-600">
                        Don't have an account? <Link to="/register" className="text-red-600 font-bold hover:underline">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
