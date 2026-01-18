import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { type Guide } from '../types/Guide';
import { useAuth } from '../context/AuthContext';

export function GuideDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [guide, setGuide] = useState<Guide | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/guides/${id}`)
            .then(res => setGuide(res.data))
            .catch(err => setError("Guide introuvable"))
            .finally(() => setLoading(false));
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce guide ?")) return;
        try {
            await api.delete(`/guides/${id}`);
            navigate('/guides');
        } catch (err) {
            alert("Erreur lors de la suppression");
        }
    };

    if (loading) return <div className="p-8 text-center text-white">Chargement...</div>;
    if (error || !guide) return <div className="p-8 text-center text-red-500">{error || "Guide introuvable"}</div>;

    const isAuthor = user?.id === guide.authorId;

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{guide.title}</h1>
                        <p className="text-gray-400">
                            Guide pour <span className="text-indigo-400 font-semibold">{guide.gameName}</span>
                            {' '}par <Link to={`/profile/${guide.authorId}`} className="text-indigo-400 hover:underline">{guide.authorPseudo}</Link>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Publié le {new Date(guide.createdAt).toLocaleDateString()}</p>
                    </div>
                    {isAuthor && (
                        <div className="flex gap-2">
                            <Link 
                                to={`/guides/${guide.id}/edit`} 
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold transition"
                            >
                                Éditer
                            </Link>
                            <button 
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold transition"
                            >
                                Supprimer
                            </button>
                        </div>
                    )}
                </div>

                <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {guide.content}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-700">
                    <Link to="/guides" className="text-indigo-400 hover:text-white transition">
                        ← Retour aux guides
                    </Link>
                </div>
            </div>
        </div>
    );
}
