'use client';

import withAuth from '@/components/auth/withAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
// Este componente ainda não existe, iremos criá-lo se necessário ou adaptar o formulário.
// Por agora, vamos focar-nos em exibir a lista.
// import ClientForm from '@/components/clientes/ClientForm'; 

// O tipo de cliente precisa de ser atualizado para refletir o novo modelo
type Cliente = {
  _id: string;
  fullName: string;
  cpf: string;
  phone: string;
  // Adicionar outros campos se necessário para o formulário de edição
  [key: string]: any; 
};

function ClientesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Cliente | undefined>(undefined);

  // A query para buscar os clientes permanece a mesma
  const { data: clientes, isLoading, isError } = useQuery<Cliente[]>({
    queryKey: ['clientes'],
    // O endpoint deve corresponder ao que está definido no backend
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

  // Funções para gerir o dialog e as ações
  const handleAddNew = () => {
    setSelectedClient(undefined);
    // setIsDialogOpen(true); // Desativado temporariamente
    alert("Função 'Adicionar Novo Cliente' a ser implementada.");
  };

  const handleEdit = (cliente: Cliente) => {
    setSelectedClient(cliente);
    // setIsDialogOpen(true); // Desativado temporariamente
    alert("Função 'Editar Cliente' a ser implementada.");
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
                  {/* Documentação da Correção: Cabeçalhos da tabela atualizados */}
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
                      {/* Documentação da Correção: Acesso aos dados corrigido */}
                      <TableCell className="font-medium text-gray-800">{cliente.fullName}</TableCell>
                      <TableCell className="text-gray-800">{cliente.cpf}</TableCell>
                      <TableCell className="text-gray-800">{cliente.phone}</TableCell>
                      <TableCell className="text-gray-800">
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

      {/* O Dialog para o formulário pode ser reativado depois de ajustarmos o formulário aos novos campos */}
      {/*
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedClient ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</DialogTitle>
          </DialogHeader>
          // <ClientForm 
          //   initialData={selectedClient} 
          //   onSuccess={() => setIsDialogOpen(false)} 
          // />
        </DialogContent>
      </Dialog>
      */}
    </div>
  );
}

export default withAuth(ClientesPage);