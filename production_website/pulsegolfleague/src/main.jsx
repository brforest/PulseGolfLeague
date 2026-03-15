import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PulseGolfLeague from '../index.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PulseGolfLeague />
  </StrictMode>,
)
