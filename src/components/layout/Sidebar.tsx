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

// 1. Definimos a interface de propriedades para incluir a nova função opcional
interface SidebarProps {
  onLinkClick?: () => void;
}

export default function Sidebar({ onLinkClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full h-full bg-gray-800 text-white p-4">
      <h1 className="text-2xl font-bold mb-8">Ótica ERP</h1>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                // 2. Adicionamos o evento onClick que chama a função recebida
                onClick={onLinkClick}
                className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${
                  pathname === item.href
                    ? 'bg-gray-700'
                    : 'hover:bg-gray-700'
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