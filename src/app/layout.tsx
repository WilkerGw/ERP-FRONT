import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mind ERP",
  description: "ERP Completo para gestão de Óticas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Documentação da Correção:
    // - Adicionamos a tag <html> com o atributo lang="pt-BR" para indicar o idioma principal da página.
    // - Adicionamos a tag <body>, que é onde todo o conteúdo visível da página deve residir.
    // - Aplicamos a classe da fonte 'Inter' (`inter.className`) ao body, como é a prática recomendada pelo Next.js.
    // - O componente <Providers> e os {children} (o conteúdo das suas páginas) ficam dentro do <body>.
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}