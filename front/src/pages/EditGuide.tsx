import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export function EditGuide() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Initial loading state for fetching current data
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/guides/${id}`)
            .then(res => {
                setTitle(res.data.title);
                setContent(res.data.content);
            })
            .catch(err => setError("Impossible de charger le guide"))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/guides/${id}`, { title, content });
            navigate(`/guides/${id}`);
        } catch (err: any) {
            setError(err.response?.data?.error || "Erreur lors de la modification");
        }
    };

    if (loading) return <div className="text-center p-8 text-white">Chargement...</div>;
    if (error && !title) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-gray-900 rounded-lg shadow-xl mt-10 text-white">
            <h1 className="text-2xl font-bold mb-4">Modifier le guide</h1>
            {error && <div className="bg-red-500/20 text-red-500 p-3 rounded mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Titre du guide</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:border-indigo-500 focus:outline-none text-white"
                        required 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Contenu</label>
                    <textarea 
                        value={content} 
                        onChange={e => setContent(e.target.value)} 
                        className="w-full p-2 h-64 bg-gray-800 border border-gray-700 rounded focus:border-indigo-500 focus:outline-none text-white"
                        required 
                    />
                </div>
                <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition">
                        Enregistrer les modifications
                    </button>
                    <button type="button" onClick={() => navigate(-1)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition">
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
}
