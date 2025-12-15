import { useEffect, useState } from 'react';
import api from '../services/api';
import { type Guide } from '../types/Guide';
import { Link } from 'react-router-dom';

export function GuidesList() {
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/guides')
            .then(res => setGuides(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Chargement des guides...</div>;

    return (
        <div className="guides-list">
            <h2 className="text-2xl font-bold mb-4">Derniers Guides de la Communauté</h2>
            <div className="grid gap-4">
                {guides.map(guide => (
                    <div key={guide.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <h3 className="text-xl font-bold text-white">{guide.title}</h3>
                        <p className="text-gray-400 text-sm">Sur <span className="text-indigo-400">{guide.gameName}</span> par <Link to={`/profile/${guide.authorId}`} className="text-indigo-400 hover:underline">{guide.authorPseudo}</Link></p>
                        <p className="mt-2 text-gray-300 line-clamp-3">{guide.content}</p>
                        <Link to={`/guides/${guide.id}`} className="inline-block mt-3 text-sm font-semibold text-primary hover:text-white">Lire la suite →</Link>
                    </div>
                ))}
                {guides.length === 0 && <p className="text-gray-500">Aucun guide pour le moment.</p>}
            </div>
        </div>
    );
}
