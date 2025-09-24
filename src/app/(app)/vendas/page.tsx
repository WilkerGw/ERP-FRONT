// Caminho: src/app/(app)/vendas/page.tsx

"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from '@/services/api';

// Interface atualizada para refletir os dados populados
interface IClientePopulado {
  _id: string;
  fullName: string;
}

interface IPagamento {
  valorEntrada: number;
  valorRestante: number;
  metodoPagamento: string;
  condicaoPagamento: string;
  parcelas?: number;
}

interface IVendaPopulada {
  _id: string;
  cliente: IClientePopulado;
  produtos: { produto: { nome: string } }[];
  valorTotal: number;
  status: 'Pendente' | 'Concluído' | 'Cancelado';
  dataVenda: string;
  pagamento?: IPagamento;
}

const fetchVendas = async (): Promise<IVendaPopulada[]> => {
  const { data } = await api.get('/vendas');
  return data;
};

const VendasPage = () => {
  const queryClient = useQueryClient();
  const { data: vendas, isLoading, error } = useQuery<IVendaPopulada[]>({
    queryKey: ['vendas'],
    queryFn: fetchVendas,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => {
      return api.patch(`/vendas/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
    },
  });

  const handleMarcarConcluido = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'Concluído' });
  };
  
  const formatCurrency = (value?: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return "R$ 0,00";
    }
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) return <div className="p-10">Carregando vendas...</div>;
  if (error) return <div className="p-10 text-red-500">Erro ao carregar vendas.</div>;

  return (
    <div className="p-6 md:p-8 lg:p-10 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl text-blue-300">Vendas</h1>
        <Button className="text-gray-800/50" asChild>
          <Link href="/vendas/nova">
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Venda
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-gray-800/50'>Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-right">Valor Restante</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendas && vendas.map((venda) => (
                <TableRow key={venda._id}>
                  <TableCell className='text-gray-800/50'>{venda.cliente?.fullName || 'Cliente não informado'}</TableCell>
                  <TableCell className='text-gray-800/50'>{formatDate(venda.dataVenda)}</TableCell>
                  <TableCell className="text-right text-gray-800/50">{formatCurrency(venda.valorTotal)}</TableCell>
                  <TableCell className="text-right font-medium text-red-500">
                    {formatCurrency(venda.pagamento?.valorRestante)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={venda.status === 'Concluído' ? 'default' : 'secondary'}>
                      {venda.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-blue-500 cursor-pointer">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleMarcarConcluido(venda._id)}>
                          Marcar como Concluído
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendasPage;