import { z } from 'zod';

export const VendaSchema = z.object({
  cliente: z.object({
    _id: z.string(),
    fullName: z.string(),
  }).nullable().refine(val => val !== null, { message: "Cliente é obrigatório." }),
  
  itens: z.array(z.object({
    produto: z.object({ _id: z.string(), nome: z.string(), codigo: z.string(), precoVenda: z.number() }),
    quantidade: z.number().min(1, "Quantidade deve ser ao menos 1"),
    precoUnitario: z.number().min(0, "Preço deve ser positivo"),
  })).min(1, { message: "A venda deve ter pelo menos um item." }),
  
  pagamento: z.object({
    metodo: z.string().min(1, { message: "Método de pagamento é obrigatório."}),
    parcelas: z.number().optional(),
  }),

  dataVenda: z.string().refine(d => d, { message: "Data da venda é obrigatória." }),
});

export type TVendaSchema = z.infer<typeof VendaSchema>;