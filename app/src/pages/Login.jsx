import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../Client.jsx';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login and Sign Up
    const navigate = useNavigate(); // Initialize useNavigate

    // Handle email/password login or sign-up
    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isSignUp) {
                // Sign Up logic
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password, // Send plain-text password for Supabase sign-up
                });

                if (signUpError) {
                    setError(signUpError.message);
                } else {
                    console.log('Signed up user:', signUpData);

                    // Insert user into the "users" table
                    const { data: userData, error: userError } = await supabase
                        .from('users')
                        .insert([
                            {
                                id: signUpData.user.id, // Use the Supabase user ID
                                email: signUpData.user.email, // User's email
                                password, // Store the plain-text password in the "password" column
                                created_at: new Date(), // Timestamp for creation
                            },
                        ]);

                    if (userError) {
                        setError(userError.message);
                    } else {
                        console.log('User added to users table:', userData);
                        alert('Sign-up successful! Please check your email to confirm your account.');
                        navigate('/'); // Redirect to home page
                    }
                }
            } else {
                // Login logic
                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                    email,
                    password, // Send plain-text password for login
                });

                if (loginError) {
                    setError(loginError.message);
                } else {
                    // console.log('Logged in user:', loginData);
                    alert('Login successful!');
                    navigate('/'); // Redirect to home page
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