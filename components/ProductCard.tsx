
import React from 'react';
import { Product } from '../types';
import { COLORS } from '../constants';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onClick: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onClick }) => {
  const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/400?text=Imagen+No+Disponible';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `data:image/png;base64,${url}`;
  };

  const presentation = product.presentation || (product.category === 'Medicamentos' ? 'CAJA' : 'UNIDAD');
  const regularPrice = product.price * 1.25;

  return (
    <div 
      onClick={() => onClick(product)}
      className="bg-white rounded-3xl p-5 flex flex-col group border border-gray-100 h-full cursor-pointer transition-all hover:shadow-2xl hover:shadow-pink-500/10 hover:-translate-y-1"
    >
      {/* Etiqueta Superior */}
      <div className="mb-3">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {presentation}
        </span>
      </div>

      {/* Imagen del Producto */}
      <div className="relative aspect-square mb-5 overflow-hidden rounded-2xl bg-white flex items-center justify-center p-3">
        <img 
          src={getImageUrl(product.image_url)} 
          alt={product.name}
          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Badge de Descuento (Rosa GIOFARMA) */}
        <div className="absolute bottom-2 right-2">
            <div className="bg-[#e1127a] text-white text-[11px] font-black w-10 h-10 rounded-full flex flex-col items-center justify-center leading-none shadow-lg">
                <span>20%</span>
                <span className="text-[7px] uppercase opacity-80 mt-0.5">DTO</span>
            </div>
        </div>
      </div>
      
      {/* Contenido de Información */}
      <div className="flex flex-col flex-grow">
        {/* Badge Vendedor GIOFARMA */}
        <div className="flex items-center gap-2 mb-3 bg-[#fdf2f8] w-fit px-3 py-1 rounded-full border border-[#fce7f3]">
            <div className="w-4 h-4 rounded-full bg-[#a5cf4c] flex items-center justify-center">
                <i className="fas fa-check text-[8px] text-white"></i>
            </div>
            <span className="text-[10px] font-black text-[#e1127a] uppercase tracking-tighter">GIOFARMA</span>
        </div>

        <h3 className="text-[14px] font-bold text-[#1a2b49] line-clamp-2 min-h-[40px] mb-4 leading-tight group-hover:text-[#e1127a] transition-colors">
          {product.name}
        </h3>
        
        <div className="mt-auto">
          {/* Layout de Precios Doble */}
          <div className="flex justify-between items-end mb-5 pb-4 border-b border-gray-50">
            <div className="flex flex-col">
                <span className="text-[10px] text-[#e1127a] font-bold uppercase leading-none mb-1">Precio Online</span>
                <div className="flex items-baseline gap-0.5">
                    <span className="text-xs font-bold text-[#1a2b49]">S/</span>
                    <span className="text-2xl font-black text-[#1a2b49] leading-none tracking-tighter">{product.price.toFixed(2)}</span>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">Regular</span>
                <div className="flex items-baseline gap-0.5">
                    <span className="text-[10px] font-bold text-gray-400">S/</span>
                    <span className="text-sm font-bold text-gray-400 line-through leading-none">{regularPrice.toFixed(2)}</span>
                </div>
            </div>
          </div>
          
          {/* Botones de Acción */}
          <div className="flex gap-3">
            <button
              onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
              }}
              disabled={product.stock === 0}
              className={`flex-grow py-3.5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest shadow-lg ${
                product.stock === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-[#e1127a] text-white hover:bg-[#c2185b] active:scale-[0.97] shadow-pink-200'
              }`}
            >
              <i className="fas fa-plus-circle"></i>
              Agregar
            </button>
            <button className="w-12 h-12 rounded-2xl border-2 border-gray-50 flex items-center justify-center text-[#e1127a] hover:bg-[#fdf2f8] transition-colors group/heart">
              <i className="far fa-heart transition-transform group-hover/heart:scale-110"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
