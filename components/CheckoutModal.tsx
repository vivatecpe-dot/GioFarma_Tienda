
import React, { useState } from 'react';
import { OrderFormData } from '../types';

interface CheckoutModalProps {
  onClose: () => void;
  onSubmit: (data: OrderFormData) => void;
  total: number;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose, onSubmit, total }) => {
  const [formData, setFormData] = useState<OrderFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-[40px] w-full max-w-lg relative overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="bg-[#e1127a] p-8 text-white">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Finalizar Pedido</h2>
          <p className="opacity-80 text-xs font-bold uppercase tracking-widest mt-1">Coordinaremos la entrega por WhatsApp</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre Completo *</label>
              <input
                required
                type="text"
                placeholder="Ej. Juan Pérez"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#e1127a] focus:bg-white transition-all outline-none font-bold text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp *</label>
                <input
                  required
                  type="tel"
                  placeholder="999 000 000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#e1127a] focus:bg-white transition-all outline-none font-bold text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email (Opcional)</label>
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#e1127a] focus:bg-white transition-all outline-none font-bold text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dirección de Envío *</label>
              <textarea
                required
                placeholder="Ej. Av. Larco 123, Miraflores..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#e1127a] focus:bg-white transition-all outline-none font-bold text-sm h-24 resize-none"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total a pagar</span>
              <span className="text-2xl font-black text-[#1a2b49]">S/ {total.toFixed(2)}</span>
            </div>
            
            <div className="space-y-3">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Métodos de pago aceptados</p>
              <div className="flex justify-center gap-3">
                <div className="px-3 py-1.5 bg-white border rounded-xl flex items-center gap-2 shadow-sm">
                  <div className="w-5 h-5 bg-[#742284] rounded-lg flex items-center justify-center text-[8px] text-white font-black">Y</div>
                  <span className="text-[10px] font-black text-[#742284]">YAPE</span>
                </div>
                <div className="px-3 py-1.5 bg-white border rounded-xl flex items-center gap-2 shadow-sm">
                  <div className="w-5 h-5 bg-[#00A4E4] rounded-lg flex items-center justify-center text-[8px] text-white font-black">P</div>
                  <span className="text-[10px] font-black text-[#00A4E4]">PLIN</span>
                </div>
                <div className="px-3 py-1.5 bg-white border rounded-xl flex items-center gap-2 shadow-sm grayscale opacity-50">
                  <i className="fab fa-cc-visa text-blue-800 text-xs"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="flex-[2] bg-[#e1127a] text-white font-black py-5 rounded-2xl shadow-xl shadow-pink-100 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-[11px] uppercase tracking-widest"
            >
              <i className="fab fa-whatsapp text-lg"></i>
              Confirmar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
