import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LabsRoomsProvider } from './hooks/useLabsRooms.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LabsRoomsProvider>
      <App />
    </LabsRoomsProvider>
  </StrictMode>,
)
