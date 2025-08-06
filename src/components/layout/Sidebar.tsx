'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Package, ShoppingCart, FileText, Calendar } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Produtos', href: '/produtos', icon: Package },
  { name: 'Vendas', href: '/vendas', icon: ShoppingCart },
  { name: 'Boletos', href: '/boletos', icon: FileText },
  { name: 'Agendamentos', href: '/agendamentos', icon: Calendar },
];

interface SidebarProps {
  onLinkClick?: () => void;
}

export default function Sidebar({ onLinkClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    // Documentação: Aplicamos o efeito de vidro na sidebar.
    // - bg-sidebar/80: Usamos a cor da variável --sidebar com 80% de opacidade.
    // - backdrop-blur-xl: Adiciona um desfoque intenso no fundo.
    <aside className="w-full h-full bg-sidebar/80 text-white p-4 backdrop-blur-xl border-r border-sidebar-border">
      <h1 className="text-2xl font-bold mb-8">Ótica ERP</h1>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={onLinkClick}
                // Documentação: O estilo do link ativo agora usa a cor de realce da sidebar (--sidebar-accent)
                className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${
                  pathname === item.href
                    ? 'bg-sidebar-accent'
                    : 'hover:bg-sidebar-accent/50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}