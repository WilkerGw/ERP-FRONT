import { z } from 'zod';

export const ProdutoSchema = z.object({
  codigo: z.string().min(1, { message: 'Código é obrigatório.' }),
  nome: z.string().min(3, { message: 'O nome deve ter no mínimo 3 caracteres.' }),

  // --- MUDANÇA PRINCIPAL AQUI ---
  // Validamos como string e transformamos para número
  precoCusto: z.string()
    .min(1, { message: "Preço de custo é obrigatório." })
    .transform(val => Number(val))
    .refine(val => val >= 0, { message: 'Preço de custo deve ser positivo.' }),
    
  precoVenda: z.string()
    .min(1, { message: "Preço de venda é obrigatório." })
    .transform(val => Number(val))
    .refine(val => val >= 0, { message: 'Preço de venda deve ser positivo.' }),
    
  estoque: z.string()
    .min(1, { message: "Estoque é obrigatório." })
    .transform(val => Number(val))
    .refine(val => Number.isInteger(val), { message: 'Estoque deve ser um número inteiro.' }),

  tipo: z.enum(['Óculos de Sol', 'Óculos de Grau', 'Lente de Contato', 'Serviço/Conserto']),
});

export type TProdutoSchema = z.infer<typeof ProdutoSchema>;