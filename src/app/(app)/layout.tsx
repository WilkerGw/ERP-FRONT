'use client';

import Sidebar from "@/components/layout/Sidebar";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100">
      {/* Sidebar para telas grandes (fixa) - não precisa da função de fechar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-10 lg:w-64">
        <Sidebar />
      </aside>
      
      <div className="flex flex-col lg:pl-64">
        {/* Cabeçalho para telas pequenas */}
        <header className="flex h-14 items-center gap-4 border-b bg-white px-4 lg:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir ou fechar menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              {/* --- MUDANÇA AQUI --- */}
              {/* Passamos a função para a Sidebar que está dentro do menu móvel */}
              <Sidebar onLinkClick={() => setIsSheetOpen(false)} />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold">Ótica ERP</h1>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}