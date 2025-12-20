function OverdueModal({ overdueLoans }) {
    if (!overdueLoans || overdueLoans.length === 0) return null;

    return (
        <div className="fixed inset-0 bg-red-900/90 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border-4 border-red-600 animate-pulse-border text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-5xl">⚠️</span>
                </div>

                <h2 className="text-3xl font-extrabold text-red-600 mb-2 uppercase tracking-wide">
                    Overdue Games!
                </h2>
                <p className="text-gray-600 font-bold mb-8">
                    You have games that must be returned immediately.
                </p>

                <div className="space-y-4 mb-8 text-left">
                    {overdueLoans.map(loan => (
                        <div key={loan.id} className="bg-red-50 p-4 rounded-xl border border-red-200 flex flex-col">
                            <span className="font-bold text-gray-900 text-lg">{loan.title}</span>
                            <span className="text-red-700 text-sm font-medium">
                                Return to: <span className="uppercase">{loan.owner_name}</span>
                            </span>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-gray-100 rounded-xl">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                        Please contact the owner to return these games.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default OverdueModal;
