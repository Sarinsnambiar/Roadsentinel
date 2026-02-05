import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    return (
        <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
            <div className="glass-card animate-fade-in" style={{ maxWidth: '400px', textAlign: 'center' }}>
                <KeyRound size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                <h2>Reset Password</h2>
                <p style={{ margin: '1rem 0' }}>
                    Enter your email address and we'll send you a link to reset your password.
                </p>
                <input type="email" placeholder="Enter your email" />
                <button className="btn-primary" style={{ width: '100%' }}>Send Reset Link</button>

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