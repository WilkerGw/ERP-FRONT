// Caminho: ERP-FRONT-main/src/lib/validators/vendaValidator.ts

import { z } from 'zod';

// Sub-esquema para cada item da venda
const ItemVendaSchema = z.object({
  produto: z.object({
    _id: z.string(),
    nome: z.string(),
    codigo: z.string(),
    precoVenda: z.number(),
  }),
  quantidade: z.coerce.number().min(1, "A quantidade deve ser pelo menos 1"),
  precoUnitario: z.coerce.number().min(0, "O preço deve ser positivo"),
});

// Sub-esquema para cada método de pagamento
const PagamentoSchema = z.object({
  metodo: z.string().min(1, { message: "Método de pagamento é obrigatório."}),
  valor: z.coerce.number().min(0.01, { message: "O valor do pagamento deve ser maior que zero."}),
  parcelas: z.coerce.number().optional(),
});

// Esquema principal da Venda, agora atualizado
export const VendaSchema = z.object({
  cliente: z.object({
    _id: z.string(),
    fullName: z.string(),
  }).nullable().refine(val => val !== null, { message: "Cliente é obrigatório." }),
  
  itens: z.array(ItemVendaSchema).min(1, { message: "A venda deve ter pelo menos um item." }),
  
  // Agora é um array de pagamentos
  pagamentos: z.array(PagamentoSchema),

  // Novo campo para o valor a ser pago na entrega
  valorPendenteEntrega: z.coerce.number().min(0, "O valor pendente não pode ser negativo.").optional(),

  dataVenda: z.string().refine(d => d, { message: "Data da venda é obrigatória." }),
});

export type TVendaSchema = z.infer<typeof VendaSchema>;