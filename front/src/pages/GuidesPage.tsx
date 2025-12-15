import { GuidesList } from '../components/GuidesList';

export function GuidesPage() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Guides de Jeu</h1>
            <p className="mb-8 text-gray-400">Retrouvez les astuces et solutions de la communauté.</p>
            <GuidesList />
        </div>
    );
}
