import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            return setError('Please enter your email.');
        }

        try {
            setMessage('');
            setError('');
            setLoading(true);
            await resetPassword(email);
            setMessage('Success! Check your inbox for a password reset link.');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
            <div className="glass-card animate-fade-in" style={{ maxWidth: '400px', textAlign: 'center' }}>
                <KeyRound size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                <h2>Reset Password</h2>
                <p style={{ margin: '1rem 0' }}>
                    Enter your email address and we'll send you a secure link to reset your password.
                </p>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(255,0,0,0.1)', borderRadius: '4px' }}>{error}</div>}
                {message && <div style={{ color: 'var(--success)', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(0,255,0,0.1)', borderRadius: '4px' }}>{message}</div>}

                <form onSubmit={handleSubmit}>
                    <input 
                        type="email" 
                        placeholder="Enter your email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ marginBottom: '1rem' }}
                    />
                    <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem' }}>
                    <Link to="/login" className="flex-center" style={{ gap: '0.5rem' }}>
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;