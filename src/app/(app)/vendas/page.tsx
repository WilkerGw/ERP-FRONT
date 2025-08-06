'use client';

import withAuth from "@/components/auth/withAuth";
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Venda {
  _id: string;
  cliente: { fullName: string };
  vendedor: { nome: string };
  valorTotal: number;
  dataVenda: string;
}

function VendasPage() {
  const { data: vendas, isLoading } = useQuery<Venda[]>({
    queryKey: ['vendas'],
    queryFn: async () => api.get('/vendas').then(res => res.data),
  });

  return (
    <div className="p-4 md:p-8">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
        <h1 className="text-3xl font-bold">Histórico de Vendas</h1>
        <Button asChild className="w-full md:w-auto">
          <Link href="/vendas/nova">Registrar Nova Venda</Link>
        </Button>
      </header>
      {/* --- CORREÇÃO AQUI --- */}
      <main className="bg-card backdrop-blur-lg border border-border p-6 rounded-xl shadow-xl">
        <div className="overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (<TableRow><TableCell colSpan={4}>Carregando...</TableCell></TableRow>) : 
              vendas?.map((venda) => (
                <TableRow key={venda._id}>
                  <TableCell>{venda.cliente?.fullName || 'Cliente não encontrado'}</TableCell>
                  <TableCell>{venda.vendedor?.nome || 'Vendedor não encontrado'}</TableCell>
                  <TableCell>{new Date(venda.dataVenda).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{venda.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}

export default withAuth(VendasPage);