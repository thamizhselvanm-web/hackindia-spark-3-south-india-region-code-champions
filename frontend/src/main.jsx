import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* IMPORTANT: Replace "YOUR_GOOGLE_CLIENT_ID" with your actual Client ID from Google Cloud Console */}
    <GoogleOAuthProvider clientId="601888920867-2eqs57tb9v8igs87dq8fb91o883ctcfr.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
