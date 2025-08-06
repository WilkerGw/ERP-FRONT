'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import api from '@/services/api';
import axios from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', {
        email,
        senha,
      });
      
      const { token, user } = response.data;
      setToken(token, user);
      router.push('/');

    } catch (err: unknown) {
      console.error('Erro no login:', err);
      let errorMessage = 'Erro de rede ou falha ao conectar.';
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data?.error || errorMessage;
      }
      setError(errorMessage);
    }
  };

  return (
    // Removido o bg-gray-100 para o gradiente aparecer
    <div className="flex items-center justify-center min-h-screen">
      {/* Documentação: 
        Aplicamos as classes do efeito de vidro diretamente neste container,
        já que ele não usa o componente Card.
      */}
      <div className="p-8 bg-card backdrop-blur-lg border border-border rounded-xl shadow-xl w-full max-w-md text-card-foreground">
        <h1 className="text-2xl font-bold text-center mb-6">Login do Sistema</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2" htmlFor="email">Email</label>
            <input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-input backdrop-blur-sm border-border" required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2" htmlFor="senha">Senha</label>
            <input
              id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-input backdrop-blur-sm border-border" required
            />
          </div>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <button type="submit" className="w-full bg-primary/80 text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition-colors">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}