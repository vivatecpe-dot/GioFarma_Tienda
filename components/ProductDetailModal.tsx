
import React, { useState } from 'react';
import { Product } from '../types';
import { COLORS } from '../constants';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (p: Product, presentation?: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onAddToCart }) => {
  // Presentación dinámica basada en la unidad de medida de Odoo
  const presentationLabel = product.presentation || 'Unidad';
  const [selectedPres, setSelectedPres] = useState(presentationLabel);

  const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/400?text=Imagen+No+Disponible';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `data:image/png;base64,${url}`;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-[32px] w-full max-w-5xl relative overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in duration-300 max-h-[95vh]">
        
        {/* Botón Cerrar */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-10 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <i className="fas fa-times text-gray-500"></i>
        </button>

        {/* Lado Izquierdo: Galería de Imagen */}
        <div className="w-full md:w-1/2 p-12 flex items-center justify-center bg-white">
          <img 
            src={getImageUrl(product.image_url)} 
            alt={product.name} 
            className="max-h-[400px] w-auto object-contain transition-transform duration-700 hover:scale-105"
          />
        </div>

        {/* Lado Derecho: Información de Compra */}
        <div className="w-full md:w-1/2 p-8 md:p-14 overflow-y-auto bg-white">
          <div className="mb-2">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
              {presentationLabel}
            </span>
          </div>
          
          <h2 className="text-3xl font-bold text-[#1a2b49] leading-tight mb-6">
            {product.name}
          </h2>

          {/* Badge de Marca/Genérico */}
          <div className="mb-8">
            <span className="bg-[#f1f4f8] text-[#5e718d] text-[11px] font-black px-5 py-2.5 rounded-full flex items-center w-fit gap-2">
              <i className="fas fa-tag text-[9px]"></i> {product.is_generic ? 'Genérico' : 'Marca'}
            </span>
          </div>

          {/* Precio - Estilo Mifarma */}
          <div className="flex justify-between items-center py-6 border-t border-gray-100 mb-8">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Precio regular</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-[#1a2b49]">S/</span>
              <span className="text-3xl font-black text-[#1a2b49] tracking-tighter">
                {product.price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Selector de Presentación */}
          <div className="mb-10">
            <p className="text-[11px] font-black text-[#1a2b49] uppercase mb-5 tracking-widest">Elige la presentación</p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setSelectedPres(presentationLabel)}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-2 transition-all shadow-sm ${
                  selectedPres === presentationLabel 
                  ? 'border-[#e1127a] bg-[#fdf2f8] text-[#e1127a]' 
                  : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPres === presentationLabel ? 'border-[#e1127a]' : 'border-gray-300'}`}>
                  {selectedPres === presentationLabel && <div className="w-2.5 h-2.5 rounded-full bg-[#e1127a]"></div>}
                </div>
                <span className="text-sm font-black">{presentationLabel}</span>
              </button>
            </div>
          </div>

          {/* Métodos de Entrega Disponibles */}
          <div className="space-y-6 mb-12">
            <p className="text-[11px] font-black text-[#1a2b49] uppercase tracking-widest">Métodos de entrega disponibles:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f0fdf4] flex items-center justify-center flex-shrink-0 text-[#a5cf4c]">
                    <i className="fas fa-truck text-xl"></i>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#1a2b49]">Despacho a domicilio</p>
                  <span className="text-[10px] bg-[#f7fee7] text-[#a5cf4c] font-black px-2.5 py-1 rounded-md uppercase mt-1 inline-block border border-[#d9f99d]">Disponible</span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#fdf2f8] flex items-center justify-center flex-shrink-0 text-[#e1127a]">
                    <i className="fas fa-store text-xl"></i>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#1a2b49]">Retiro en botica (Gratis)</p>
                  <span className="text-[10px] bg-[#f7fee7] text-[#a5cf4c] font-black px-2.5 py-1 rounded-md uppercase mt-1 inline-block border border-[#d9f99d]">Disponible</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción - Colores GIOFARMA */}
          <div className="flex gap-4">
            <button
              onClick={() => onAddToCart(product, selectedPres)}
              className="flex-grow bg-[#e1127a] text-white font-black py-5 rounded-2xl shadow-xl shadow-pink-200 hover:bg-[#c2185b] active:scale-[0.98] transition-all text-sm uppercase tracking-[0.2em]"
            >
              Agregar al carrito
            </button>
            <button className="w-16 h-16 bg-[#fdf2f8] rounded-2xl flex items-center justify-center text-[#e1127a] border-2 border-[#fce7f3] hover:bg-[#fce7f3] transition-colors shadow-sm">
              <i className="far fa-heart text-2xl"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
