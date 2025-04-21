import React, { useState, useEffect } from 'react'
import { useRoutes, Link } from 'react-router-dom';
import Header from './components/Header.jsx'
import Game from './components/Game.jsx'
import Login from './pages/Login.jsx'
import Stats from './pages/Stats.jsx'
import './components/Tile.jsx'
import './App.css'

function App() {
  const [theme, setTheme] = useState('light'); // State to manage theme

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Apply the theme to the root element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Set up routes
  let elements = useRoutes([
    {
      path: "/",
      element: <Game theme={theme} />
    },
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/stats",
      element: <Stats />
    }
  ]);

  return (
    <div>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main>
        {elements}
      </main>
      <footer>© 2025 GoLinks®, Inc. All Rights Reserved.</footer>
    </div>
  )
}

export default App
