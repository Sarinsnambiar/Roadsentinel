import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, LogOut, Sun, Moon, Zap, Smartphone, Check } from 'lucide-react';

const Settings = () => {
    const { logout, user } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem', maxWidth: '800px' }}>
            <button onClick={() => navigate('/dashboard')} className="btn-outline" style={{ marginBottom: '1.5rem' }}>
                <ArrowLeft size={18} /> Back to Dashboard
            </button>

            <div style={{ marginBottom: '2rem' }}>
                <h1>Settings</h1>
                <p>Customize your experience.</p>
            </div>

            {/* Theme Section */}
            <section className="glass-card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Smartphone size={20} color="var(--primary)" /> App Theme
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>

                    {/* Slate Theme */}
                    <ThemeOption
                        active={theme === 'slate'}
                        onClick={() => setTheme('slate')}
                        icon={<Moon size={24} />}
                        title="Midnight Slate"
                        desc="Default dark mode. Best for night driving."
                        color="#0f172a"
                    />

                    {/* Light Theme */}
                    <ThemeOption
                        active={theme === 'light'}
                        onClick={() => setTheme('light')}
                        icon={<Sun size={24} />}
                        title="Daylight"
                        desc="High brightness for sunny days."
                        color="#f1f5f9"
                        textColor="#000"
                    />

                    {/* Neon Theme */}
                    <ThemeOption
                        active={theme === 'neon'}
                        onClick={() => setTheme('neon')}
                        icon={<Zap size={24} />}
                        title="Cyber Neon"
                        desc="High contrast. Maximum visibility."
                        color="#000"
                        borderColor="#00ff00"
                    />
                </div>
            </section>

            {/* Account Section */}
            <section className="glass-card">
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LogOut size={20} color="var(--danger)" /> Account
                </h2>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <p style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>Logged in as</p>
                        <p>{user?.email}</p>
                    </div>
                    <button className="btn-danger" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </section>

        </div>
    );
};

const ThemeOption = ({ active, onClick, icon, title, desc, color, textColor = '#fff', borderColor = 'transparent' }) => (
    <div
        onClick={onClick}
        style={{
            cursor: 'pointer',
            background: color,
            color: textColor,
            padding: '1.5rem',
            borderRadius: '12px',
            border: active ? '2px solid var(--primary)' : `1px solid ${borderColor !== 'transparent' ? borderColor : 'rgba(125,125,125,0.2)'}`,
            position: 'relative',
            transition: 'all 0.2s'
        }}
    >
        {active && (
            <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--primary)', borderRadius: '50%', padding: '2px' }}>
                <Check size={12} color="#fff" />
            </div>
        )}
        <div style={{ marginBottom: '1rem', opacity: 0.8 }}>{icon}</div>
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{title}</div>
        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{desc}</div>
    </div>
);

export default Settings;