import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/apiService';
import { SpinnerIcon } from './icons';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Por favor, ingrese su nombre y correo.');
      return;
    }
    setError('');
    setIsLoading(true);
    const response = await api.sendVerificationCode(name, email);
    setIsLoading(false);
    if (response.success) {
      setStep('code');
    } else {
      setError('No se pudo enviar el código. Inténtelo de nuevo.');
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      setError('El código debe tener 6 dígitos.');
      return;
    }
    setError('');
    setIsLoading(true);
    // For a login-only flow, we pass an empty cart and zero total.
    const response = await api.verifyCodeAndPlaceOrder(name, email, code, {}, 0);
    setIsLoading(false);
    if (response.success && response.order) {
      onLoginSuccess({ id: email, name, email });
    } else {
      setError('Código incorrecto. Por favor, inténtelo de nuevo.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-background p-4">
      <div className="w-full max-w-md bg-brand-surface p-8 rounded-2xl shadow-lg">
        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit}>
            <h1 className="text-3xl font-bold text-brand-text-primary mb-2">Bienvenido</h1>
            <p className="text-brand-text-secondary mb-6">Ingrese su nombre y correo para ordenar.</p>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-brand-text-secondary mb-2">Nombre</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition"
                placeholder="Su nombre"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-brand-text-secondary mb-2">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition"
                placeholder="su.correo@empresa.com"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-primary-hover transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? <SpinnerIcon className="animate-spin h-5 w-5" /> : 'Recibir Código'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit}>
            <h1 className="text-3xl font-bold text-brand-text-primary mb-2">Verificar Código</h1>
            <p className="text-brand-text-secondary mb-6">
              Enviamos un código a <span className="font-semibold text-brand-text-primary">{email}</span>.
              <br/> (Pista: usa 123456)
            </p>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
            <div className="mb-6">
              <label htmlFor="code" className="block text-sm font-medium text-brand-text-secondary mb-2">Código de 6 dígitos</label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-3 border border-brand-border rounded-lg text-center tracking-[0.5em] text-lg font-semibold focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition"
                placeholder="______"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-primary-hover transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? <SpinnerIcon className="animate-spin h-5 w-5" /> : 'Verificar e Ingresar'}
            </button>
             <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-center text-brand-secondary mt-4 hover:underline"
            >
              Volver
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;