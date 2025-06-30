import { useState } from 'react'
import { Form, Input, Button, message, Modal } from 'antd'
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import _get from 'lodash/get'

// import { REGION, CLIENT_ID } from './cognitoConfig'

export default function SignupForm({ onSignupSuccess, onToggleMode, config }) {
  const CLIENT_ID = _get(config, 'REACT_APP_CLIENT_ID', '')
  const REGION = _get(config, 'REACT_APP_REGION', 'us-east-1')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmationCode, setConfirmationCode] = useState('')
  const [passwordForRetry, setPasswordForRetry] = useState('')

  const handleSignup = async (values) => {
    setLoading(true)
    setEmail(values.email)
    setPasswordForRetry(values.password)

    const client = new CognitoIdentityProviderClient({ region: REGION })

    try {
      const command = new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: values.email,
        Password: values.password,
      })

      await client.send(command)
      message.success(
        'Sign up successful! Check your email for a confirmation code.'
      )
      setShowConfirmModal(true)
    } catch (err) {
      message.error(err.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmSignup = async () => {
    const client = new CognitoIdentityProviderClient({ region: REGION })

    try {
      const command = new ConfirmSignUpCommand({
        ClientId: CLIENT_ID,
        Username: email,
        ConfirmationCode: confirmationCode,
      })

      await client.send(command)
      message.success('Account confirmed! You can now log in.')
      setShowConfirmModal(false)
      onSignupSuccess?.() // Optionally log them in directly if you want
    } catch (err) {
      message.error(err.message || 'Confirmation failed')
    }
  }

  return (
    <div className='form-container'>
      <h2 className='form-title'>Create Account</h2>
      <p className='form-subtitle'>Join the platform and get started</p>

      <Form
        name='signup'
        onFinish={handleSignup}
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
            placeholder='Create a strong password'
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
            Create Account
          </Button>
        </Form.Item>
      </Form>

      <div className='switch-mode'>
        <p>
          Already have an account?{' '}
          <button className='switch-btn' onClick={onToggleMode}>
            Sign in here
          </button>
        </p>
      </div>

      <Modal
        title='Confirm Your Email'
        open={showConfirmModal}
        onOk={handleConfirmSignup}
        onCancel={() => setShowConfirmModal(false)}
        okText='Confirm'
      >
        <p>Enter the confirmation code sent to your email:</p>
        <Input
          type='text'
          placeholder='Confirmation Code'
          value={confirmationCode}
          onChange={(e) => setConfirmationCode(e.target.value)}
        />
      </Modal>
    </div>
  )
}
