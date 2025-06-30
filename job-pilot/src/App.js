import { useState, useEffect } from 'react'
import axios from 'axios'

import { ToastContainer } from 'react-toastify'

import GetJobs from './getJobs/GetJobs'
import LoginForm from './auth/LoginForm'
import SignupForm from './auth/SignupForm'
import Analytics from './analytics/Analytics'

import './auth/auth.css'
import 'react-toastify/dist/ReactToastify.css'

export default function App() {
  const [user, setUser] = useState(null)
  const [isLogin, setIsLogin] = useState(true)
  const [config, setConfig] = useState({
    REACT_APP_API_URL:
      'https://rcnlrh4g08.execute-api.us-east-1.amazonaws.com/prod',
    REACT_APP_USER_POOL_ID: 'us-east-1_1EBjDcqMf',
    REACT_APP_CLIENT_ID: '31c7bgjq9pheugv030rl6h0slo',
    REACT_APP_REGION: 'us-east-1',
  })

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get('/config')
        setConfig(response.data)
        console.log('Config loaded:', response.data)
      } catch (error) {
        console.error('Failed to load config:', error)
      }
    }

    const savedUser = JSON.parse(localStorage.getItem('user'))
    if (savedUser) setUser(savedUser)

    // fetchConfig()
  }, [])

  const toggleMode = () => {
    setIsLogin(!isLogin)
  }

  const handleLoginSuccess = (userData) => {
    setUser(userData)
  }

  // 🔴 Prevent rendering until config is loaded
  if (!config) return <div>Loading configuration...</div>

  return (
    <>
      <ToastContainer position='top-right' autoClose={3000} />

      {!user ? (
        <div className='auth-container'>
          <div className='auth-card'>
            <div className='auth-header'>
              <h1 className='app-title'>JobList</h1>
              <p className='app-subtitle'>Your gateway to dream jobs</p>
            </div>

            <div className='toggle-buttons'>
              <button
                className={`toggle-btn ${isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                className={`toggle-btn ${!isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            </div>

            {isLogin ? (
              <LoginForm
                onLoginSuccess={handleLoginSuccess}
                onToggleMode={toggleMode}
                config={config}
              />
            ) : (
              <SignupForm
                onSignupSuccess={handleLoginSuccess}
                onToggleMode={toggleMode}
                config={config}
              />
            )}
          </div>
        </div>
      ) : (
        <GetJobs config={config} setUser={setUser} />
      )}
    </>
  )
}
