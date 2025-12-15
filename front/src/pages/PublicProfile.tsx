import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { type Guide } from '../types/Guide';

type PublicUser = {
    id: number;
    pseudo: string;
    email: string;
    guides: Guide[];
}

export function PublicProfile() {
    const { id } = useParams();
    const [profile, setProfile] = useState<PublicUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/users/${id}/profile`)
            .then(res => setProfile(res.data))
            .catch(err => setError("Utilisateur introuvable"))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div>Chargement...</div>;
    if (error || !profile) return <div>{error || "Profil introuvable"}</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
                <h1 className="text-3xl font-bold mb-2">{profile.pseudo}</h1>
                <p className="text-gray-400">Membre actif de la communauté</p>
            </div>

            <h2 className="text-2xl font-bold mb-4">Guides publiés ({profile.guides.length})</h2>
            <div className="grid gap-4">
                {profile.guides.map(guide => (
                    <div key={guide.id} className="p-4 bg-gray-900 rounded border border-gray-700">
                        <Link to={`/guides/${guide.id}`} className="text-xl font-bold text-indigo-400 hover:underline">
                            {guide.title}
                        </Link>
                        <p className="text-sm text-gray-500">Jeu : {guide.gameName}</p>
                    </div>
                ))}
                {profile.guides.length === 0 && <p className="text-gray-500">Cet utilisateur n'a pas encore rédigé de guide.</p>}
            </div>
        </div>
    );
}
