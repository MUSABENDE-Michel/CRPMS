// RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, useToast } from '../hooks/useCustomHooks';
import { FormGroup, Input, Loading } from '../components/UI';
import { validateUsername, validatePassword } from '../utils/helpers';
import { UserPlus } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: '',
  });

  const securityQuestions = [
    'What is your mother\'s maiden name?',
    'What was your first pet\'s name?',
    'What city were you born in?',
    'What is your favorite color?',
    'What was your first car model?',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username || !validateUsername(formData.username)) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (!formData.password || !validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.securityQuestion) {
      newErrors.securityQuestion = 'Security question is required';
    }
    if (!formData.securityAnswer) {
      newErrors.securityAnswer = 'Security answer is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await register(
        formData.username,
        formData.password,
        formData.confirmPassword,
        formData.securityQuestion,
        formData.securityAnswer
      );
      addToast('Registration successful! Redirecting...', 'success');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      addToast(error.message || 'Registration failed', 'error');
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
              <div className="p-3 bg-secondary-100 dark:bg-secondary-900/30 rounded-xl">
                <UserPlus className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create Account</h1>
            <p className="text-slate-600 dark:text-slate-400">Join CRPMS Today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormGroup label="Username" error={errors.username} required>
              <Input
                type="text"
                name="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                error={!!errors.username}
              />
            </FormGroup>

            <FormGroup label="Password" error={errors.password} required>
              <Input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                error={!!errors.password}
              />
            </FormGroup>

            <FormGroup label="Confirm Password" error={errors.confirmPassword} required>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                error={!!errors.confirmPassword}
              />
            </FormGroup>

            <FormGroup label="Security Question" error={errors.securityQuestion} required>
              <select
                name="securityQuestion"
                value={formData.securityQuestion}
                onChange={handleChange}
                disabled={loading}
                className="form-input"
              >
                <option value="">Select a security question</option>
                {securityQuestions.map((q, i) => (
                  <option key={i} value={q}>{q}</option>
                ))}
              </select>
            </FormGroup>

            <FormGroup label="Security Answer" error={errors.securityAnswer} required>
              <Input
                type="text"
                name="securityAnswer"
                placeholder="Enter your answer"
                value={formData.securityAnswer}
                onChange={handleChange}
                disabled={loading}
                error={!!errors.securityAnswer}
              />
            </FormGroup>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-secondary flex items-center justify-center gap-2"
            >
              {loading ? <Loading size="sm" /> : <UserPlus className="w-5 h-5" />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// ForgotPasswordPage.jsx
export const ForgotPasswordPage = () => {
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
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/security-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      if (data.success) {
        setSecurityQuestion(data.data.securityQuestion);
        setStep(2);
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
    if (!securityAnswer) {
      setErrors({ securityAnswer: 'Answer is required' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white">Reset Password</h1>

          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-4">
              <FormGroup label="Username" required>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  disabled={loading}
                />
              </FormGroup>
              <button type="submit" disabled={loading} className="w-full btn btn-primary">
                {loading ? 'Verifying...' : 'Continue'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleStep2} className="space-y-4">
              <FormGroup label="Security Question">
                <p className="text-slate-700 dark:text-slate-300 font-medium">{securityQuestion}</p>
              </FormGroup>

              <FormGroup label="Answer" error={errors.securityAnswer} required>
                <Input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="Enter your answer"
                  disabled={loading}
                  error={!!errors.securityAnswer}
                />
              </FormGroup>

              <FormGroup label="New Password" required>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  disabled={loading}
                />
              </FormGroup>

              <FormGroup label="Confirm Password" error={errors.confirmPassword} required>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  disabled={loading}
                  error={!!errors.confirmPassword}
                />
              </FormGroup>

              <button type="submit" disabled={loading} className="w-full btn btn-primary">
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

// Placeholder pages - Will be fully implemented in complete version
export const DashboardPage = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold">Dashboard</h2>
    <p className="text-slate-600 dark:text-slate-400 mt-2">Dashboard page content</p>
  </div>
);

export const CarsPage = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold">Cars Management</h2>
    <p className="text-slate-600 dark:text-slate-400 mt-2">Cars page content</p>
  </div>
);

export const ServicesPage = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold">Services Management</h2>
    <p className="text-slate-600 dark:text-slate-400 mt-2">Services page content</p>
  </div>
);

export const ServiceRecordsPage = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold">Service Records</h2>
    <p className="text-slate-600 dark:text-slate-400 mt-2">Service records page content</p>
  </div>
);

export const PaymentsPage = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold">Payments Management</h2>
    <p className="text-slate-600 dark:text-slate-400 mt-2">Payments page content</p>
  </div>
);

export const ReportsPage = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold">Reports</h2>
    <p className="text-slate-600 dark:text-slate-400 mt-2">Reports page content</p>
  </div>
);
