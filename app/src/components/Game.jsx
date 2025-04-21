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
                .select('games_won, current_streak, max_streak')
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
        const updatedStats = {
            games_won: userStats.games_won + 1,
            current_streak: userStats.current_streak + 1,
        };

        const { error } = await supabase
            .from('user_stats')
            .update(updatedStats)
            .eq('id', supabase.auth.user().id);

        if (error) {
            console.error('Error updating stats on win:', error.message);
        } else {
            setUserStats((prev) => ({
                ...prev,
                ...updatedStats,
            }));
        }
    };

    const updateStatsOnLoss = async () => {
        const updatedStats = {
            max_streak: Math.max(userStats.max_streak, userStats.current_streak),
            current_streak: 0,
        };

        const { error } = await supabase
            .from('user_stats')
            .update(updatedStats)
            .eq('id', supabase.auth.user().id);

        if (error) {
            console.error('Error updating stats on loss:', error.message);
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
        // Prevent input if all rows are filled
        if (currentRow >= 6) {
            return;
        }
        
        if (key === 'Enter' && currentWord.length === 5) {
            // Check if the word exists in the words list
            if (!words.includes(currentWord.toLowerCase())) {
                alert('Word not in list!'); // Notify the user
                return; // Do not proceed if the word is invalid
            }
    
            // Submit the current word
            const newBoard = [...board];
            newBoard[currentRow] = currentWord.split('');
            setBoard(newBoard);

            if (currentWord.toLowerCase() === secretWord) {
                setGameStatus('won'); // Player wins
                updateStatsOnWin(); // Update stats in the database
            } else if (currentRow === 5) {
                setGameStatus('lost'); // Player loses
                updateStatsOnLoss(); // Update stats in the database
            } else {
                setCurrentRow(currentRow + 1);
                setCurrentWord('');
            }

            updateKeyStatuses();
        } else if (key === 'Backspace') {
            // Remove the last letter
            const updatedWord = currentWord.slice(0, -1);
            setCurrentWord(updatedWord);
    
            const newBoard = [...board];
            newBoard[currentRow] = updatedWord.split('').concat(Array(5 - updatedWord.length).fill(''));
            setBoard(newBoard);
        } else if (currentWord.length < 5 && /^[a-zA-Z]$/.test(key)) {
            // Add a new letter
            const updatedWord = currentWord + key;
            setCurrentWord(updatedWord);
    
            const newBoard = [...board];
            newBoard[currentRow] = updatedWord.split('').concat(Array(5 - updatedWord.length).fill(''));
            setBoard(newBoard);
        }
    };

    const resetGame = () => {
        setBoard(Array.from({ length: 6 }, () => Array(5).fill('')));
        setCurrentRow(0);
        setCurrentWord('');
        setKeyStatuses({});
        setGameStatus('playing');
        const randomWord = words[Math.floor(Math.random() * words.length)];
        setSecretWord(randomWord);
    };

    useEffect(() => {
        // Fetch words from words.txt
        fetch('/src/components/words.txt')
            .then(response => response.text())
            .then(text => {
                const wordList = text.split('\n').map(word => word.trim());
                setWords(wordList);
                const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
                setSecretWord(randomWord);
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
                <div className="game-message">
                    <p>Congratulations! You guessed the word!</p>
                    <button onClick={resetGame}>Play Again</button>
                </div>
            )}
            {gameStatus === 'lost' && (
                <div className="game-message">
                    <p>Game Over! The word was: {secretWord}</p>
                    <button onClick={resetGame}>Play Again</button>
                </div>
            )}
            <Keyboard onKeyPress={handleKeyPress} keyStatuses={keyStatuses} />
        </div>
    )
}

export default Game