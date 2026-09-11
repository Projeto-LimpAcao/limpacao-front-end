import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import InputComLabel from './components/moleculas/InputComLabel/InputComLabel'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <InputComLabel tipo='password' />
    </>
  )
}

export default App
