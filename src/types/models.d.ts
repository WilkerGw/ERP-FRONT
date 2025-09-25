// Caminho: src/types/models.d.ts

// Interfaces que representam os dados após o 'populate' do Mongoose no backend

export interface IClientePopulado {
  _id: string;
  fullName: string;
  email?: string;
  phone?: string;
}

export interface IProdutoPopulado {
  _id: string;
  nome: string;
  codigo?: string;
}

export interface IProdutoVendaPopulado {
  produto: IProdutoPopulado;
  quantidade: number;
  valorUnitario: number;
  _id: string;
}

export interface IPagamento {
  valorEntrada: number;
  valorRestante: number;
  metodoPagamento: 'Dinheiro' | 'Cartão de Crédito' | 'Cartão de Débito' | 'PIX' | 'Boleto';
  condicaoPagamento: 'À vista' | 'A prazo';
  parcelas?: number;
}

export interface IVendaPopulada {
  _id: string;
  cliente: IClientePopulado;
  produtos: IProdutoVendaPopulado[];
  valorTotal: number;
  pagamento: IPagamento;
  status: 'Pendente' | 'Concluído' | 'Cancelado';
  dataVenda: string;
}