import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../Client';
import './Header.css';

const Header = ({ theme, toggleTheme }) => {
    const [user, setUser] = useState(null);

    // Check if a user is logged in
    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };

        fetchSession();

        // Listen for authentication state changes
        supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });
    }, []);

    // Handle logout
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            alert('Error logging out: ' + error.message);
        } else {
            alert('You have been logged out.');
        }
    };

    return (
        <header className="header">
            <div className="header-user">
                {user ? user.email : 'Guest'}
            </div>
            <div className="header-options">
                <Link to="/" className="header-link">Home</Link>
                <Link to="/stats" className="header-link">Stats</Link>
                {user ? (
                    <button onClick={handleLogout} className="header-link logout-button">
                        Logout
                    </button>
                ) : (
                    <Link to="/login" className="header-link">Login</Link>
                )}
                <button onClick={toggleTheme} className="theme-toggle">
                    {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                </button>
            </div>
            <div className="header-title">
                <h1>Matthew Wyatt's Wordle</h1>
            </div>
        </header>
    );
};

export default Header;