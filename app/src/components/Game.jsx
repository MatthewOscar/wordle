import React, { useState, useEffect } from 'react'
import { supabase } from '../Client';
import Tile from './Tile.jsx';
import './Game.css'

const Game = () => {
    const [board, setBoard] = useState(Array.from({ length: 6 }, () => Array(5).fill('')));
    const [currentRow, setCurrentRow] = useState(0);
    const [currentWord, setCurrentWord] = useState('');
    const [words, setWords] = useState([]);
    const [secretWord, setSecretWord] = useState('react'); // Example secret word
    
    const getTileStatus = (letter, index) => {
        if (!secretWord.includes(letter)) return 'absent';
        if (secretWord[index] === letter) return 'correct';
        return 'present';
    };

    const handleKeyPress = (key) => {
        if (key === 'Enter' && currentWord.length === 5) {
            // Submit the current word
            const newBoard = [...board];
            newBoard[currentRow] = currentWord.split('');
            setBoard(newBoard);
            setCurrentRow(currentRow + 1);
            setCurrentWord('');
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
        <div className='game-container'>
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
        </div>
    )
}

export default Game