import React, { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  // Set up routes
  let elements = useRoutes([
    {
      path: "/",
      element: <div />
    }
  ]);

  return (
    <div>
      <header></header>
      <main>
        {elements}
      </main>
      <footer></footer>
    </div>
  )
}

export default App
