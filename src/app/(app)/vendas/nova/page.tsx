'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import withAuth from "@/components/auth/withAuth";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray, Controller, FieldErrors } from 'react-hook-form';
import api from '@/services/api';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { VendaSchema, TVendaSchema } from '@/lib/validators/vendaValidator';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash2, ChevronsUpDown } from 'lucide-react';

interface Cliente { _id: string; fullName: string; }
interface Produto { _id: string; nome: string; codigo: string; precoVenda: number; }

const getTodayString = () => new Date().toISOString().split('T')[0];

function NovaVendaPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [clientePopoverOpen, setClientePopoverOpen] = useState(false);
  const [produtoPopoverOpen, setProdutoPopoverOpen] = useState(false);
  const [clienteSearch, setClienteSearch] = useState('');
  const [produtoSearch, setProdutoSearch] = useState('');

  const { data: clientes } = useQuery<Cliente[]>({
    queryKey: ['clientes', clienteSearch],
    queryFn: () => api.get(`/clientes?search=${clienteSearch}`).then(res => res.data),
    enabled: clienteSearch.length >= 1,
  });

  const { data: produtos } = useQuery<Produto[]>({
    queryKey: ['produtos', produtoSearch],
    queryFn: () => api.get(`/produtos?search=${produtoSearch}`).then(res => res.data),
    enabled: produtoSearch.length >= 1,
  });

  const form = useForm<TVendaSchema>({
    resolver: zodResolver(VendaSchema),
    defaultValues: {
      cliente: null,
      itens: [],
      pagamento: { metodo: undefined, parcelas: 1 },
      dataVenda: getTodayString(),
    },
  });
  
  const { control, handleSubmit, watch, setValue, register } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "itens" });
  const itensVenda = watch('itens');
  const valorTotal = itensVenda.reduce((acc, item) => acc + (Number(item.precoUnitario || 0) * Number(item.quantidade || 0)), 0);
  const metodoPagamento = watch('pagamento.metodo');
  
  const { mutate, isPending } = useMutation({
    mutationFn: (data: TVendaSchema) => {
      const payload = {
        cliente: data.cliente?._id,
        itens: data.itens.map(item => ({
          produto: item.produto._id,
          quantidade: Number(item.quantidade),
          precoUnitario: Number(item.precoUnitario),
        })),
        pagamento: {
          metodo: data.pagamento.metodo,
          parcelas: Number(data.pagamento.parcelas),
        },
        valorTotal,
        dataVenda: data.dataVenda,
      };
      return api.post('/vendas', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      alert('Venda registrada com sucesso!');
      router.push('/vendas');
    },
    onError: (error: unknown) => {
      let errorMessage = 'Erro ao registrar venda';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      alert(errorMessage);
    },
  });
  
  const onValidSubmit = (data: TVendaSchema) => {
    console.log("Validação passou! Enviando para a API:", data);
    mutate(data);
  };

  const onInvalidSubmit = (errors: FieldErrors<TVendaSchema>) => {
    console.error("Validação do formulário falhou! Erros:", errors);
    alert("Existem erros no formulário. Verifique os campos marcados em vermelho e tente novamente.");
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)} className="p-4 md:p-8 space-y-6">
        <h1 className="text-3xl text-blue-300">Registrar Nova Venda</h1>
        <Card>
          <CardHeader><CardTitle>1. Dados da Venda</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="cliente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Popover open={clientePopoverOpen} onOpenChange={setClientePopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" role="combobox" className="w-full bg-white/20 rounded-sm justify-between text-white/50">
                          {field.value ? field.value.fullName : "Selecione um cliente..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar cliente..." onValueChange={setClienteSearch} />
                        <CommandList>
                          <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                          <CommandGroup>
                            {clientes?.map(c => (
                              <CommandItem key={c._id} value={c.fullName} onSelect={() => { setValue('cliente', c, { shouldValidate: true }); setClientePopoverOpen(false); }}>
                                {c.fullName}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="dataVenda"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da Venda</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className='lg:w-[10rem]' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>2. Adicione os Produtos</CardTitle></CardHeader>
          <CardContent>
            <Popover open={produtoPopoverOpen} onOpenChange={setProdutoPopoverOpen}>
              <PopoverTrigger asChild><Button type="button" variant="outline" className='bg-white/20 rounded-sm text-white/50'>Adicionar Produto</Button></PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Buscar produto..." onValueChange={setProdutoSearch} />
                  <CommandList>
                    <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                    <CommandGroup>
                      {produtos?.map(produto => (
                        <CommandItem key={produto._id} value={produto.nome} onSelect={() => {
                          append({ produto, quantidade: 1, precoUnitario: produto.precoVenda });
                          setProdutoPopoverOpen(false);
                        }}>
                          {produto.nome} ({produto.codigo})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="overflow-x-auto mt-4">
              <Table className="min-w-[600px]">
                <TableHeader><TableRow><TableHead>Produto</TableHead><TableHead className="w-[100px]">Qtd.</TableHead><TableHead className="w-[150px]">Preço Unit.</TableHead><TableHead>Subtotal</TableHead><TableHead className="w-[50px]"></TableHead></TableRow></TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>{field.produto.nome}</TableCell>
                      <TableCell><Input type="number" defaultValue={1} {...register(`itens.${index}.quantidade`, { valueAsNumber: true })} className="w-20" /></TableCell>
                      <TableCell><Input type="number" step="0.01" {...register(`itens.${index}.precoUnitario`, { valueAsNumber: true })} className="w-28" /></TableCell>
                      <TableCell>{(itensVenda[index]?.quantidade * itensVenda[index]?.precoUnitario || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" type="button" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>3. Pagamento</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={control}
                name="pagamento.metodo"
                render={({ field, fieldState }) => (
                  <div>
                    <FormLabel>Método de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="mt-2"><SelectValue placeholder="Selecione..." className='text-white/50'/></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="Pix">Pix</SelectItem>
                        <SelectItem value="Débito">Débito</SelectItem>
                        <SelectItem value="Crédito">Crédito</SelectItem>
                        <SelectItem value="Boleto">Boleto</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.error && <FormMessage className="mt-1">{fieldState.error.message}</FormMessage>}
                  </div>
                )}
              />
              {(metodoPagamento === 'Crédito' || metodoPagamento === 'Boleto') && (
                <Controller
                  control={control}
                  name="pagamento.parcelas"
                  render={({ field }) => (
                    <div>
                      <FormLabel>Nº de Parcelas</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value, 10))} defaultValue={String(field.value)}>
                        <FormControl><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {Array.from({ length: metodoPagamento === 'Crédito' ? 15 : 10 }, (_, i) => i + 1).map(p => (
                            <SelectItem key={p} value={String(p)}>{p}x</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
              )}
            </div>
            <div className="text-right text-2xl font-bold pt-4 text-blue-300">
              Total: {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isPending || itensVenda.length === 0 || !watch('cliente')}>
            {isPending ? 'Finalizando...' : 'Finalizar Venda'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default withAuth(NovaVendaPage);