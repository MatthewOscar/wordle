import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ theme, toggleTheme }) => {
    return (
        <header className="header">
            <div className="header-options">
                <Link to="/" className="header-link">Home</Link>
                <Link to="/stats" className="header-link">Stats</Link>
                <Link to="/login" className="header-link">Login</Link>
                <button onClick={toggleTheme} className="theme-toggle">
                    {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                </button>
            </div>
            <div className="header-title">
                <h1>WORDLE: By Matthew Wyatt</h1>
            </div>
        </header>
    );
};

export default Header;