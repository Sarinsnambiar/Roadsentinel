import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, Moon, Sun, AlertTriangle, User, Terminal, Settings, ShieldCheck, Cloud, Wind, Droplets, CloudRain, Heart, Phone, Info, Eye } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { realtimeDb } from '../firebase';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const consoleRef = useRef(null);

    // Realtime Sensor State
    // (Additional sensors removed)
    const [logs, setLogs] = useState([]);
    const [safetyScore, setSafetyScore] = useState(100);
    const [weather] = useState({ temp: 72, condition: 'Rainy', humidity: 65, wind: 12 });
    const [profileData, setProfileData] = useState({});

    const addLog = (msg) => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 50));
    };

    useEffect(() => {
        addLog("System initialized. Monitoring active.");
    }, []);

    // Firebase Hardware Listener (Replaces Simulation)
    useEffect(() => {
        if (!user?.uid) return;

        addLog("Waiting for Raspberry Pi telemetry...");
        const sensorsRef = ref(realtimeDb, `sensors/${user.uid}`);

        const unsubscribe = onValue(sensorsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (data.isEmergency === true) {
                    navigate('/emergency', {
                        state: { trigger: 'External Emergency Triggered', value: 'Critical' }
                    });
                }
            }
        });

        return () => unsubscribe();
    }, [user, navigate]);

    // Fetch Profile Data
    useEffect(() => {
        if (!user?.uid) return;
        const profileRef = ref(realtimeDb, `users/${user.uid}`);
        const unsubscribe = onValue(profileRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setProfileData(data);
                if (data.safetyScore !== undefined) {
                    setSafetyScore(data.safetyScore);
                }
            }
        });
        return () => unsubscribe();
    }, [user]);

    // Test function
    const triggerTestEmergency = () => {
        addLog("TEST TRIGGER: Simulating manual emergency...");
        navigate('/emergency', { state: { trigger: 'Manual Test Trigger', value: 'Test' } });
    };

    return (
        <div className="dashboard-container">

            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldCheck size={32} color="var(--primary)" />
                        RoadSentinel
                        <span style={{ fontSize: '0.8rem', verticalAlign: 'middle', background: 'var(--success)', color: '#000', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>LIVE</span>
                    </h1>
                    <p style={{ fontSize: '0.9rem', marginLeft: '2.5rem' }}>Driver: {user?.name || 'Unknown User'}</p>
                </div>
                <div className="header-actions">
                    <button className="btn-outline" onClick={() => navigate('/settings')} style={{ padding: '0.5rem 1rem' }}>
                        <Settings size={16} /> Settings
                    </button>
                    <button className="btn-outline" onClick={() => navigate('/profile')} style={{ padding: '0.5rem 1rem' }}>
                        <User size={16} /> Profile
                    </button>
                </div>
            </div>

            <div className="dashboard-grid">

                {/* Left Column: Vitals */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Safety Score Card */}
                    <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.8) 100%)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}><ShieldCheck size={18} /> Safety Score</span>
                            <span style={{ fontSize: '0.8rem', color: safetyScore > 80 ? 'var(--success)' : (safetyScore > 50 ? 'var(--warning)' : 'var(--danger)') }}>
                                {safetyScore > 80 ? 'EXCELLENT' : (safetyScore > 50 ? 'MODERATE' : 'CRITICAL')}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="80" height="80" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                    <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                                    <circle cx="50" cy="50" r="40" stroke={safetyScore > 80 ? 'var(--success)' : (safetyScore > 50 ? 'var(--warning)' : 'var(--danger)')}
                                        strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset={251 - (251 * safetyScore) / 100}
                                        style={{ transition: 'stroke-dashoffset 1s ease' }} />
                                </svg>
                                <span style={{ position: 'absolute', fontWeight: 'bold', fontSize: '1.5rem' }}>{safetyScore}</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Drive safely to keep your score high. <br />
                            </div>
                        </div>
                    </div>



                    {/* Weather Card */}
                    <div className="glass-card" style={{ padding: '1.2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}><Cloud size={18} /> Weather</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Mananthavady</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <CloudRain size={36} color="var(--primary)" />
                                <div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{weather.temp}°F</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{weather.condition}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                                <div><Wind size={12} style={{ marginRight: '4px' }} /> {weather.wind} mph</div>
                                <div><Droplets size={12} style={{ marginRight: '4px' }} /> {weather.humidity}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Device Status & Test Controls */}
                    <div className="glass-card" style={{ padding: '1.5rem', borderStyle: 'dashed', borderColor: 'var(--primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse-red 2s infinite' }}></div>
                                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Pi Sync Active</span>
                            </div>
                        </div>
                        <button className="btn-danger" style={{ width: '100%', padding: '0.8rem' }} onClick={triggerTestEmergency}>
                            <AlertTriangle size={18} /> TRIGGER TEST EMERGENCY
                        </button>
                    </div>

                </div>

                {/* Right Column: Map & Logs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: 0 }}>

                    {/* Digital Medical ID Card */}
                    <div className="glass-card" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.2) 0%, rgba(15, 23, 42, 0) 100%)' }}>
                            <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: 'bold', color: 'var(--danger)' }}>
                                <Heart size={18} fill="var(--danger)" /> Emergency Medical ID
                            </span>
                        </div>
                        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {profileData.photo ? (
                                        <img src={profileData.photo} alt="Driver" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <User size={30} color="var(--text-muted)" />
                                    )}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0 }}>{profileData.name || user?.name || 'Driver Name'}</h3>
                                    <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)' }}>Age: {profileData.age || 'Not specified'}</p>
                                </div>
                            </div>
                            <div style={{ padding: '0.5rem 0.8rem', borderRadius: '8px', background: 'var(--danger)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', minWidth: '60px' }}>
                                <span style={{ fontSize: '0.65rem', opacity: 0.9, textTransform: 'uppercase', marginBottom: '2px' }}>Blood</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', lineHeight: '1' }}>{profileData.bloodGroup || 'N/A'}</span>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Info size={14} /> Known Medical Conditions</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{profileData.medicalCondition || 'None reported'}</div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><AlertTriangle size={14} /> Allergies & Medications</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--danger)' }}>{profileData.medications || 'None'}</div>
                            </div>

                            <div style={{ marginTop: '0.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={14} /> Primary Emergency Contact</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 'bold' }}>{profileData.emergencyContactName || 'Not Set'}</span>
                                    <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{profileData.emergencyNumber || 'Not Set'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Log */}
                    <div className="glass-card" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                            <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem' }}><Terminal size={14} /> System Log</span>
                        </div>
                        <div className="console-log">
                            {logs.map((log, i) => (
                                <div key={i} className="console-entry">{log}</div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default Dashboard;