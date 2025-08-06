'use client';

import withAuth from "@/components/auth/withAuth";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useQuery } from '@tanstack/react-query';
import api from "@/services/api";
import StatCard from "@/components/dashboard/StatCard";
import { BarChart, Calendar, Cake, Users, AlertTriangle } from 'lucide-react';

interface DashboardStats {
  totalVendasDia: number;
  totalVendasMes: number;
  boletosVencidos: number;
  boletosProximos: number;
  agendamentosProximos: number;
  aniversariantesMes: { 
    nome: string;
    dia: number;
  }[];
}

function HomePage() {
  const router = useRouter();
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
    <div className="p-8 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-10">
        <h1 className="text-3xl text-blue-300">
          Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <p className="text-white">Bem-vindo(a), <span className="text-blue-300 font-bold">{user?.nome || 'Usuário'}</span>!</p>
          <button
            onClick={handleLogout}
            className="bg-blue-300/10 text-white px-4 py-2 rounded-lg hover:bg-destructive/90 transition-colors backdrop-blur-sm border border-blue-300/90"
          >
            Sair
          </button>
        </div>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Vendas do Dia" value={formatCurrency(stats?.totalVendasDia || 0)} icon={<BarChart className="text-blue-300" />} />
          <StatCard title="Vendas do Mês" value={formatCurrency(stats?.totalVendasMes || 0)} icon={<Calendar className="text-blue-300" />} />
          <StatCard title="Boletos Vencidos" value={stats?.boletosVencidos || 0} icon={<AlertTriangle className="text-blue-300" />} />
          <StatCard title="Boletos a Vencer (7 dias)" value={stats?.boletosProximos || 0} icon={<Calendar className="text-blue-300" />} />
          <StatCard title="Exames Agendados (7 dias)" value={stats?.agendamentosProximos || 0} icon={<Users className="text-blue-300" />} />
          
          {/* Documentação:
            Agora, o card de Aniversariantes também é um StatCard.
            - Passamos 'title', 'value' e 'icon' como nos outros.
            - A lista de nomes é passada através da nova propriedade 'content',
              que o StatCard agora sabe como renderizar.
          */}
          <StatCard
            title="Aniversariantes do Mês"
            value={stats?.aniversariantesMes.length || 0}
            icon={<Cake className="text-blue-300" />}
            content={
              <ul className="space-y-2 text-sm mt-4 max-h-32 overflow-y-auto">
                {stats?.aniversariantesMes.map((aniversariante, index) => (
                  <li key={index} className="truncate text-white">
                    <span className="font-bold text-blue-300">Dia {aniversariante.dia}</span> - {aniversariante.nome}
                  </li>
                ))}
              </ul>
            }
          />
        </div>
      </main>
    </div>
  );
}

export default withAuth(HomePage);