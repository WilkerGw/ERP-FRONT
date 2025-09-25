// Caminho: src/app/(app)/vendas/[id]/editar/page.tsx

"use client";

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { VendaForm } from '@/components/vendas/VendaForm';
import { IVendaPopulada } from '@/types/models'; // Importamos a nossa nova interface

// Função para buscar os dados da venda que será editada
const fetchVendaById = async (id: string): Promise<IVendaPopulada> => {
  const { data } = await api.get(`/vendas/${id}`);
  return data;
};

const EditarVendaPage = () => {
  const params = useParams();
  const id = params.id as string;

  const { data: initialData, isLoading, error } = useQuery<IVendaPopulada>({
    queryKey: ['venda', id],
    queryFn: () => fetchVendaById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="container mx-auto p-4">Carregando dados da venda...</div>;
  }

  if (error || !initialData) {
    return <div className="container mx-auto p-4 text-red-500">Erro ao carregar a venda para edição.</div>;
  }

  // Mapeia os dados da API para o formato que o formulário espera
  const formattedInitialData = {
    clienteId: initialData.cliente._id,
    produtos: initialData.produtos.map(p => ({
      produtoId: p.produto._id,
      nome: p.produto.nome,
      quantidade: p.quantidade,
      valorUnitario: p.valorUnitario,
    })),
    // Calcula a porcentagem de entrada com base nos valores
    porcentagemEntrada: initialData.valorTotal > 0 ? (initialData.pagamento.valorEntrada / initialData.valorTotal) * 100 : 0,
    condicaoPagamento: initialData.pagamento.condicaoPagamento,
    metodoPagamento: initialData.pagamento.metodoPagamento,
    parcelas: initialData.pagamento.parcelas || 1,
    cliente: initialData.cliente,
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Editar Venda</h1>
      <VendaForm initialData={formattedInitialData} vendaId={id} />
    </div>
  );
};

export default EditarVendaPage;