'use client';

import withAuth from "@/components/auth/withAuth";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useQuery } from '@tanstack/react-query';
import api from "@/services/api";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Calendar, Cake, Users, AlertTriangle, Sparkles, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Interfaces
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
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const { data: stats, isLoading: isLoadingStats, isError: isErrorStats } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => api.get('/dashboard').then(res => res.data),
  });

  const { data: insight, isLoading: isLoadingInsight, isError: isErrorInsight } = useQuery<Insight>({
    queryKey: ['latestInsight'],
    queryFn: async () => api.get('/insights/latest').then(res => res.data),
  });

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isLoading = isLoadingStats || isLoadingInsight;
  const isError = isErrorStats || isErrorInsight;

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><div className="loader"></div></div>;
  }

  if (isError) {
    return <div className="p-8 text-destructive">Erro ao carregar os dados. Tente novamente mais tarde.</div>;
  }

  const formatCurrency = (value: number | undefined) => {
    if (typeof value !== 'number') return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo(a), <span className="font-semibold text-foreground">{user?.nome || 'Usuário'}</span>! Veja um resumo do seu dia.
          </p>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="mt-4 sm:mt-0"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Vendas do Dia" value={formatCurrency(stats?.totalVendasDia)} icon={<BarChart className="text-blue-500" />} />
          <StatCard title="Vendas do Mês" value={formatCurrency(stats?.totalVendasMes)} icon={<Calendar className="text-green-500" />} />
          <StatCard title="Boletos Vencidos" value={stats?.boletosVencidos || 0} icon={<AlertTriangle className="text-red-500" />} />
          <StatCard title="Boletos a Vencer (7 dias)" value={stats?.boletosProximos || 0} icon={<Calendar className="text-yellow-500" />} />
          <StatCard title="Exames Agendados (7 dias)" value={stats?.agendamentosProximos || 0} icon={<Users className="text-indigo-500" />} />
          
          <StatCard
            title="Aniversariantes do Mês"
            value={stats?.aniversariantesMes.length || 0}
            icon={<Cake className="text-pink-500" />}
            content={
              // Documentação da Correção:
              // - As classes 'text-white' e 'text-blue-300' foram removidas.
              // - Usamos 'text-muted-foreground' para o texto da lista e 'text-foreground' para o dia,
              //   garantindo que as cores venham do nosso tema global e tenham bom contraste.
              <ul className="space-y-1 text-xs mt-2 max-h-24 overflow-y-auto">
                {stats?.aniversariantesMes && stats.aniversariantesMes.length > 0 ? (
                  stats.aniversariantesMes.map((aniversariante, index) => (
                    <li key={index} className="truncate text-muted-foreground">
                      <span className="font-semibold text-foreground">Dia {aniversariante.dia}</span> - {aniversariante.nome}
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground">Nenhum aniversariante este mês.</li>
                )}
              </ul>
            }
          />
        </div>

        {insight && (
          // Documentação da Correção:
          // - Removidas todas as classes de cor hardcoded do Card, CardTitle, CardDescription e do parágrafo.
          // - Os componentes agora herdam as cores corretas ('card-foreground', 'muted-foreground', etc.) do nosso tema,
          //   tornando todo o texto perfeitamente visível.
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="text-purple-500" />
                  {insight.titulo}
                </CardTitle>
                <CardDescription>
                  Análise gerada via IA em {new Date(insight.dataGeracao).toLocaleString('pt-BR')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">
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