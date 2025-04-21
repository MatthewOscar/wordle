import React, { useState } from 'react'
import { useRoutes, Link } from 'react-router-dom';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Game from './components/Game.jsx'
import './components/Tile.jsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  // Set up routes
  let elements = useRoutes([
    {
      path: "/",
      element: <Game />
    }
  ]);

  return (
    <div>
      <header><h1>WORDLE: By Matthew Wyatt</h1></header>
      <main>
        {elements}
      </main>
      <footer></footer>
    </div>
  )
}

export default App
