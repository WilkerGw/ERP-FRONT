'use client';

import { useState, useEffect } from 'react';
import withAuth from "@/components/auth/withAuth";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AgendamentoSchema, TAgendamentoSchema } from '@/lib/validators/agendamentoValidator';
import { formatPhoneForWhatsApp } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Trash2, MessageSquare } from "lucide-react";

type Agendamento = TAgendamentoSchema & { _id: string };

function AgendamentoForm({ onSuccess, initialData }: { onSuccess: () => void, initialData?: Agendamento | null }) {
  const queryClient = useQueryClient();
  const form = useForm<TAgendamentoSchema>({
    resolver: zodResolver(AgendamentoSchema),
  });

  useEffect(() => {
    if (initialData) {
      const defaultVals = {
        ...initialData,
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
      };
      form.reset(defaultVals);
    } else {
      form.reset({
        name: '', telephone: '', date: '', hour: '', observation: '', status: 'Aberto',
      });
    }
  }, [initialData, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: TAgendamentoSchema) => initialData?._id ? api.put(`/agendamentos/${initialData._id}`, data) : api.post('/agendamentos', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      onSuccess();
    },
    onError: (err: any) => alert(err.response?.data?.message || 'Erro'),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="telephone" render={({ field }) => (<FormItem><FormLabel>Telefone / WhatsApp</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="hour" render={({ field }) => (<FormItem><FormLabel>Hora</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        {initialData && (
          <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Aberto">Aberto</SelectItem><SelectItem value="Compareceu">Compareceu</SelectItem><SelectItem value="Faltou">Faltou</SelectItem><SelectItem value="Cancelado">Cancelado</SelectItem></SelectContent></Select><FormMessage/></FormItem>)}/>
        )}
        <FormField control={form.control} name="observation" render={({ field }) => (<FormItem><FormLabel>Observação</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit" disabled={isPending}>{isPending ? 'Salvando...' : 'Salvar Agendamento'}</Button>
      </form>
    </Form>
  );
}

function AgendamentosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState<Agendamento | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: agendamentos, isLoading } = useQuery<Agendamento[]>({
    queryKey: ['agendamentos', searchTerm],
    queryFn: async () => api.get('/agendamentos', { params: { search: searchTerm } }).then(res => res.data),
  });

  const { mutate: deleteAgendamento } = useMutation({
    mutationFn: (id: string) => api.delete(`/agendamentos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      alert('Agendamento deletado!');
    },
  });

  const handleEdit = (agendamento: Agendamento) => {
    setEditingAgendamento(agendamento);
    setIsModalOpen(true);
  };
  const handleCreate = () => {
    setEditingAgendamento(null);
    setIsModalOpen(true);
  };

  const getStatusVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    switch(status) {
      case 'Compareceu': return 'default';
      case 'Faltou': return 'destructive';
      case 'Cancelado': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="p-4 md:p-8">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Agendamentos</h1>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
          <Input placeholder="Buscar por nome..." className="w-full md:w-80" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <Button onClick={handleCreate} className="text-white">Novo Agendamento</Button>
        </div>
      </header>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
            <DialogDescription>{editingAgendamento ? 'Altere os dados.' : 'Preencha os dados.'}</DialogDescription>
          </DialogHeader>
          <AgendamentoForm onSuccess={() => setIsModalOpen(false)} initialData={editingAgendamento} />
        </DialogContent>
      </Dialog>
      
      <main className="bg-white p-6 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow><TableHead>Data</TableHead><TableHead>Hora</TableHead><TableHead>Nome</TableHead><TableHead>Telefone</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (<TableRow><TableCell colSpan={6}>Carregando...</TableCell></TableRow>) : 
              agendamentos?.map((ag) => (
                <TableRow key={ag._id}>
                  <TableCell>{new Date(ag.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                  <TableCell>{ag.hour}</TableCell>
                  <TableCell className="font-medium">{ag.name}</TableCell>
                  <TableCell>{ag.telephone}</TableCell>
                  <TableCell><Badge variant={getStatusVariant(ag.status)}>{ag.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild className="cursor-pointer"><a href={`https://wa.me/${formatPhoneForWhatsApp(ag.telephone)}`} target="_blank" rel="noopener noreferrer" className="flex items-center"><MessageSquare className="mr-2 h-4 w-4" /> Enviar WhatsApp</a></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(ag)} className="cursor-pointer">Editar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={() => {if(confirm('Tem certeza?')) deleteAgendamento(ag._id)}}><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
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

export default withAuth(AgendamentosPage);