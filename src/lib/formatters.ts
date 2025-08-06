// Esta função formata uma string para o padrão de CPF: 999.999.999-99
export const formatCPF = (value: string): string => {
  // 1. Remove tudo que não for dígito
  const numericValue = value.replace(/\D/g, '');

  // 2. Aplica a máscara de CPF
  return numericValue
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
};

// Esta função formata uma string para o padrão de CEP: 99999-999
export const formatCEP = (value: string): string => {
  // 1. Remove tudo que não for dígito
  const numericValue = value.replace(/\D/g, '');

  // 2. Aplica a máscara de CEP
  return numericValue
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
};

// --- NOVA FUNÇÃO AQUI ---
// Prepara o número de telefone para ser usado em um link do WhatsApp
export const formatPhoneForWhatsApp = (phone: string): string => {
  // 1. Remove tudo que não for dígito
  const numericValue = phone.replace(/\D/g, '');

  // 2. Se o número já incluir o código do país (55), retorna como está.
  //    Senão, adiciona o código do Brasil (55) no início.
  if (numericValue.startsWith('55')) {
    return numericValue;
  }
  return `55${numericValue}`;
};