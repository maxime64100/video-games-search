import { useTheme } from '../context/ThemeContext';
import './Settings.css';

export function Settings() {
  const { theme, toggleTheme, setTheme } = useTheme();

  const handleSystemTheme = () => {
    if (typeof window === 'undefined') {
      return;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  };

  const currentThemeLabel = theme === 'dark' ? 'Sombre' : 'Clair';

  return (
    <section className="settings">
      <header className="settings__header">
        <div>
          <h1 className="settings__title">Paramètres</h1>
          <p className="settings__description">
            Personnalise ton expérience sur GameScope avec quelques réglages rapides.
          </p>
        </div>
        <span className="settings__pill">Thème actuel : {currentThemeLabel}</span>
      </header>

      <div className="settings__grid">
        <article className="settings__card">
          <div className="settings__card-head">
            <div>
              <h2 className="settings__card-title">Apparence</h2>
              <p className="settings__card-subtitle">
                Choisis l&apos;ambiance qui te convient, du clair lumineux au sombre immersif.
              </p>
            </div>
          </div>
          <div className="settings__actions">
            <button
              className="settings__action settings__action--primary"
              type="button"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? 'Revenir au thème clair' : 'Activer le thème sombre'}
            </button>
            <button className="settings__action" type="button" onClick={handleSystemTheme}>
              Utiliser le thème du système
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
