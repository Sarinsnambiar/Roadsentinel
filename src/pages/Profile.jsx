import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Activity, Edit2, Save, ArrowLeft } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: user?.name || '',
        age: '',
        weight: '',
        height: '',
        bloodGroup: '',
        medicalCondition: '',
        medications: '',
        emergencyNumber: ''
    });

    useEffect(() => {
        // Load profile from local storage if exists
        const storedProfile = localStorage.getItem(`driver_profile_${user?.email}`);
        if (storedProfile) {
            setProfile(JSON.parse(storedProfile));
        } else if (user?.name) {
            setProfile(p => ({ ...p, name: user.name }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        localStorage.setItem(`driver_profile_${user?.email}`, JSON.stringify(profile));
        setIsEditing(false);
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            <button onClick={() => navigate('/dashboard')} className="btn-outline" style={{ marginBottom: '1.5rem' }}>
                <ArrowLeft size={18} /> Back to Dashboard
            </button>

            <div className="glass-card animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="glass-card flex-center" style={{ width: '80px', height: '80px', borderRadius: '50%', padding: 0, background: 'rgba(0, 242, 255, 0.1)' }}>
                            <User size={40} color="var(--primary)" />
                        </div>
                        <div>
                            <h2>{profile.name || 'Driver Profile'}</h2>
                            <p>{user?.email}</p>
                        </div>
                    </div>

                    <button
                        className={isEditing ? "btn-primary" : "btn-outline"}
                        onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    >
                        {isEditing ? <><Save size={18} /> Save Profile</> : <><Edit2 size={18} /> Edit Profile</>}
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>

                    {/* Personal Details */}
                    <section>
                        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Personal Details</h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <Field label="Full Name" name="name" value={profile.name} isEditing={isEditing} onChange={handleChange} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <Field label="Age" name="age" value={profile.age} isEditing={isEditing} onChange={handleChange} type="number" />
                                <Field label="Blood Group" name="bloodGroup" value={profile.bloodGroup} isEditing={isEditing} onChange={handleChange} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <Field label="Weight (kg)" name="weight" value={profile.weight} isEditing={isEditing} onChange={handleChange} type="number" />
                                <Field label="Height (cm)" name="height" value={profile.height} isEditing={isEditing} onChange={handleChange} type="number" />
                            </div>
                        </div>
                    </section>

                    {/* Medical Details */}
                    <section>
                        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', color: isEditing ? 'var(--warning)' : 'inherit' }}>
                            Medical & Emergency
                        </h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <Field
                                label="Medical Conditions"
                                name="medicalCondition"
                                value={profile.medicalCondition}
                                isEditing={isEditing}
                                onChange={handleChange}
                                placeholder="e.g. Diabetes, Hypertension"
                            />
                            <Field
                                label="Current Medications"
                                name="medications"
                                value={profile.medications}
                                isEditing={isEditing}
                                onChange={handleChange}
                                placeholder="e.g. Insulin, Aspirin"
                            />

                            <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid var(--danger)', borderRadius: '8px', background: 'rgba(255, 15, 75, 0.05)' }}>
                                <label style={{ display: 'block', color: 'var(--danger)', fontWeight: 'bold', marginBottom: '0.5rem' }}>Emergency Contact Number</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="emergencyNumber"
                                        value={profile.emergencyNumber}
                                        onChange={handleChange}
                                        style={{ borderColor: 'var(--danger)', marginBottom: 0 }}
                                        placeholder="+1 234 567 8900"
                                    />
                                ) : (
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{profile.emergencyNumber || 'Not Set'}</div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

const Field = ({ label, name, value, isEditing, onChange, type = "text", placeholder }) => (
    <div>
        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>{label}</label>
        {isEditing ? (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={{ marginBottom: 0 }}
            />
        ) : (
            <div style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', minHeight: '34px' }}>
                {value || <span style={{ opacity: 0.3 }}>-</span>}
            </div>
        )}
    </div>
);

export default Profile;