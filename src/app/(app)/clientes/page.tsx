'use client';

import withAuth from '@/components/auth/withAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { toast, Toaster } from 'sonner';

// Componentes da UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

// Documentação da Correção:
// - Removido o "[key: string]: any" e definimos uma estrutura de dados mais completa
//   para o cliente, o que resolve o erro de build do ESLint.
type Cliente = {
  _id: string;
  fullName: string;
  cpf: string;
  phone: string;
  dataNascimento: string;
  endereco: {
    rua?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
};

function ClientesPage() {
  const queryClient = useQueryClient();
  
  const { data: clientes, isLoading, isError } = useQuery<Cliente[]>({
    queryKey: ['clientes'],
    queryFn: () => api.get('/clientes').then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/clientes/${id}`),
    onSuccess: () => {
      toast.success('Cliente apagado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
    onError: (error) => {
      toast.error(`Erro ao apagar cliente: ${error.message}`);
    },
  });

  // Funções simplificadas, pois o Dialog foi temporariamente removido
  const handleAddNew = () => {
    alert("Função 'Adicionar Novo Cliente' a ser implementada.");
  };

  const handleEdit = (cliente: Cliente) => {
    alert(`Função 'Editar Cliente' a ser implementada para: ${cliente.fullName}`);
  };

  const handleDelete = (id: string) => {
    toast.error('Tem a certeza de que deseja apagar este cliente?', {
      action: {
        label: 'Confirmar',
        onClick: () => deleteMutation.mutate(id),
      },
      duration: 5000,
    });
  };
  
  return (
    <div className="p-6 md:p-8 lg:p-10 min-h-screen">
      <Toaster richColors position="top-right" />
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Clientes</h1>
          <p className="text-muted-foreground">Adicione, edite e visualize os seus clientes.</p>
        </div>
        <Button onClick={handleAddNew} className="mt-4 sm:mt-0">
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Novo Cliente
        </Button>
      </header>

      <main>
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              Acompanhe e gira todos os seus clientes num só lugar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">A carregar clientes...</TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-destructive">Erro ao carregar os dados.</TableCell>
                  </TableRow>
                ) : clientes && clientes.length > 0 ? (
                  clientes.map((cliente) => (
                    <TableRow key={cliente._id}>
                      <TableCell className="font-medium text-gray-800">{cliente.fullName}</TableCell>
                      <TableCell className='text-gray-800'>{cliente.cpf}</TableCell>
                      <TableCell className='text-gray-800'>{cliente.phone}</TableCell>
                      <TableCell className='text-blue-500'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(cliente)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(cliente._id)} className="text-destructive focus:text-destructive">
                              Apagar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">Nenhum cliente encontrado.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default withAuth(ClientesPage);