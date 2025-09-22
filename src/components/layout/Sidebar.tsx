"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  FileText,
  Calendar,
  BarChart3,
} from "lucide-react";
import Image from "next/image";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Agendamentos", href: "/agendamentos", icon: Calendar },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Vendas", href: "/vendas", icon: ShoppingCart },
  { name: "Boletos", href: "/boletos", icon: FileText },
  { name: "Produtos", href: "/produtos", icon: Package },
];

interface SidebarProps {
  onLinkClick?: () => void;
}

export default function Sidebar({ onLinkClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    // Documentação da Sidebar:
    // - bg-sidebar: Usa a nova cor de fundo definida no globals.css (branco).
    // - border-r: Adiciona uma borda à direita para separar do conteúdo.
    // - O logo é centralizado com um espaçamento melhor.
    // - Os links de navegação têm um hover mais sutil e um estado ativo (página atual) bem definido com cor primária.
    <aside className="w-full h-full flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border flex justify-center">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo-mind.png"
            alt="Logo"
            width={150}
            height={150}
            className="w-20 h-20"
          />
        </Link>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={onLinkClick}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all text-sm font-medium
                  ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary" // Estilo do link ativo
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground" // Estilo padrão e hover
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