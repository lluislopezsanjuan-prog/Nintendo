import { useEffect, useState } from 'react';
import api from '../api';

function Home() {
    const [games, setGames] = useState([]);

    useEffect(() => {
        loadGames();
    }, []);

    const loadGames = async () => {
        try {
            const res = await api.get('/games');
            setGames(res.data);
        } catch (error) {
            console.error('Failed to load games', error);
        }
    };

    const handleBorrow = async (gameId) => {
        try {
            await api.post('/loans', { gameId });
            loadGames(); // Refresh
        } catch (error) {
            console.error(error.response?.data?.message || 'Failed to borrow');
        }
    };

    return (
        <div className="py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Available Games</h1>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {games.length} games listed
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {games.map(game => (
                    <div key={game.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                        <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
                            {/* Placeholder for game art */}
                            <span className="text-6xl opacity-20">🎮</span>
                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${game.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {game.status}
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-1 text-gray-900 group-hover:text-red-600 transition">{game.title}</h3>
                            <p className="text-gray-500 text-sm mb-4">Owner: <span className="font-medium text-gray-700">{game.owner_name}</span></p>

                            {game.status === 'available' ? (
                                <button
                                    onClick={() => handleBorrow(game.id)}
                                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors duration-300 flex items-center justify-center gap-2"
                                >
                                    <span>Borrow Game</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0 1 1 0 002 0z" />
                                    </svg>
                                </button>
                            ) : (
                                <button disabled className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl font-bold cursor-not-allowed border border-gray-200">
                                    Currently Loaned
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;
