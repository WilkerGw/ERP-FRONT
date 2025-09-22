import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  content?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, content }) => {
  return (
    // Documentação do StatCard:
    // - Usa o componente <Card> padrão para consistência.
    // - O layout interno é flexível para alinhar o título e o ícone.
    // - O ícone agora fica no cabeçalho, à direita do título, para uma aparência mais integrada.
    // - O valor principal (`value`) tem grande destaque.
    // - O conteúdo adicional (`content`) é renderizado abaixo, se existir.
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
        </div>
        {content}
      </CardContent>
    </Card>
  );
};

export default StatCard;