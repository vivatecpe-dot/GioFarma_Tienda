
import React from 'react';
import { LOGO_URL, COLORS } from '../constants';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  logoUrl?: string;
  onOpenMyOrders: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  cartCount, 
  onOpenCart, 
  searchQuery, 
  setSearchQuery, 
  logoUrl,
  onOpenMyOrders
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4 lg:gap-8">
          {/* Logo y Menu */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <button className="text-gray-600 hover:text-[#e1127a] transition-colors p-2 lg:hidden">
              <i className="fas fa-bars text-xl"></i>
            </button>
            <div className="cursor-pointer" onClick={() => window.location.reload()}>
              <img 
                src={logoUrl || LOGO_URL} 
                alt="GIOFARMA" 
                className="h-10 md:h-12 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x60?text=GIOFARMA';
                }}
              />
            </div>
          </div>

          {/* Buscador - Estilo Mifarma */}
          <div className="flex-grow max-w-2xl relative hidden md:block">
            <div className="flex border-2 border-gray-100 rounded-2xl overflow-hidden focus-within:border-[#e1127a] transition-all">
              <input
                type="text"
                placeholder="Busca una marca o producto"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-6 pr-4 py-3 bg-[#f1f4f8] border-none outline-none text-sm font-medium"
              />
              <button className="bg-[#e1127a] text-white px-8 hover:brightness-110 transition-all">
                <i className="fas fa-search text-lg"></i>
              </button>
            </div>
          </div>

          {/* Acciones del Header */}
          <div className="flex items-center gap-3 lg:gap-6 ml-auto">
            <div 
              onClick={onOpenMyOrders}
              className="hidden lg:flex items-center gap-2 text-[#1a2b49] cursor-pointer hover:text-[#e1127a] transition-colors group"
            >
              <i className="fas fa-clipboard-list text-lg text-[#e1127a]"></i>
              <span className="text-[11px] font-bold">Mis pedidos</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[#1a2b49] cursor-pointer hover:text-[#e1127a] transition-colors">
              <i className="far fa-user text-lg"></i>
              <span className="text-[11px] font-bold">Inicia sesión</span>
            </div>

            <button 
              onClick={onOpenCart}
              className="relative flex items-center justify-center h-12 w-14 bg-[#fdf2f8] text-[#e1127a] rounded-2xl hover:bg-[#e1127a] hover:text-white transition-all group shadow-sm"
            >
              <i className="fas fa-shopping-basket text-xl"></i>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#a5cf4c] text-white text-[10px] font-black h-6 w-6 rounded-full flex items-center justify-center border-2 border-white group-hover:bg-[#1a2b49] shadow-md transition-colors">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Buscador Movil */}
        <div className="mt-3 md:hidden">
            <div className="flex border-2 border-gray-50 rounded-xl overflow-hidden">
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-4 py-2.5 bg-[#f1f4f8] border-none outline-none text-sm"
              />
              <button className="bg-[#e1127a] text-white px-5">
                <i className="fas fa-search"></i>
              </button>
            </div>
        </div>
      </div>
    </header>
  );
};
