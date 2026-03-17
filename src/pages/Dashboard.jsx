import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, Moon, Sun, AlertTriangle, User, MapPin, Terminal, Settings, ShieldCheck, Cloud, Wind, Droplets, CloudRain } from 'lucide-react';
import MapView from '../components/MapView';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const consoleRef = useRef(null);

    // Simulation State
    const [heartRate, setHeartRate] = useState(75);
    const [drowsiness, setDrowsiness] = useState(10); // 0-100%
    const [isSimulating, setIsSimulating] = useState(true);
    const [logs, setLogs] = useState([]);
    const [location, setLocation] = useState([40.7128, -74.0060]); // NYC Default
    const [safetyScore, setSafetyScore] = useState(100);
    const [weather] = useState({ temp: 72, condition: 'Rainy', humidity: 65, wind: 12 });

    // Thresholds
    const MAX_HEARTRATE = 120;
    const MAX_DROWSINESS = 80;

    const addLog = (msg) => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 50));
    };

    useEffect(() => {
        addLog("System initialized. Monitoring active.");

        // Fake location movement
        const moveTimer = setInterval(() => {
            setLocation(prev => [prev[0] + 0.0001, prev[1] + 0.0001]);
        }, 3000);

        return () => clearInterval(moveTimer);
    }, []);

    useEffect(() => {
        // Calculate Safety Score
        const hrPenalty = Math.max(0, Math.abs(heartRate - 75) - 15); // Penalty starts if HR diff > 15
        const fatiguePenalty = Math.max(0, drowsiness - 15); // Penalty starts if drowsiness > 15%

        let score = 100 - (hrPenalty * 1.5) - (fatiguePenalty * 1);
        score = Math.min(100, Math.max(0, score));

        setSafetyScore(Math.floor(score));
    }, [heartRate, drowsiness]);

    useEffect(() => {
        if (!isSimulating) return;

        const interval = setInterval(() => {
            // Fluctuate Heart Rate
            setHeartRate(prev => {
                const change = Math.floor(Math.random() * 5) - 2;
                let newVal = prev + change;
                if (newVal < 60 && prev < 100) newVal = 60;
                return newVal;
            });

            // Fluctuate Drowsiness
            setDrowsiness(prev => {
                const change = Math.floor(Math.random() * 3) - 1;
                let newVal = prev + change;
                if (newVal < 0) newVal = 0;
                return newVal;
            });

        }, 1000);

        // Occasional Log
        const logInterval = setInterval(() => {
            if (Math.random() > 0.8) {
                addLog(`Sensor Update: HR ${heartRate}bpm | Fatigue ${drowsiness}%`);
            }
        }, 2000);

        return () => { clearInterval(interval); clearInterval(logInterval); };
    }, [isSimulating, heartRate, drowsiness]);

    // Check Thresholds
    useEffect(() => {
        if (heartRate > MAX_HEARTRATE || drowsiness > MAX_DROWSINESS) {
            addLog("CRITICAL THRESHOLD BREACHED!");

            navigate('/emergency', {
                state: {
                    trigger: heartRate > MAX_HEARTRATE ? 'High Heart Rate' : 'Drowsiness Detected',
                    value: heartRate > MAX_HEARTRATE ? `${heartRate} BPM` : `${drowsiness}% Alertness`,
                    location: location
                }
            });
        }
    }, [heartRate, drowsiness, navigate, location, user]);

    const simulateSafe = () => {
        setHeartRate(75);
        setDrowsiness(10);
        setIsSimulating(true);
        addLog("Simulation reset. Systems nominal.");
    };

    const simulateDangerHeart = () => {
        setIsSimulating(false);
        addLog("WARNING: Simulating Cardiac Event...");
        let bpm = 100;
        const rampUp = setInterval(() => {
            bpm += 5;
            setHeartRate(bpm);
            if (bpm > 125) clearInterval(rampUp);
        }, 500);
    };

    const simulateDrowsy = () => {
        setIsSimulating(false);
        addLog("WARNING: Simulating Driver Fatigue...");
        let level = 50;
        const rampUp = setInterval(() => {
            level += 10;
            setDrowsiness(level);
            if (level > 85) clearInterval(rampUp);
        }, 500);
    };

    return (
        <div className="container" style={{ padding: '1.5rem', height: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldCheck size={32} color="var(--primary)" />
                        RoadSentinel
                        <span style={{ fontSize: '0.8rem', verticalAlign: 'middle', background: 'var(--success)', color: '#000', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>LIVE</span>
                    </h1>
                    <p style={{ fontSize: '0.9rem', marginLeft: '2.5rem' }}>Driver: {user?.name || 'Unknown User'}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
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
                                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Impacted by HR & Fatigue</span>
                            </div>
                        </div>
                    </div>

                    {/* Heart Rate Card */}
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}><Activity size={18} /> Heart Rate</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Normal Range: 60-100</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1', color: heartRate > 100 ? 'var(--danger)' : 'var(--text-main)' }}>{heartRate}</span>
                            <span style={{ color: 'var(--text-muted)' }}>BPM</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: '100%', background: heartRate > 100 ? 'var(--danger)' : 'var(--primary)', animation: `pulse-red ${60 / heartRate}s infinite` }} />
                        </div>
                    </div>

                    {/* Fatigue Card */}
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}><Moon size={18} /> Fatigue Index</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1', color: drowsiness > 50 ? 'var(--warning)' : 'var(--text-main)' }}>{drowsiness}</span>
                            <span style={{ color: 'var(--text-muted)' }}>%</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${drowsiness}%`, background: drowsiness > 60 ? 'var(--warning)' : 'var(--success)', transition: 'width 0.5s' }} />
                        </div>
                    </div>

                    {/* Weather Card */}
                    <div className="glass-card" style={{ padding: '1.2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}><Cloud size={18} /> Weather</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>New York, NY</span>
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

                    {/* Controls */}
                    <div className="glass-card" style={{ padding: '1rem', borderStyle: 'dashed' }}>
                        <p style={{ fontSize: '0.8rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>SIMULATION CONTROLS</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button className="btn-danger" style={{ fontSize: '0.8rem', padding: '0.5rem' }} onClick={simulateDangerHeart}>Trigger HR</button>
                            <button className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem', borderColor: 'var(--warning)', color: 'var(--warning)' }} onClick={simulateDrowsy}>Trigger Fatigue</button>
                            <button className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem' }} onClick={simulateSafe}>Reset</button>
                        </div>
                    </div>

                </div>

                {/* Right Column: Map & Logs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: 0 }}>

                    {/* Map */}
                    <div className="glass-card" style={{ padding: '0', height: '100%', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><MapPin size={16} /> Live Location</span>
                            <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>LAT: {location[0].toFixed(4)} LNG: {location[1].toFixed(4)}</span>
                        </div>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <MapView center={location} height="100%" />
                            {/* Note: In a real implementation we'd need to force re-render MapView if center changes drastically, 
                        but for small simulated movements, MapContainer center prop changes might not animate. 
                        Usually we use a helper component inside MapContainer to flyTo. 
                        For this MVP, it initializes once. */}
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