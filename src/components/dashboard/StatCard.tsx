import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode; 
  content?: React.ReactNode; // Adicionamos uma propriedade opcional para conteúdo extra
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, content }) => {
  return (
    // Documentação: 
    // - Revertemos o 'bg-red-500' para 'bg-card' para manter o efeito de vidro.
    // - Ajustamos o alinhamento para 'items-start' para alinhar o conteúdo no topo.
    <div className="bg-card text-card-foreground p-6 rounded-xl shadow-xl flex items-start space-x-4 backdrop-blur-lg border border-border">
      <div className="bg-primary/70 p-3 rounded-full">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-blue-300 text-sm">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {/* Renderiza o conteúdo extra se ele for passado */}
        {content}
      </div>
    </div>
  );
};

export default StatCard;