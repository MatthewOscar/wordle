import React, { useState } from 'react';
import { supabase } from '../Client.jsx';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login and Sign Up

    // Function to hash the password using SHA-256
    const sha256 = async (message) => {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    };

    // Handle email/password login or sign-up
    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isSignUp) {
                // Sign Up logic
                const { user, error } = await supabase.auth.signUp({
                    email,
                    password: await sha256(password), // Hash the password before sending
                });

                if (error) {
                    setError(error.message);
                } else {
                    console.log('Signed up user:', user);
                }
            } else {
                // Login logic
                const { user, error } = await supabase.auth.signInWithPassword({
                    email,
                    password: await sha256(password), // Hash the password before sending
                });

                if (error) {
                    setError(error.message);
                } else {
                    console.log('Logged in user:', user);
                }
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h1>{isSignUp ? 'Sign Up' : 'Login'}</h1>
            <form onSubmit={handleAuth} className="login-form">
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading} className="login-button">
                    {loading ? (isSignUp ? 'Signing up...' : 'Logging in...') : isSignUp ? 'Sign Up' : 'Login'}
                </button>
            </form>
            {error && <p className="error-message">{error}</p>}

            <div className="guest-container">
                <h3>Play as Guest</h3>
                <button
                    onClick={() => (window.location.href = '/')}
                    className="guest-button"
                >
                    Continue as Guest
                </button>
            </div>

            <div className="toggle-container">
                <p>
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="toggle-button"
                    >
                        {isSignUp ? 'Login' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;