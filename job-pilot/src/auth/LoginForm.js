import { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import _get from 'lodash/get'

import axios from 'axios'

export default function LoginForm({ onLoginSuccess, onToggleMode, config }) {
  const REGION = _get(config, 'REACT_APP_REGION', 'us-east-1')
  const CLIENT_ID = _get(config, 'REACT_APP_CLIENT_ID', '')
  const baseUrl = _get(config, 'REACT_APP_API_URL', '')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (values) => {
    setLoading(true)
    const client = new CognitoIdentityProviderClient({ region: REGION })

    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: CLIENT_ID,
        AuthParameters: {
          USERNAME: values.email,
          PASSWORD: values.password,
        },
      })

      const response = await client.send(command)
      const { IdToken, AccessToken, RefreshToken } =
        response.AuthenticationResult

      const userData = {
        email: values.email,
        idToken: IdToken,
        accessToken: AccessToken,
        refreshToken: RefreshToken,
      }

      localStorage.setItem('user', JSON.stringify(userData))
      onLoginSuccess(userData)

      try {
        await axios.post(
          `${baseUrl}/subscribe-user`,
          {},
          {
            headers: {
              Authorization: IdToken,
            },
          }
        )
        console.log('User subscribed to SNS topic')
      } catch (err) {
        console.warn('SNS subscription failed or already confirmed:', err)
      }

      message.success(`Welcome back, ${values.email}`)
    } catch (err) {
      message.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='form-container'>
      <h2 className='form-title'>Welcome Back!</h2>
      <p className='form-subtitle'>Sign in to continue your journey</p>

      <Form
        name='login'
        onFinish={handleLogin}
        layout='vertical'
        size='large'
        className='auth-form'
      >
        <Form.Item
          name='email'
          label='Email Address'
          rules={[
            { required: true, message: 'Please enter your email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input
            placeholder='Enter your email'
            className='form-input'
            prefix={<span className='input-icon'>📧</span>}
          />
        </Form.Item>

        <Form.Item
          name='password'
          label='Password'
          rules={[
            { required: true, message: 'Please enter your password!' },
            { min: 6, message: 'Password must be at least 6 characters!' },
          ]}
        >
          <Input.Password
            placeholder='Enter your password'
            className='form-input'
            prefix={<span className='input-icon'>🔒</span>}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            loading={loading}
            className='submit-btn'
            block
          >
            Sign In
          </Button>
        </Form.Item>
      </Form>

      <div className='switch-mode'>
        <p>
          Don’t have an account?{' '}
          <button className='switch-btn' onClick={onToggleMode}>
            Create an account
          </button>
        </p>
      </div>
    </div>
  )
}
