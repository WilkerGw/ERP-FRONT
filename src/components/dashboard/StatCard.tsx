import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode; 
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    // Documentação: O StatCard também se torna um card de vidro.
    <div className="bg-card text-card-foreground p-6 rounded-xl shadow-xl flex items-center space-x-4 backdrop-blur-lg border border-border">
      {/* Ajustamos a cor de fundo do ícone para combinar com o novo visual */}
      <div className="bg-primary/10 p-3 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-muted-foreground text-sm">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;