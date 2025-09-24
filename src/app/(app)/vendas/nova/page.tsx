// Caminho: ERP-FRONT-main/src/app/(app)/vendas/nova/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Trash2 } from 'lucide-react';
import api from '@/services/api';
import { vendaFormValidator, TVendaFormValidator } from '@/lib/validators/vendaValidator';
import { formatCurrency } from '@/lib/formatters';
import { AxiosError } from 'axios'; // Importamos o tipo de erro

interface ICliente {
  _id: string;
  fullName: string;
}

interface IProduto {
  _id: string;
  nome: string;
}

const NovaVendaPage = () => {
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [produtos, setProdutos] = useState<IProduto[]>([]);
  const [buscaCliente, setBuscaCliente] = useState('');
  const [buscaProduto, setBuscaProduto] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState<ICliente | null>(null);

  const form = useForm<TVendaFormValidator>({
    resolver: zodResolver(vendaFormValidator),
    defaultValues: {
      clienteId: '',
      produtos: [],
      porcentagemEntrada: 0,
      condicaoPagamento: 'À vista',
      metodoPagamento: 'Dinheiro',
      parcelas: 1,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "produtos",
  });

  useEffect(() => {
    const fetchClientes = async () => {
      if (buscaCliente.length >= 1) { 
        try {
          const { data } = await api.get(`/clientes?search=${buscaCliente}`);
          setClientes(data);
        } catch (error) {
          console.error("Erro ao buscar clientes:", error);
        }
      } else {
        setClientes([]);
      }
    };
    const debounce = setTimeout(fetchClientes, 300);
    return () => clearTimeout(debounce);
  }, [buscaCliente]);

  useEffect(() => {
    const fetchProdutos = async () => {
      if (buscaProduto.length >= 1) {
        try {
          const { data } = await api.get(`/produtos?search=${buscaProduto}`);
          setProdutos(data);
        } catch (error) {
          console.error("Erro ao buscar produtos:", error);
        }
      } else {
        setProdutos([]);
      }
    };
    const debounce = setTimeout(fetchProdutos, 300);
    return () => clearTimeout(debounce);
  }, [buscaProduto]);


  const selecionarCliente = (cliente: ICliente) => {
    form.setValue('clienteId', cliente._id);
    setClienteSelecionado(cliente);
    setBuscaCliente('');
    setClientes([]);
  };

  const adicionarProduto = (produto: IProduto) => {
    append({
      produtoId: produto._id,
      nome: produto.nome,
      quantidade: 1,
      valorUnitario: 0,
    });
    setBuscaProduto('');
    setProdutos([]);
  };

  const produtosDaVenda = form.watch('produtos');
  const porcentagemEntrada = form.watch('porcentagemEntrada');
  const condicaoPagamento = form.watch('condicaoPagamento');

  const valorTotal = produtosDaVenda.reduce((acc, produto) => {
    return acc + (produto.quantidade * produto.valorUnitario);
  }, 0);

  const valorEntrada = (valorTotal * (porcentagemEntrada || 0)) / 100;
  const valorRestante = valorTotal - valorEntrada;
  const porcentagemRestante = 100 - (porcentagemEntrada || 0);

  // --- FUNÇÃO onSubmit ATUALIZADA ---
  const onSubmit = async (data: TVendaFormValidator) => {
    try {
      const payload = {
        cliente: data.clienteId,
        produtos: data.produtos.map(p => ({ 
            produto: p.produtoId, 
            quantidade: p.quantidade, 
            valorUnitario: p.valorUnitario 
        })),
        pagamento: {
          valorEntrada,
          valorRestante,
          metodoPagamento: data.metodoPagamento,
          condicaoPagamento: data.condicaoPagamento,
          parcelas: data.condicaoPagamento === 'A prazo' ? data.parcelas : undefined
        }
      };

      await api.post('/vendas', payload);
      alert('Venda criada com sucesso!');
      form.reset();
      setClienteSelecionado(null);

    } catch (error) { // Removemos o ': any'
      console.error("Erro ao criar venda:", error);
      // Verificamos se o erro é uma instância de AxiosError
      if (error instanceof AxiosError && error.response?.data?.message) {
        alert(`Falha ao criar a venda: ${error.response.data.message}`);
      } else {
        alert('Falha ao criar a venda. Verifique os dados e tente novamente.');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl text-blue-300">Nova Venda</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <Card>
            <CardHeader>
              <CardTitle className='text-gray-800/50'>1. Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Buscar cliente por nome..."
                  value={buscaCliente}
                  onChange={(e) => setBuscaCliente(e.target.value)}
                  className="pl-10"
                />
                {clientes.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-60 overflow-y-auto">
                    {clientes.map(cliente => (
                      <li key={cliente._id} onClick={() => selecionarCliente(cliente)} className="p-2 hover:bg-gray-100 cursor-pointer">
                        {cliente.fullName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {clienteSelecionado && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="font-semibold">Cliente Selecionado:</p>
                  <p>{clienteSelecionado.fullName}</p>
                </div>
              )}
              <FormField
                  control={form.control}
                  name="clienteId"
                  render={({ field }) => (
                      <FormItem>
                          <FormControl>
                              <Input type="hidden" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-gray-800/50'>2. Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Buscar produto por nome..."
                  value={buscaProduto}
                  onChange={(e) => setBuscaProduto(e.target.value)}
                  className="pl-10"
                />
                {produtos.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-60 overflow-y-auto">
                    {produtos.map(produto => (
                      <li key={produto._id} onClick={() => adicionarProduto(produto)} className="p-2 hover:bg-gray-100 cursor-pointer">
                        {produto.nome}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="w-24">Qtd.</TableHead>
                    <TableHead className="w-36">Valor Unitário</TableHead>
                    <TableHead className="w-36 text-right">Subtotal</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell className='text-gray-800/50'>{field.nome}</TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`produtos.${index}.quantidade`}
                          render={({ field }) => (
                            <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                         <FormField
                          control={form.control}
                          name={`produtos.${index}.valorUnitario`}
                          render={({ field }) => (
                            <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-right text-gray-800/50">
                        {formatCurrency(produtosDaVenda[index].quantidade * produtosDaVenda[index].valorUnitario)}
                      </TableCell>
                       <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
               {form.formState.errors.produtos && <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.produtos.message}</p>}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>3. Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FormField
                control={form.control}
                name="porcentagemEntrada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entrada (%)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 50" {...field} onChange={e => field.onChange(Number(e.target.value))}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condicaoPagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condição</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a condição" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="À vista">À vista</SelectItem>
                        <SelectItem value="A prazo">A prazo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metodoPagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a forma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                        <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="Boleto">Boleto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {condicaoPagamento === 'A prazo' && (
                <FormField
                  control={form.control}
                  name="parcelas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parcelas</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ex: 3" {...field} onChange={e => field.onChange(Number(e.target.value))}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
            <CardFooter className="flex justify-end bg-gray-50 p-4 rounded-b-md">
                <div className='text-right'>
                    <p>Valor de Entrada: <span className='font-bold'>{formatCurrency(valorEntrada)}</span></p>
                    <p>Valor Restante: <span className='font-bold'>{formatCurrency(valorRestante)}</span></p>
                    <p>Restante na Entrega: <span className='font-bold'>{porcentagemRestante.toFixed(2)}%</span></p>
                    <p className='text-xl font-bold mt-2'>Total da Venda: {formatCurrency(valorTotal)}</p>
                </div>
            </CardFooter>
          </Card>

          <div className="flex justify-end">
            <Button className='text-gray-800/50 cursor-pointer' type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Salvando...' : 'Finalizar Venda'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NovaVendaPage;