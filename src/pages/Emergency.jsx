import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PhoneCall, AlertOctagon, CheckCircle } from 'lucide-react';
import MapView from '../components/MapView';
import '../styles/animations.css';

const Emergency = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [count, setCount] = useState(10);
    const [status, setStatus] = useState('initiating'); // initiating | sent | cancelled
    const [profile, setProfile] = useState({});

    // Load profile to get emergency number
    useEffect(() => {
        const storedProfile = localStorage.getItem(`driver_profile_${user?.email}`);
        if (storedProfile) {
            setProfile(JSON.parse(storedProfile));
        }
    }, [user]);

    useEffect(() => {
        if (status !== 'initiating') return;

        const timer = setInterval(() => {
            setCount(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setStatus('sent');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [status]);

    const handleImSafe = () => {
        setStatus('cancelled');
        setTimeout(() => navigate('/dashboard'), 2000);
    };

    return (
        <div className="flex-center animate-pulse-danger" style={{
            minHeight: '100vh', flexDirection: 'column', textAlign: 'center',
            background: 'radial-gradient(circle at center, #2a0a10 0%, #050505 100%)',
            padding: '2rem'
        }}>

            {status === 'initiating' && (
                <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <AlertOctagon size={80} color="var(--danger)" style={{ marginBottom: '1rem' }} />
                    <h1 style={{ fontSize: '3rem', color: 'var(--danger)', marginBottom: '0.5rem' }}>EMERGENCY ALERT</h1>
                    <h2 style={{ marginBottom: '2rem' }}>{state?.trigger || 'Critical Issue Detected'}</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', width: '100%', gap: '2rem', marginBottom: '2rem' }}>
                        {/* Countdown & Action */}
                        <div className="glass-card flex-center" style={{ flexDirection: 'column' }}>
                            <div style={{ fontSize: '5rem', fontWeight: 'bold', fontFamily: 'monospace', marginBottom: '2rem' }}>
                                00:0{count}
                            </div>
                            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
                                Sending data to {profile.emergencyNumber || 'Emergency Services'}
                            </p>
                            <button className="btn-primary" style={{ background: '#fff', color: '#000', height: '60px', fontSize: '1.2rem', width: '100%' }} onClick={handleImSafe}>
                                I'M SAFE - CANCEL
                            </button>
                        </div>

                        {/* Map Location */}
                        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', height: '350px' }}>
                            {state?.location && <MapView center={state.location} zoom={15} height="100%" />}
                            {!state?.location && <div className="flex-center" style={{ height: '100%' }}>Location Unavailable</div>}
                        </div>
                    </div>
                </div>
            )}

            {status === 'sent' && (
                <div className="animate-fade-in">
                    <PhoneCall size={80} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h1>Help is on the way.</h1>
                    <p style={{ fontSize: '1.2rem', margin: '1rem 0' }}>Data successfully transmitted to Emergency Response Center.</p>
                    <div className="glass-card" style={{ marginTop: '2rem', textAlign: 'left', minWidth: '300px' }}>
                        <p><strong>Driver:</strong> {user?.name}</p>
                        <p><strong>Reason:</strong> {state?.trigger}</p>
                        <p><strong>Vitals:</strong> {state?.value}</p>
                        <p><strong>Medical ID:</strong> {profile.medicalCondition || 'N/A'}</p>
                    </div>
                    <button className="btn-outline" style={{ marginTop: '2rem' }} onClick={() => navigate('/dashboard')}>
                        Return to Dashboard
                    </button>
                </div>
            )}

            {status === 'cancelled' && (
                <div className="animate-fade-in">
                    <CheckCircle size={80} color="var(--success)" style={{ marginBottom: '1rem' }} />
                    <h1>Alert Cancelled</h1>
                    <p>Returning to dashboard...</p>
                </div>
            )}

        </div>
    );
};

export default Emergency;