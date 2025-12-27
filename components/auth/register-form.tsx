'use client';
import { useState } from 'react';
import { signUp } from '@/lib/auth-client';

export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });

      if (result.error) {
        setError(result.error.message || 'Error en el registro');
        return;
      }

      // Si el registro es exitoso, forzar refresh y redirigir
      window.location.href = '/dashboard';
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Registre su empresa
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="tu@email.com"
              />
            </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">Usa una contraseña segura para proteger tu cuenta</p>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-900 mb-3">Al registrarte obtendrás:</p>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600">Panel de control empresarial</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600">Gestión de oportunidades laborales</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600">Herramientas de administración</p>
              </div>
            </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </div>

          <div className="text-center">
            <a
              href="/login"
              className="text-indigo-600 hover:text-indigo-500"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}