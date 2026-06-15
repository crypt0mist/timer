import React from 'react'
import { createRoot } from 'react-dom/client'
import OverlayWidget from './components/OverlayWidget'
import './index.css'

const init = () => {
  // Check if we already injected to prevent duplicates
  if (document.getElementById('discord-xp-grinder-root')) return;

  const rootElement = document.createElement('div')
  rootElement.id = 'discord-xp-grinder-root'
  document.body.appendChild(rootElement)

  const root = createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <OverlayWidget />
    </React.StrictMode>
  )
}

// Ensure the DOM is fully loaded before injecting
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}
