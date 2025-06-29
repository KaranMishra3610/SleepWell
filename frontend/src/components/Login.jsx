// src/components/Login.jsx
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess(); // only called after successful login
    } catch (err) {
      setError(err.message); // display meaningful error
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Sleep Wellness</h1>
            <p className="login-subtitle">Your journey to better sleep starts here</p>
          </div>

          <div className="login-form-container">
            <h2 className="form-title">{isRegister ? "Create Account" : "Welcome Back"}</h2>
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <label htmlFor="email" className="input-label">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  placeholder="Enter your email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="password" className="input-label">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className={`submit-button ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <span className="loading-spinner">
                    <span className="spinner"></span>
                    {isRegister ? "Creating Account..." : "Signing In..."}
                  </span>
                ) : (
                  isRegister ? "Create Account" : "Sign In"
                )}
              </button>
            </form>

            <div className="form-footer">
              <p className="switch-text">
                {isRegister ? "Already have an account?" : "Don't have an account?"}
              </p>
              <button 
                onClick={() => setIsRegister(!isRegister)}
                className="switch-button"
                type="button"
              >
                {isRegister ? "Sign In" : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
        }

        .login-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          width: 100%;
          max-width: 420px;
          animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }

        .login-title {
          font-size: 2.2rem;
          font-weight: bold;
          margin: 0 0 8px 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .login-subtitle {
          font-size: 1rem;
          opacity: 0.9;
          margin: 0;
          font-weight: 300;
        }

        .login-form-container {
          padding: 40px 30px;
        }

        .form-title {
          font-size: 1.8rem;
          color: #2c3e50;
          margin: 0 0 30px 0;
          text-align: center;
          font-weight: 600;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-label {
          font-size: 0.9rem;
          color: #555;
          font-weight: 500;
          margin-left: 4px;
        }

        .form-input {
          padding: 14px 16px;
          border: 2px solid #e1e8ed;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background-color: #f8f9fa;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          background-color: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input::placeholder {
          color: #adb5bd;
        }

        .error-message {
          background-color: #fff5f5;
          border: 1px solid #fed7d7;
          color: #c53030;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .error-icon {
          font-size: 1rem;
        }

        .submit-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 16px;
          border-radius: 10px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 10px;
          position: relative;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .submit-button:active {
          transform: translateY(0);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .form-footer {
          margin-top: 30px;
          text-align: center;
          border-top: 1px solid #e9ecef;
          padding-top: 25px;
        }

        .switch-text {
          color: #6c757d;
          margin: 0 0 10px 0;
          font-size: 0.9rem;
        }

        .switch-button {
          background: none;
          border: none;
          color: #667eea;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          transition: color 0.3s ease;
        }

        .switch-button:hover {
          color: #764ba2;
        }

        /* Responsive design */
        @media (max-width: 480px) {
          .login-container {
            padding: 10px;
          }

          .login-card {
            max-width: 100%;
          }

          .login-header {
            padding: 30px 20px;
          }

          .login-title {
            font-size: 1.8rem;
          }

          .login-form-container {
            padding: 30px 20px;
          }

          .form-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}