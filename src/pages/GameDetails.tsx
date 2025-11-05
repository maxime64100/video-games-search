import { useParams } from 'react-router-dom';

export function GameDetails() {
    const id = useParams().id;
    return (
        <div>
            <h1>Détails du jeu</h1>
            <p>ID du jeu : {id}</p>
        </div>
    );
}
