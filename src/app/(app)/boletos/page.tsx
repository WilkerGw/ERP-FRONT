'use client';

import { useState } from 'react';
import withAuth from "@/components/auth/withAuth";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface Boleto {
  _id: string;
  clienteInfo: { fullName: string };
  parcelValue: number;
  dueDate: string;
  description: string;
  status: string;
}

interface MesAgrupado {
  _id: { ano: number, mes: number };
  boletos: Boleto[];
  valorTotalMes: number;
  pagosNoMes: number;
}

const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function BoletosPage() {
  const [filtro, setFiltro] = useState('Abertos');
  const queryClient = useQueryClient();

  const { data: grupos, isLoading } = useQuery<MesAgrupado[]>({
    queryKey: ['boletos', filtro],
    queryFn: async () => api.get('/boletos', { params: { status: filtro } }).then(res => res.data),
  });

  const { mutate: marcarComoPago, isPending } = useMutation({
    mutationFn: (boletoId: string) => api.patch(`/boletos/${boletoId}/status`, { status: 'pago' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boletos'] });
    },
  });

  return (
    <div className="p-4 md:p-8">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
        <h1 className="text-3xl font-bold">Gestão de Boletos</h1>
        <Button asChild className="w-full md:w-auto">
          <Link href="/boletos/novo">Gerar Parcelamento</Link>
        </Button>
      </header>
      
      <Tabs value={filtro} onValueChange={setFiltro} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-4">
          <TabsTrigger value="Todos">Todos</TabsTrigger>
          <TabsTrigger value="Abertos">Abertos</TabsTrigger>
          <TabsTrigger value="Pagos">Pagos</TabsTrigger>
          <TabsTrigger value="Atrasados">Atrasados</TabsTrigger>
        </TabsList>

        <main className="mt-6 space-y-6">
          {isLoading && <p>Carregando boletos...</p>}
          {grupos?.map((grupo) => {
            const totalBoletos = grupo.boletos.length;
            const progresso = totalBoletos > 0 ? (grupo.pagosNoMes / totalBoletos) * 100 : 0;
            return (
              <Card key={`${grupo._id.ano}-${grupo._id.mes}`}>
                <CardHeader>
                  <CardTitle>{meses[grupo._id.mes - 1]} de {grupo._id.ano}</CardTitle>
                  <CardDescription className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span>Total a Receber: {grupo.valorTotalMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    <span>{grupo.pagosNoMes}/{totalBoletos} pagos</span>
                  </CardDescription>
                  <Progress value={progresso} className="w-full mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {grupo.boletos.map(boleto => {
                      const hoje = new Date();
                      hoje.setHours(0,0,0,0);
                      const isAtrasado = new Date(boleto.dueDate) < hoje && boleto.status === 'aberto';
                      return (
                        // --- CORREÇÃO AQUI ---
                        // Aplicamos um fundo sutil e borda aos itens da lista para melhor contraste
                        <div key={boleto._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-3 rounded-md border bg-background/30 border-border">
                          <div className="flex flex-col text-center sm:text-left">
                            <span className="font-semibold">{boleto.clienteInfo.fullName}</span>
                            <span className="text-sm text-muted-foreground">{boleto.description}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-center sm:text-right">
                            <div className="text-sm">Venc.: {new Date(boleto.dueDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</div>
                            <div>
                              <span className={`font-bold text-lg ${isAtrasado ? 'text-destructive' : ''}`}>
                                {boleto.parcelValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </span>
                            </div>
                            <div>
                              <Button
                                size="sm"
                                disabled={boleto.status === 'pago' || isPending}
                                onClick={() => marcarComoPago(boleto._id)}
                              >
                                {boleto.status === 'pago' ? 'Pago' : 'Marcar como Pago'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </main>
      </Tabs>
    </div>
  );
}

export default withAuth(BoletosPage);