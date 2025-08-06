'use client';

import { useState, useEffect } from 'react';
import withAuth from "@/components/auth/withAuth";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import axios from 'axios'; // Importa o axios

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, MessageSquare } from "lucide-react";
import AddClientForm from '@/components/clientes/AddClientForm';
import { formatPhoneForWhatsApp } from '@/lib/formatters';

interface Cliente {
  _id: string;
  fullName: string;
  cpf: string;
  phone: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  cep?: string;
  notes?: string;
  esfericoDireito?: string;
  cilindricoDireito?: string;
  eixoDireito?: string;
  esfericoEsquerdo?: string;
  cilindricoEsquerdo?: string;
  eixoEsquerdo?: string;
  adicao?: string;
  vencimentoReceita?: string;
}

function ClientesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const timerId = setTimeout(() => { setDebouncedSearchTerm(searchTerm); }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  const { data: clientes, isLoading } = useQuery<Cliente[]>({
    queryKey: ['clientes', debouncedSearchTerm],
    queryFn: async () => api.get('/clientes', { params: { search: debouncedSearchTerm } }).then(res => res.data)
  });
  
  // --- CORREÇÃO AQUI ---
  const { mutate: deleteCliente } = useMutation({
    mutationFn: (id: string) => api.delete(`/clientes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      alert('Cliente excluído com sucesso!');
    },
    onError: (error: unknown) => { // Alterado de 'any' para 'unknown'
      let errorMessage = 'Erro ao excluir cliente.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      alert(errorMessage);
    }
  });

  const handleEdit = (cliente: Cliente) => { setEditingClient(cliente); setIsModalOpen(true); };
  const handleCreate = () => { setEditingClient(null); setIsModalOpen(true); };
  const handleDelete = (id: string) => { if (confirm('Tem certeza?')) { deleteCliente(id); } };

  return (
    <div className="p-4 md:p-8">
      <header className="flex flex-col gap-4 mb-10 md:flex-row md:justify-between md:items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Gestão de Clientes
        </h1>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Input 
            placeholder="Buscar por nome, CPF ou telefone..."
            className="w-full md:w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={handleCreate} className="text-white">
            Cadastrar Novo Cliente
          </Button>
        </div>
      </header>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            <DialogDescription>
              {editingClient ? 'Altere os dados do cliente abaixo.' : 'Preencha os dados do novo cliente.'}
            </DialogDescription>
          </DialogHeader>
          <AddClientForm 
            onSuccess={() => setIsModalOpen(false)} 
            initialData={editingClient}
          />
        </DialogContent>
      </Dialog>
      
      <main className="bg-white p-6 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (<TableRow><TableCell colSpan={4}>Carregando...</TableCell></TableRow>) : 
              clientes?.map((cliente) => (
                <TableRow key={cliente._id}>
                  <TableCell className="font-medium">{cliente.fullName}</TableCell>
                  <TableCell>{cliente.cpf}</TableCell>
                  <TableCell>{cliente.phone}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild className="cursor-pointer"><a href={`https://wa.me/${formatPhoneForWhatsApp(cliente.phone)}`} target="_blank" rel="noopener noreferrer" className="flex items-center"><MessageSquare className="mr-2 h-4 w-4" /> Enviar WhatsApp</a></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(cliente)} className="cursor-pointer">Editar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={() => handleDelete(cliente._id)}><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}

export default withAuth(ClientesPage);