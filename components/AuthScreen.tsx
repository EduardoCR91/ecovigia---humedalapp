import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const AuthScreen: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const { error: err } =
      mode === 'login'
        ? await signIn(email, password)
        : await signUp(email, password, username);

    if (err) {
      setError(err);
    } else {
      setSuccess(
        mode === 'login'
          ? 'Inicio de sesión exitoso.'
          : 'Registro exitoso. Revisa tu correo si se requiere confirmación.'
      );
    }

    setLoading(false);
  };

  return (
    <div className="p-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-emerald-900 mb-4">
        {mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Para participar en la comunidad y registrar reportes ciudadanos, inicia sesión o regístrate.
      </p>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('login')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold ${
            mode === 'login'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Iniciar sesión
        </button>
        <button
          onClick={() => setMode('register')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold ${
            mode === 'register'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Registrarse
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Nombre de usuario (único)
            </label>
            <input
              type="text"
              required={mode === 'register'}
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ej: humedal_guardian"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Se mostrará como @usuario en tus reportes.
            </p>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Correo electrónico
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="tu-correo@ejemplo.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-2">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-2">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold disabled:opacity-60"
        >
          {loading
            ? 'Procesando...'
            : mode === 'login'
            ? 'Entrar'
            : 'Crear cuenta'}
        </button>
      </form>
    </div>
  );
};

export default AuthScreen;
