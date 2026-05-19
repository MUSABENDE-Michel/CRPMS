import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../hooks/useCustomHooks';
import { FormGroup, Input, Loading } from '../components/UI';
import { Key } from 'lucide-react';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [username, setUsername] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleStep1 = async (e) => {
    e.preventDefault();
    if (!username) {
      setErrors({ username: 'Username is required' });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/security-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      if (data.success) {
        setSecurityQuestion(data.data.securityQuestion);
        setStep(2);
        setErrors({});
      } else {
        addToast(data.message || 'User not found', 'error');
      }
    } catch (error) {
      addToast('Error fetching security question', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!securityAnswer) {
      newErrors.securityAnswer = 'Answer is required';
    }
    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username,
          securityAnswer,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await response.json();
      if (data.success) {
        addToast('Password reset successful!', 'success');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        addToast(data.message || 'Password reset failed', 'error');
      }
    } catch (error) {
      addToast('Error resetting password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                <Key className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reset Password</h1>
            <p className="text-slate-600 dark:text-slate-400">Recover your account access</p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-4">
              <FormGroup label="Username" error={errors.username} required>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrors((prev) => ({ ...prev, username: '' }));
                  }}
                  placeholder="Enter your username"
                  disabled={loading}
                  error={!!errors.username}
                />
              </FormGroup>
              <button type="submit" disabled={loading} className="w-full btn btn-primary flex items-center justify-center gap-2">
                {loading ? <Loading size="sm" /> : null}
                {loading ? 'Verifying...' : 'Continue'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleStep2} className="space-y-4">
              <FormGroup label="Security Question">
                <p className="text-slate-700 dark:text-slate-300 font-medium p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">{securityQuestion}</p>
              </FormGroup>

              <FormGroup label="Your Answer" error={errors.securityAnswer} required>
                <Input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => {
                    setSecurityAnswer(e.target.value);
                    setErrors((prev) => ({ ...prev, securityAnswer: '' }));
                  }}
                  placeholder="Enter your answer"
                  disabled={loading}
                  error={!!errors.securityAnswer}
                />
              </FormGroup>

              <FormGroup label="New Password" error={errors.newPassword} required>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, newPassword: '' }));
                  }}
                  placeholder="Enter new password"
                  disabled={loading}
                  error={!!errors.newPassword}
                />
              </FormGroup>

              <FormGroup label="Confirm Password" error={errors.confirmPassword} required>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  placeholder="Confirm password"
                  disabled={loading}
                  error={!!errors.confirmPassword}
                />
              </FormGroup>

              <button type="submit" disabled={loading} className="w-full btn btn-primary flex items-center justify-center gap-2">
                {loading ? <Loading size="sm" /> : null}
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="text-center">
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline text-sm">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
