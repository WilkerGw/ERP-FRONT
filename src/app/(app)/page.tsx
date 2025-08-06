'use client';

import withAuth from "@/components/auth/withAuth";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useQuery } from '@tanstack/react-query';
import api from "@/services/api";
import StatCard from "@/components/dashboard/StatCard";
import { BarChart, Calendar, Cake, Users, AlertTriangle } from 'lucide-react';

// --- MUDANÇA AQUI: Interface atualizada ---
interface DashboardStats {
  totalVendasDia: number;
  totalVendasMes: number;
  boletosVencidos: number;
  boletosProximos: number;
  agendamentosProximos: number;
  aniversariantesMes: { 
    nome: string;
    dia: number; // Adicionamos o dia
  }[];
}

function HomePage() {
  const router = useRouter();
  // Usando a versão corrigida que não causa loop
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const { data: stats, isLoading, isError } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get('/dashboard');
      return response.data;
    },
  });

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) {
    return <div className="p-8">Carregando dados do dashboard...</div>;
  }

  if (isError) {
    return <div className="p-8 text-red-500">Erro ao carregar os dados.</div>;
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="flex flex-col justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard
        </h1>
        <div className="flex flex-col justify-centeritems-center space-x-4">
          <p className="text-gray-600">Bem-vindo(a), <strong>{user?.nome || 'Usuário'}</strong>!</p>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Vendas do Dia" value={formatCurrency(stats?.totalVendasDia || 0)} icon={<BarChart className="text-blue-500" />} />
          <StatCard title="Vendas do Mês" value={formatCurrency(stats?.totalVendasMes || 0)} icon={<Calendar className="text-blue-500" />} />
          <StatCard title="Boletos Vencidos" value={stats?.boletosVencidos || 0} icon={<AlertTriangle className="text-red-500" />} />
          <StatCard title="Boletos a Vencer (7 dias)" value={stats?.boletosProximos || 0} icon={<Calendar className="text-orange-500" />} />
          <StatCard title="Exames Agendados (7 dias)" value={stats?.agendamentosProximos || 0} icon={<Users className="text-green-500" />} />
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-4 mb-4">
                <div className="bg-pink-100 p-3 rounded-full">
                    <Cake className="text-pink-500" />
                </div>
                <div>
                    <p className="text-gray-500 text-sm">Aniversariantes do Mês</p>
                    <p className="text-2xl font-bold">{stats?.aniversariantesMes.length || 0}</p>
                </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-700 max-h-32 overflow-y-auto">
              {stats?.aniversariantesMes.map((aniversariante, index) => (
                // --- MUDANÇA AQUI: Exibindo o dia ---
                <li key={index} className="truncate">
                  <span className="font-bold">Dia {aniversariante.dia}</span> - {aniversariante.nome}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(HomePage);