import React from 'react'
import Tile from './Tile.jsx'
import './Keyboard.css'

const Keyboard = ({ onKeyPress, keyStatuses }) => {
    const rows = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace']
    ];

    return (
        <div className="keyboard">
            {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="keyboard-row">
                    {row.map((key) => (
                        <button
                        key={key}
                        className={`key ${key === 'Enter' ? 'Enter' : ''} ${keyStatuses[key] || ''}`}
                        onClick={() => onKeyPress(key)}
                    >
                            {key === 'Backspace' ? '←' : key.toUpperCase()}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default Keyboard;