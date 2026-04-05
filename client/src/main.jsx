import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from "react-redux"
import { store } from './redux/app/store.js'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
      <App />
      <Toaster />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
