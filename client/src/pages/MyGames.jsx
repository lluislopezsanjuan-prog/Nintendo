import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { searchGames } from '../services/rawg';

function MyGames() {
    const [myGames, setMyGames] = useState([]);
    const [title, setTitle] = useState('');
    const { user } = useAuth();

    // Lending Modal State
    const [isLendModalOpen, setIsLendModalOpen] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);
    const [users, setUsers] = useState([]);
    const [borrowerId, setBorrowerId] = useState('');
    const [days, setDays] = useState(7);

    // RAWG Search State
    const [searchResults, setSearchResults] = useState([]);
    const [imageUrl, setImageUrl] = useState('');
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        loadMyGames();
    }, []);

    const loadMyGames = async () => {
        try {
            const res = await api.get('/games'); // This gets ALL games. We need to filter or have a specific endpoint.
            // For MVP, filtering on client or adding endpoint. Let's filter on client (inefficient but works for small scale)
            // Ideally backend should have /games/mine or filters.
            // Wait, the Home page uses GET /games. Let's just filter here for now.

            // Actually, let's just create a new endpoint or filter here. 
            // In a real app, I'd update backend. Here, I'll filter client side for speed if I don't want to touch backend again.
            // But I have power. I can touch backend.
            // However, looking at my backend code: GET /games returns all games with owner_name.
            // I can filter by owner_id === user.id
            const allGames = res.data;
            const mine = allGames.filter(g => g.owner_id === user.id);
            setMyGames(mine);
        } catch (error) {
            console.error(error);
        }
    };

    const openLendModal = async (game) => {
        setSelectedGame(game);
        try {
            const res = await api.get('/users');
            setUsers(res.data);
            setIsLendModalOpen(true);
        } catch (error) {
            console.error("Failed to load users", error);
        }
    };

    const handleLend = async (e) => {
        e.preventDefault();
        try {
            await api.post('/loans/lend', {
                gameId: selectedGame.id,
                borrowerId,
                days
            });
            setIsLendModalOpen(false);
            setBorrowerId('');
            setDays(7);
            loadMyGames();
        } catch (error) {
            console.error("Failed to lend game", error);
        }
    };

    const handleAddGame = async (e) => {
        e.preventDefault();
        try {
            await api.post('/games', { title, image_url: imageUrl });
            setTitle('');
            setImageUrl('');
            setShowResults(false);
            loadMyGames();
        } catch (error) {
            console.error('Error adding game', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/games/${id}`);
            loadMyGames();
        } catch (error) {
            console.error('Error deleting game', error);
        }
    };

    const handleReturn = async (gameId) => {
        try {
            await api.put(`/loans/game/${gameId}/return`);
            loadMyGames();
        } catch (error) {
            console.error('Error al marcar como devuelto', error);
        }
    };

    return (
        <div className="py-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Library</h1>
                    <p className="text-gray-500 mt-2">Manage your collection of games</p>
                </div>

                <form onSubmit={handleAddGame} className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow min-w-[300px]">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🎮</span>
                        <input
                            type="text"
                            placeholder="Game Title (e.g. Zelda, Mario...)"
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition shadow-sm"
                            value={title}
                            onChange={async (e) => {
                                setTitle(e.target.value);
                                if (e.target.value.length > 2) {
                                    const results = await searchGames(e.target.value);
                                    setSearchResults(results);
                                    setShowResults(true);
                                } else {
                                    setSearchResults([]);
                                    setShowResults(false);
                                }
                            }}
                            onBlur={() => setTimeout(() => setShowResults(false), 200)}
                            onFocus={() => { if (title.length > 2) setShowResults(true); }}
                            required
                        />
                        {showResults && searchResults.length > 0 && (
                            <div className="absolute z-10 w-full bg-white mt-1 rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto">
                                {searchResults.map(game => (
                                    <div
                                        key={game.id}
                                        className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition"
                                        onClick={() => {
                                            setTitle(game.name);
                                            setImageUrl(game.background_image);
                                            setShowResults(false);
                                        }}
                                    >
                                        {game.background_image && (
                                            <img src={game.background_image} alt={game.name} className="w-10 h-10 object-cover rounded-lg" />
                                        )}
                                        <span className="font-medium text-gray-700">{game.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-2xl transition duration-300 shadow-lg whitespace-nowrap">
                        Add Game
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myGames.length === 0 ? (
                    <div className="col-span-full py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-center">
                        <span className="text-6xl mb-4 block">📦</span>
                        <p className="text-gray-400 font-medium text-lg">Your library is empty. Start adding games!</p>
                    </div>
                ) : (
                    myGames.map(game => (
                        <div key={game.id} className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">

                            {/* Card Image */}
                            <div className="h-48 w-full relative bg-gray-200 overflow-hidden">
                                {game.image_url ? (
                                    <img src={game.image_url} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-300">
                                        🎮
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${game.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {game.status}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 flex-grow flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-red-600 transition line-clamp-2 mb-1">{game.title}</h3>
                                    <button
                                        onClick={() => handleDelete(game.id)}
                                        className="text-gray-300 hover:text-red-500 transition-colors ml-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-gray-500 text-sm mb-4">{game.platform || 'Nintendo Switch'}</p>

                                <div className="mt-auto pt-6 border-t border-gray-50">
                                    {game.status === 'loaned' && (
                                        <button
                                            onClick={() => handleReturn(game.id)}
                                            className="w-full bg-blue-50 text-blue-600 py-2 rounded-xl text-sm font-bold hover:bg-blue-100 transition"
                                        >
                                            Marcar como Devuelto
                                        </button>
                                    )}
                                    {game.status === 'available' && (
                                        <button
                                            onClick={() => openLendModal(game)}
                                            className="w-full bg-red-50 text-red-600 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition flex items-center justify-center gap-2"
                                        >
                                            <span>📤 Prestar a Amigo</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Lend Modal */}
            {isLendModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900">
                            Lend <span className="text-red-600">{selectedGame?.title}</span>
                        </h2>

                        <form onSubmit={handleLend} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Select Friend</label>
                                <select
                                    value={borrowerId}
                                    onChange={(e) => setBorrowerId(e.target.value)}
                                    className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                    required
                                >
                                    <option value="">Choose a user...</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.username}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Duration (Days)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={days}
                                    onChange={(e) => setDays(e.target.value)}
                                    className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsLendModalOpen(false)}
                                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg"
                                >
                                    Confirm Loan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyGames;
