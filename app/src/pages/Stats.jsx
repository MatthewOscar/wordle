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
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error || !data?.user) {
                setIsLoggedIn(false);
                setLoading(false);
                return;
            }
            setIsLoggedIn(true);

            // Fetch stats if the user is logged in
            const fetchStats = async () => {
                setLoading(true);
                setError(null);

                const { data: statsData, error: statsError } = await supabase
                    .from('users')
                    .select('games_won, current_streak, max_streak, words_played')
                    .eq('id', data.user.id)
                    .single();

                if (statsError) {
                    console.error('Error fetching stats:', statsError.message);
                    setError('Failed to load stats. Please try again later.');
                } else {
                    setStats(statsData);
                }

                setLoading(false);
            };

            fetchStats();
        };

        checkUser();
    }, []);

    if (loading) {
        return <div className="stats-container">Loading...</div>;
    }

    if (!isLoggedIn) {
        return (
            <div className="stats-container">
                <h1>Stats</h1>
                <p>Please log in or sign up to view your stats.</p>
            </div>
        );
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
                            .slice(-5)
                            .reverse()
                            .map((word, index) => <li key={index}>{word.toUpperCase()}</li>)
                    ) : (
                        <li>No words played yet.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Stats;