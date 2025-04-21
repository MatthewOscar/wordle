import React, { useEffect, useState } from 'react';
import { supabase } from '../Client';
import './Stats.css';

const Stats = () => {
    const [stats, setStats] = useState({
        games_won: 0,
        current_streak: 0,
        max_streak: 0,
        words_played: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('users')
                .select('games_won, current_streak, max_streak, words_played')
                .single();

            if (error) {
                console.error('Error fetching stats:', error.message);
                setError('Failed to load stats. Please try again later.');
            } else {
                setStats(data);
            }

            setLoading(false);
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="stats-container">Loading stats...</div>;
    }

    if (error) {
        return <div className="stats-container error">{error}</div>;
    }

    return (
        <div className="stats-container">
            <h1>Your Stats</h1>
            <div className="stats-item">
                <p><strong>Games Won:</strong> {stats.games_won}</p>
            </div>
            <div className="stats-item">
                <p><strong>Current Streak:</strong> {stats.current_streak}</p>
            </div>
            <div className="stats-item">
                <p><strong>Max Streak:</strong> {stats.max_streak}</p>
            </div>
            <div className="stats-item">
                <p><strong>Last 5 Words Played:</strong></p>
                <ul>
                    {stats.words_played.length > 0 ? (
                        stats.words_played
                            .slice(-5) // Get the last 5 words
                            .reverse() // Reverse to show the most recent word first
                            .map((word, index) => (
                                <li key={index}>{word.toUpperCase()}</li> // Capitalize the word
                            ))
                    ) : (
                        <li>No words played yet.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Stats;