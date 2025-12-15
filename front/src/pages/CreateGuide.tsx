import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export function CreateGuide() {
    const [searchParams] = useSearchParams();
    const gameId = searchParams.get('gameId');
    const gameName = searchParams.get('gameName');
    
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/guides', { title, content, gameId: Number(gameId), gameName });
            navigate('/'); // or to guide details
        } catch (err: any) {
            setError(err.response?.data?.error || "Erreur lors de la création");
        }
    };

    if (!gameId) return <div>Erreur: Aucun jeu sélectionné.</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-gray-900 rounded-lg shadow-xl mt-10">
            <h1 className="text-2xl font-bold mb-4">Rédiger un guide pour {gameName}</h1>
            {error && <div className="bg-red-500/20 text-red-500 p-3 rounded mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Titre du guide</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:border-indigo-500 focus:outline-none"
                        required 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Contenu</label>
                    <textarea 
                        value={content} 
                        onChange={e => setContent(e.target.value)} 
                        className="w-full p-2 h-64 bg-gray-800 border border-gray-700 rounded focus:border-indigo-500 focus:outline-none"
                        required 
                    />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition">
                    Publier le guide
                </button>
            </form>
        </div>
    );
}
