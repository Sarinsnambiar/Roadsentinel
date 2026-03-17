import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Activity, Edit2, Save, ArrowLeft, Camera } from 'lucide-react';
import { ref, set, get, update } from 'firebase/database';
import { realtimeDb } from '../firebase';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState({
        name: user?.name || '',
        photo: '',
        address: '',
        licenseNumber: '',
        vehicleNumber: '',
        age: '',
        weight: '',
        height: '',
        bloodGroup: '',
        medicalCondition: '',
        medications: '',
        emergencyNumber: ''
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!user?.uid) return;
            setLoading(true);
            try {
                const userRef = ref(realtimeDb, `users/${user.uid}`);
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setProfile(prev => ({ ...prev, ...data }));
                } else if (user?.name) {
                    setProfile(p => ({ ...p, name: user.name }));
                }
            } catch (err) {
                console.error("Error fetching profile from Firebase:", err);
                setError("Failed to load profile details.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({ ...prev, photo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        if (isEditing && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleSave = async () => {
        if (!user?.uid) return;
        setLoading(true);
        setError(null);
        try {
            const userRef = ref(realtimeDb, `users/${user.uid}`);
            // Use update instead of set to avoid wiping out other fields like createdAt
            await update(userRef, profile);
            setIsEditing(false);
        } catch (err) {
            console.error("Error saving profile to Firebase:", err);
            setError("Failed to save changes. Please check permissions.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            <button onClick={() => navigate('/dashboard')} className="btn-outline" style={{ marginBottom: '1.5rem' }}>
                <ArrowLeft size={18} /> Back to Dashboard
            </button>

            <div className="glass-card animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div
                            className="glass-card flex-center"
                            style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                padding: 0,
                                background: 'rgba(0, 242, 255, 0.1)',
                                position: 'relative',
                                overflow: 'hidden',
                                cursor: isEditing ? 'pointer' : 'default',
                                border: isEditing ? '2px dashed var(--primary)' : 'none'
                            }}
                            onClick={triggerFileInput}
                        >
                            {profile.photo ? (
                                <img src={profile.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={50} color="var(--primary)" />
                            )}

                            {isEditing && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: 'rgba(0,0,0,0.6)',
                                    height: '30px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Camera size={16} color="white" />
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                    {/* Personal Details */}
                    <section>
                        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Personal Details</h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <Field label="Full Name" name="name" value={profile.name} isEditing={isEditing} onChange={handleChange} />
                            <Field label="Address" name="address" value={profile.address} isEditing={isEditing} onChange={handleChange} placeholder="e.g. 123 Main St, City" />
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

                    {/* Driver & Vehicle Details */}
                    <section>
                        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Driver & Vehicle Details</h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <Field
                                label="Driver License Number"
                                name="licenseNumber"
                                value={profile.licenseNumber}
                                isEditing={isEditing}
                                onChange={handleChange}
                                placeholder="e.g. D12345678"
                            />
                            <Field
                                label="Vehicle Number"
                                name="vehicleNumber"
                                value={profile.vehicleNumber}
                                isEditing={isEditing}
                                onChange={handleChange}
                                placeholder="e.g. ABC-1234"
                            />
                        </div>

                        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', color: isEditing ? 'var(--warning)' : 'inherit' }}>
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
                value={value || ''}
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