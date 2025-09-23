// Caminho: ERP-FRONT-main/src/components/dashboard/StatCard.tsx

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
    // 1. Removida a classe inválida "w-sm".
    // 2. Adicionamos "flex flex-col" para garantir que o conteúdo se alinhe verticalmente.
    // 3. Adicionamos "h-full" para que todos os cards na mesma linha do grid tenham a mesma altura.
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      {/* 4. Adicionamos "flex-grow" para que esta área cresça e preencha o espaço vertical disponível,
          útil para cards com mais conteúdo como o de "Aniversariantes". */}
      <CardContent className="flex-grow">
        <div className="text-2xl font-bold">
          {value}
        </div>
        {content}
      </CardContent>
    </Card>
  );
};

export default StatCard;