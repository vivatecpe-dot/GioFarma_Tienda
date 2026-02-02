
import React from 'react';
import { CartItem } from '../types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: number) => void;
  onUpdateQty: (id: number, delta: number) => void;
  onCheckout: () => void;
  whatsappNumber?: string;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ 
  isOpen, onClose, items, onRemove, onUpdateQty, onCheckout, whatsappNumber 
}) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-bold flex items-center gap-3 text-[#1a2b49]">
              <i className="fas fa-shopping-basket text-[#e1127a]"></i> Tu Pedido
            </h2>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <i className="fas fa-times text-gray-400"></i>
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-cart-plus text-gray-200 text-4xl"></i>
                </div>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Tu carrito está vacío</p>
                <button 
                  onClick={onClose}
                  className="mt-6 text-[#e1127a] font-black text-sm hover:underline"
                >
                  Seguir explorando productos
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-[#fce7f3] transition-colors group">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl p-2 flex-shrink-0">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-sm font-bold text-[#1a2b49] line-clamp-1 mb-1">{item.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">{item.selectedPresentation || 'Unidad'}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-gray-100 rounded-xl bg-gray-50 overflow-hidden">
                        <button 
                          onClick={() => onUpdateQty(item.id, -1)}
                          className="px-3 py-1.5 hover:bg-white hover:text-[#e1127a] transition-colors"
                        >-</button>
                        <span className="px-4 py-1.5 font-bold text-sm text-[#1a2b49]">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQty(item.id, 1)}
                          className="px-3 py-1.5 hover:bg-white hover:text-[#e1127a] transition-colors"
                        >+</button>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-[#e1127a] text-base">S/ {(item.price * item.quantity).toFixed(2)}</p>
                        <button 
                          onClick={() => onRemove(item.id)}
                          className="text-gray-300 hover:text-red-500 text-xs mt-1 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-8 border-t bg-gray-50 space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total a pagar</span>
                <span className="text-3xl font-black text-[#1a2b49] tracking-tighter">S/ {total.toFixed(2)}</span>
              </div>
              <button 
                onClick={onCheckout}
                className="w-full bg-[#e1127a] text-white font-black py-5 rounded-2xl shadow-xl shadow-pink-100 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-sm tracking-widest uppercase"
              >
                <span>CONTINUAR COMPRA</span>
                <i className="fas fa-chevron-right text-[10px]"></i>
              </button>
              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <i className="fab fa-whatsapp text-[#a5cf4c]"></i>
                <span>Confirmación vía WhatsApp</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
