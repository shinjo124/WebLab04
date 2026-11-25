import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import App from './App.jsx'
import './index.css'

async function profilesLoader({ request }) {
  const response = await fetch('/api/profiles', { signal: request.signal })
  if (!response.ok) throw new Error('Unable to load profiles')
  return response.json()
}

const router = createBrowserRouter([{
  path: '/',
  loader: profilesLoader,
  Component: App,
  HydrateFallback: () => <main><p role="status">Loading profiles…</p></main>,
  errorElement: <main><h1>Unable to load profiles</h1><p>Check that the API is running, then reload the page.</p></main>,
}])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><RouterProvider router={router} /></React.StrictMode>,
)
