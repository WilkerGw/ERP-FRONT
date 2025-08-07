'use client';

import withAuth from "@/components/auth/withAuth";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useQuery } from '@tanstack/react-query';
import api from "@/services/api";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Calendar, Cake, Users, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button"; // Importação do Button adicionada

// Interface para o insight gerado pela IA
interface Insight {
  _id: string;
  titulo: string;
  conteudo: string;
  dataGeracao: string;
}

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
  // Versão corrigida para buscar o usuário e a função de logout
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const { data: stats, isLoading: isLoadingStats, isError: isErrorStats } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => api.get('/dashboard').then(res => res.data),
  });

  const { data: insight, isLoading: isLoadingInsight, isError: isErrorInsight } = useQuery<Insight>({
    queryKey: ['latestInsight'],
    // Corrigido para apontar para a rota mais genérica
    queryFn: async () => api.get('/insights/latest').then(res => res.data),
  });

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isLoading = isLoadingStats || isLoadingInsight;
  const isError = isErrorStats || isErrorInsight;

  if (isLoading) {
    return <div className="p-8 text-white">Carregando dados do dashboard...</div>;
  }

  if (isError) {
    return <div className="p-8 text-red-500">Erro ao carregar os dados.</div>;
  }

  const formatCurrency = (value: number | undefined) => {
    if (typeof value !== 'number') return 'R$ 0,00';
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
          {/* Corrigido para usar o componente Button importado */}
          <Button
            onClick={handleLogout}
            className="bg-blue-300/10 text-white px-4 py-2 rounded-lg hover:bg-destructive/90 transition-colors backdrop-blur-sm border border-blue-300/90"
          >
            Sair
          </Button>
        </div>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Vendas do Dia" value={formatCurrency(stats?.totalVendasDia)} icon={<BarChart className="text-blue-300" />} />
          <StatCard title="Vendas do Mês" value={formatCurrency(stats?.totalVendasMes)} icon={<Calendar className="text-blue-300" />} />
          <StatCard title="Boletos Vencidos" value={stats?.boletosVencidos} icon={<AlertTriangle className="text-blue-300" />} />
          <StatCard title="Boletos a Vencer (7 dias)" value={stats?.boletosProximos} icon={<Calendar className="text-blue-300" />} />
          <StatCard title="Exames Agendados (7 dias)" value={stats?.agendamentosProximos} icon={<Users className="text-blue-300" />} />
          
          <StatCard
            title="Aniversariantes do Mês"
            value={stats?.aniversariantesMes.length || 0}
            icon={<Cake className="text-blue-300" />}
            content={
              <ul className="space-y-2 text-sm mt-4 max-h-32 overflow-y-auto">
                {stats?.aniversariantesMes && stats.aniversariantesMes.length > 0 ? (
                  stats.aniversariantesMes.map((aniversariante, index) => (
                    <li key={index} className="truncate text-white">
                      <span className="font-bold text-blue-300">Dia {aniversariante.dia}</span> - {aniversariante.nome}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400">Nenhum aniversariante este mês.</li>
                )}
              </ul>
            }
          />
        </div>

        {insight && (
          <div className="mt-6">
            <Card className="bg-white/5 border-blue-300/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-300">
                  <Sparkles className="text-purple-400" />
                  {insight.titulo}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Análise gerada via IA em {new Date(insight.dataGeracao).toLocaleString('pt-BR')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">
                  {insight.conteudo}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

export default withAuth(HomePage);