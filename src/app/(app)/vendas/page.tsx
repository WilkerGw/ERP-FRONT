// Caminho: ERP-FRONT-main/src/app/(app)/vendas/page.tsx

'use client';

import withAuth from "@/components/auth/withAuth";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, PackageCheck, Package } from 'lucide-react';
import { toast, Toaster } from 'sonner';

// Interface para corresponder à nova estrutura de dados do backend
interface IVenda {
  _id: string;
  cliente: { fullName: string };
  valorTotal: number;
  valorPagoNaHora: number;
  valorPendenteEntrega: number;
  entregue: boolean;
  dataVenda: string;
}

function VendasPage() {
  const queryClient = useQueryClient();

  // Busca os dados das vendas da nossa API
  const { data: vendas, isLoading, isError } = useQuery<IVenda[]>({
    queryKey: ['vendas'],
    queryFn: async () => api.get('/vendas').then(res => res.data),
  });

  // Mutação para marcar uma venda como entregue
  const { mutate: marcarComoEntregue, isPending: isUpdating } = useMutation({
    mutationFn: (vendaId: string) => api.patch(`/vendas/${vendaId}/entregar`),
    onSuccess: () => {
      toast.success("Venda marcada como entregue!");
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
    },
    onError: () => {
      toast.error("Erro ao atualizar o status da venda.");
    }
  });

  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="p-6 md:p-8 lg:p-10 min-h-screen">
      <Toaster richColors position="top-right" />
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Histórico de Vendas</h1>
            <p className="text-muted-foreground">Visualize e gira as suas vendas e entregas.</p>
        </div>
        <Button asChild className="mt-4 sm:mt-0">
          <Link href="/vendas/nova">
            <PlusCircle className="mr-2 h-4 w-4" />
            Registar Nova Venda
          </Link>
        </Button>
      </header>
      
      <main>
        <Card>
            <CardHeader>
                <CardTitle>Vendas Recentes</CardTitle>
                <CardDescription>Lista de todas as vendas registadas no sistema.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Pago na Hora</TableHead>
                        <TableHead>Pendente Entrega</TableHead>
                        <TableHead>Status Entrega</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={7} className="text-center h-24">A carregar vendas...</TableCell></TableRow>
                    ) : isError ? (
                        <TableRow><TableCell colSpan={7} className="text-center h-24 text-destructive">Erro ao carregar os dados.</TableCell></TableRow>
                    ) : vendas && vendas.length > 0 ? (
                        vendas.map((venda) => (
                        <TableRow key={venda._id}>
                            <TableCell className="font-medium text-gray-800/50">{venda.cliente?.fullName || 'N/A'}</TableCell>
                            <TableCell className="text-gray-800/50">{new Date(venda.dataVenda).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell className="text-gray-800/50">{formatCurrency(venda.valorTotal)}</TableCell>
                            <TableCell className="text-green-500">{formatCurrency(venda.valorPagoNaHora)}</TableCell>
                            <TableCell className="text-yellow-500">{formatCurrency(venda.valorPendenteEntrega)}</TableCell>
                            <TableCell>
                                <Badge variant={venda.entregue ? 'default' : 'secondary'}>
                                    {venda.entregue ? <PackageCheck className="mr-1 h-3 w-3"/> : <Package className="mr-1 h-3 w-3"/>}
                                    {venda.entregue ? 'Entregue' : 'Pendente'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isUpdating}>
                                            <MoreHorizontal className="h-4 w-4 text-blue-500" />
                                            <span className="sr-only">Menu de Ações</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem 
                                            disabled={venda.entregue || isUpdating} 
                                            onClick={() => marcarComoEntregue(venda._id)}
                                            className="cursor-pointer"
                                        >
                                            Marcar como Entregue
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow><TableCell colSpan={7} className="text-center h-24">Nenhuma venda encontrada.</TableCell></TableRow>
                    )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default withAuth(VendasPage);