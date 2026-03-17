import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PhoneCall, AlertOctagon, CheckCircle } from 'lucide-react';
import MapView from '../components/MapView';
import '../styles/animations.css';
import { ref, get, push, set } from 'firebase/database';
import { realtimeDb } from '../firebase';

const Emergency = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [count, setCount] = useState(10);
    const [status, setStatus] = useState('initiating'); // initiating | sent | cancelled
    const [profile, setProfile] = useState({});

    // Load profile from Firebase
    useEffect(() => {
        const fetchProfile = async () => {
             if (user?.uid) {
                 const userRef = ref(realtimeDb, `users/${user.uid}`);
                 try {
                     const snapshot = await get(userRef);
                     if (snapshot.exists()) {
                         setProfile(snapshot.val());
                     } else if (state?.profileData) {
                         setProfile(state.profileData);
                     }
                 } catch (err) {
                     console.error("Failed to load profile for emergency", err);
                 }
             }
        };
        fetchProfile();
    }, [user, state]);

    useEffect(() => {
        if (status !== 'initiating') return;

        const timer = setInterval(() => {
            setCount(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setStatus('sent');
                    
                    // Log the incident to Firebase
                    if (user?.uid) {
                        try {
                            const incidentsRef = ref(realtimeDb, `incidents/${user.uid}`);
                            const newIncidentRef = push(incidentsRef);
                            set(newIncidentRef, {
                                trigger: state?.trigger || 'Critical Issue Detected',
                                value: state?.value || 'Unknown Vitals',
                                location: state?.location || null,
                                timestamp: new Date().toISOString(),
                                resolved: false
                            });
                        } catch (err) {
                            console.error("Failed to log incident to Firebase", err);
                        }
                    }

                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [status, user, state]);

    const handleImSafe = () => {
        setStatus('cancelled');
        // Optionally log cancelled alarm to Firebase here
        if (user?.uid) {
             const incidentsRef = ref(realtimeDb, `incidents/${user.uid}`);
             const newIncidentRef = push(incidentsRef);
             set(newIncidentRef, {
                 trigger: state?.trigger || 'Critical Issue Detected',
                 status: 'cancelled_by_driver',
                 timestamp: new Date().toISOString()
             }).catch(console.error);
        }

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

                    <div className="glass-card" style={{ marginTop: '2rem', textAlign: 'left', minWidth: '400px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>Incident Report</h3>
                            <p><strong>Driver:</strong> {user?.name}</p>
                            <p><strong>Reason:</strong> {state?.trigger}</p>
                            <p><strong>Vitals:</strong> {state?.value}</p>
                            <p><strong>Location:</strong> {state?.location ? `${state.location[0].toFixed(4)}, ${state.location[1].toFixed(4)}` : 'Unknown'}</p>
                        </div>

                        <div>
                            <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Medical Profile</h4>
                            <p><strong>Condition:</strong> {profile.medicalCondition || 'None'}</p>
                            <p><strong>Medications:</strong> {profile.medications || 'None'}</p>
                            <p><strong>Blood Group:</strong> {profile.bloodGroup || 'Unknown'}</p>
                        </div>

                        <div>
                            <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Vehicle & ID</h4>
                            <p><strong>Vehicle:</strong> {profile.vehicleNumber || 'Unknown'}</p>
                            <p><strong>License:</strong> {profile.licenseNumber || 'Unknown'}</p>
                            <p><strong>Address:</strong> {profile.address || 'Unknown'}</p>
                        </div>
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