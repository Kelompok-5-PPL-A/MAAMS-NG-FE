import React from 'react'
import Image from 'next/image'

const Login = () => {
  const handleGoogleLogin = () => {
    // Handle Google login
  }

  const handleSSOLogin = () => {
    // Handle SSO login
  }

  return (
    <div data-testid="login-page">
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <h1 className="mb-6 text-2xl font-bold text-center" data-testid="login-title">Login</h1>
          <div className="space-y-4">
            <button
              data-testid="google-login-button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              <Image src="/google-logo.png" alt="Google Logo" width={20} height={20} className="mr-2" />
              Login dengan Google
            </button>

            <button
              data-testid="sso-login-button"
              onClick={handleSSOLogin}
              className="flex items-center justify-center w-full px-4 py-2 mt-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              <Image src="/ui-logo.png" alt="UI Logo" width={20} height={20} className="mr-2" />
              Login dengan SSO UI
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login 