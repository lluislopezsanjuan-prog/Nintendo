import { useEffect, useState } from 'react';
import api from '../api';

function Loans() {
    const [borrowed, setBorrowed] = useState([]);
    const [lent, setLent] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const getDaysRemaining = (returnDate) => {
        if (!returnDate) return null;
        const now = new Date();
        const due = new Date(returnDate);
        const diffTime = due - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const loadData = async () => {
        try {
            const resBorrowed = await api.get('/loans/borrowed');
            setBorrowed(resBorrowed.data);
            try {
                const resLent = await api.get('/loans/lent');
                setLent(resLent.data);
            } catch (e) {
                console.error("Failed to load lent games", e);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleReturn = async (loanId) => {
        try {
            await api.put(`/loans/${loanId}/return`);
            loadData();
        } catch (error) {
            console.error('Error returning game', error);
        }
    };

    return (
        <div className="py-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-10 tracking-tight text-center">Loan Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Borrowed Column */}
                <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl">📥</div>
                        <h2 className="text-2xl font-bold text-gray-800">Borrowed Games</h2>
                    </div>

                    {borrowed.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                            <p className="text-gray-400">You haven't borrowed any games yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {borrowed.map(loan => (
                                <div key={loan.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex justify-between items-center hover:shadow-md transition">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{loan.title}</h3>
                                        <div className="flex flex-col">
                                            <p className="text-gray-500 text-sm">From: <span className="font-semibold">{loan.owner_name}</span></p>
                                            {loan.status === 'active' && loan.return_date && (
                                                <p className={`text-sm font-bold mt-1 ${getDaysRemaining(loan.return_date) < 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                                    {getDaysRemaining(loan.return_date)} days remaining
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${loan.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                        {loan.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Lent Column */}
                <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl">📤</div>
                        <h2 className="text-2xl font-bold text-gray-800">Lent Games</h2>
                    </div>

                    {lent.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                            <p className="text-gray-400">You haven't lent any games yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {lent.filter(l => l.status === 'active').map(loan => (
                                <div key={loan.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{loan.title}</h3>
                                        <p className="text-gray-500 text-sm">To: <span className="font-semibold">{loan.borrower_name}</span></p>
                                    </div>
                                    <button
                                        onClick={() => handleReturn(loan.id)}
                                        className="bg-gray-900 hover:bg-red-600 text-white px-6 py-2 rounded-2xl text-sm font-bold transition duration-300 shadow-lg"
                                    >
                                        Mark Returned
                                    </button>
                                </div>
                            ))}

                            {lent.filter(l => l.status === 'returned').length > 0 && (
                                <div className="mt-10 pt-8 border-t border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Past Activity</h3>
                                    <div className="space-y-2">
                                        {lent.filter(l => l.status === 'returned').map(loan => (
                                            <div key={loan.id} className="flex justify-between items-center text-sm text-gray-500 bg-white/50 px-4 py-2 rounded-xl">
                                                <span>{loan.title} returned by {loan.borrower_name}</span>
                                                <span className="text-[10px] font-bold text-gray-300">COMPLETED</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Loans;
