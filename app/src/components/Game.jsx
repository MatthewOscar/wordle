import React, { useState, useEffect } from 'react'
import { supabase } from '../Client';
import Tile from './Tile.jsx';
import Keyboard from './Keyboard.jsx';
import './Game.css'

const Game = ({ theme }) => {
    const [board, setBoard] = useState(Array.from({ length: 6 }, () => Array(5).fill('')));
    const [currentRow, setCurrentRow] = useState(0);
    const [currentWord, setCurrentWord] = useState('');
    const [words, setWords] = useState([]);
    const [secretWord, setSecretWord] = useState('react'); // Example secret word
    const [keyStatuses, setKeyStatuses] = useState({});
    const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', or 'lost'
    const [pendingWin, setPendingWin] = useState(false); // State to track a pending win

    // Fetch user stats from the database
    const [userStats, setUserStats] = useState({
        games_won: 0,
        current_streak: 0,
        max_streak: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('games_won, current_streak, max_streak, words_played')
                .single();

            if (error) {
                console.error('Error fetching stats:', error.message);
            } else {
                setUserStats(data);
            }
        };

        fetchStats();
    }, []);

    const updateStatsOnWin = async () => {
        const { data, error: userError } = await supabase.auth.getUser();
        if (userError || !data?.user) {
            console.error('Error fetching user or user not logged in:', userError?.message || 'No user found');
            return;
        }
    
        const userId = data.user.id; // Extract the user ID
        // console.log('User ID:', userId); // Debug log to verify the user ID
    
        // Check if the user exists in the users table
        const { data: userData, error: userDataError } = await supabase
            .from('users')
            .select()
            .eq('id', userId)
            .single();
    
        if (userDataError) {
            console.error('Error fetching user data:', userDataError.message);
            return;
        }
    
        if (!userData) {
            console.error('User not found in the users table.');
            return;
        }
    
        // Update the existing row
        const updatedStats = {
            games_won: userStats.games_won + 1,
            current_streak: userStats.current_streak + 1,
            max_streak: Math.max(userStats.max_streak, userStats.current_streak + 1), // Update max_streak if needed
            words_played: [...(userStats.words_played || []), secretWord], // Add the secret word to words_played
        };
    
        const { error: updateError } = await supabase
            .from('users')
            .update(updatedStats)
            .eq('id', userId);
    
        if (updateError) {
            console.error('Error updating stats on win:', updateError.message);
        } else {
            setUserStats((prev) => ({
                ...prev,
                ...updatedStats,
            }));
        }
    };
    
    const updateStatsOnLoss = async () => {
        const { data, error: userError } = await supabase.auth.getUser();
        if (userError || !data?.user) {
            console.error('Error fetching user or user not logged in:', userError?.message || 'No user found');
            return;
        }
    
        const userId = data.user.id; // Extract the user ID
        console.log('User ID:', userId); // Debug log to verify the user ID
    
        // Check if the user exists in the users table
        const { data: userData, error: userDataError } = await supabase
            .from('users')
            .select()
            .eq('id', userId)
            .single();
    
        if (userDataError) {
            console.error('Error fetching user data:', userDataError.message);
            return;
        }
    
        if (!userData) {
            console.error('User not found in the users table.');
            return;
        }
    
        // Update the existing row
        const updatedStats = {
            max_streak: Math.max(userData.max_streak, userData.current_streak),
            current_streak: 0,
            words_played: [...(userStats.words_played || []), secretWord], // Add the secret word to words_played
        };
    
        const { error: updateError } = await supabase
            .from('users')
            .update(updatedStats)
            .eq('id', userId);
    
        if (updateError) {
            console.error('Error updating stats on loss:', updateError.message);
        } else {
            setUserStats((prev) => ({
                ...prev,
                ...updatedStats,
            }));
        }
    };
    
    const getTileStatus = (letter, index) => {
        if (!secretWord.includes(letter)) return 'absent';
        if (secretWord[index] === letter) return 'correct';
        return 'present';
    };

    const updateKeyStatuses = () => {
        const newStatuses = { ...keyStatuses };
        board[currentRow].forEach((letter, index) => {
            const status = getTileStatus(letter, index);
            if (status === 'correct' || (status === 'present' && newStatuses[letter] !== 'correct')) {
                newStatuses[letter] = status;
            } else if (!newStatuses[letter]) {
                newStatuses[letter] = 'absent';
            }
        });
        setKeyStatuses(newStatuses);
    };

    const handleKeyPress = (key) => {
        if (gameStatus !== 'playing') return; // Prevent input if the game is over
    
        if (key === 'Enter' && currentWord.length === 5) {
            if (!words.includes(currentWord.toLowerCase())) {
                alert('Word not in list!');
                return;
            }
    
            const newBoard = [...board];
            newBoard[currentRow] = currentWord.split('');
            setBoard(newBoard); // Update the board state
    
            if (currentWord.toLowerCase() === secretWord) {
                // Mark a pending win instead of directly setting gameStatus
                setPendingWin(true);
            } else if (currentRow === 5) {
                setGameStatus('lost'); // Update the game status to 'lost'
                updateStatsOnLoss(); // Update stats in the database
            } else {
                setCurrentRow(currentRow + 1); // Move to the next row
                setCurrentWord(''); // Reset the current word
            }
    
            updateKeyStatuses(); // Update the keyboard statuses
        } else if (key === 'Backspace') {
            const updatedWord = currentWord.slice(0, -1);
            setCurrentWord(updatedWord);
    
            const newBoard = [...board];
            newBoard[currentRow] = updatedWord.split('').concat(Array(5 - updatedWord.length).fill(''));
            setBoard(newBoard);
        } else if (currentWord.length < 5 && /^[a-zA-Z]$/.test(key)) {
            const updatedWord = currentWord + key;
            setCurrentWord(updatedWord);
    
            const newBoard = [...board];
            newBoard[currentRow] = updatedWord.split('').concat(Array(5 - updatedWord.length).fill(''));
            setBoard(newBoard);
        }
    };
    
    // New useEffect to handle pending wins
    useEffect(() => {
        if (pendingWin) {
        // This didnt work
            setGameStatus('won');
            updateStatsOnWin(); // Update stats in the database
            setPendingWin(false); // Reset the pending win state

        }
    }, [board, pendingWin]); // Run this effect when the board or pendingWin changes

    const resetGame = () => {
        setBoard(Array.from({ length: 6 }, () => Array(5).fill('')));
        setCurrentRow(0);
        setCurrentWord('');
        setKeyStatuses({});
        setGameStatus('playing');

        // Select a new secret word that is not in the words_played list
        const playedWords = userStats.words_played || [];
        let newSecretWord = '';
        do {
            newSecretWord = words[Math.floor(Math.random() * words.length)];
        } while (playedWords.includes(newSecretWord));

        setSecretWord(newSecretWord);
    };

    useEffect(() => {
        // Fetch words from words.txt
        fetch('/words.txt')
            .then(response => response.text())
            .then(text => {
                const wordList = text.split('\n').map(word => word.trim());
                setWords(wordList);

                // Select the initial secret word
                const playedWords = userStats.words_played || [];
                let initialSecretWord = '';
                do {
                    initialSecretWord = wordList[Math.floor(Math.random() * wordList.length)];
                } while (playedWords.includes(initialSecretWord));

                setSecretWord(initialSecretWord);
            })
            .catch(error => console.error('Error fetching words:', error));
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => handleKeyPress(event.key);
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentWord, currentRow]);

    return (
        <div className="game-container">
            <div>
                {board.map((row, rowIndex) => (
                    <div key={rowIndex} className="row">
                        {row.map((letter, colIndex) => {
                            const status =
                                rowIndex < currentRow
                                    ? getTileStatus(letter, colIndex)
                                    : '';
                            return <Tile key={colIndex} letter={letter} status={status} />;
                        })}
                    </div>
                ))}
            </div>
            {gameStatus === 'won' && (
                <div
                    className={`game-message ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}
                >
                    <p>Congratulations! You guessed the word!</p>
                    <button onClick={resetGame}>Play Again</button>
                </div>
            )}
            {gameStatus === 'lost' && (
                <div
                    className={`game-message ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}
                >
                    <p>Game Over! The word was: {secretWord}</p>
                    <button onClick={resetGame}>Play Again</button>
                </div>
            )}
            <Keyboard onKeyPress={handleKeyPress} keyStatuses={keyStatuses} />
        </div>
    )
}

export default Game