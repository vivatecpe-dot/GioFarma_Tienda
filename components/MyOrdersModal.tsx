
import React, { useState } from 'react';
import { getOrdersByPhone } from '../services/odooService';

interface MyOrdersModalProps {
  onClose: () => void;
  whatsappNumber: string;
}

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({ onClose, whatsappNumber }) => {
  const [phone, setPhone] = useState(localStorage.getItem('last_query_phone') || '');
  const [orders, setOrders] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    localStorage.setItem('last_query_phone', phone);
    const data = await getOrdersByPhone(phone);
    setOrders(data);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmado': return 'bg-green-100 text-green-700 border-green-200';
      case 'pendiente': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelado': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-[40px] w-full max-w-2xl relative overflow-hidden shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#e1127a] p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Mis Pedidos</h2>
            <p className="text-xs opacity-80 font-bold uppercase tracking-widest mt-1">GIOFARMA - Historial de compras</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-8 border-b bg-gray-50">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-grow relative">
              <i className="fas fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input 
                type="tel" 
                placeholder="Ingresa tu número de celular" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-white bg-white shadow-sm focus:border-[#e1127a] outline-none font-bold text-sm"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="bg-[#1a2b49] text-white px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#e1127a] transition-all disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Consultar'}
            </button>
          </form>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-8 space-y-6">
          {!orders && !loading && (
            <div className="text-center py-20 opacity-30">
              <i className="fas fa-search text-6xl mb-4"></i>
              <p className="text-sm font-black uppercase tracking-widest">Ingresa tu teléfono para ver tus pedidos</p>
            </div>
          )}

          {orders && orders.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <i className="fas fa-shopping-bag text-3xl"></i>
              </div>
              <p className="text-sm font-black text-[#1a2b49] uppercase tracking-widest">No encontramos pedidos asociados</p>
              <p className="text-xs text-gray-400 mt-2">Verifica que el número sea el mismo que usaste al comprar.</p>
            </div>
          )}

          {orders && orders.map((order) => (
            <div key={order.id} className="border-2 border-gray-50 rounded-3xl p-6 hover:border-pink-100 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-lg font-black text-[#1a2b49]">Pedido #{order.id.split('-')[0].toUpperCase()}</span>
                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-bold">{new Date(order.created_at).toLocaleString('es-PE')}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 uppercase block">Total</span>
                  <span className="text-xl font-black text-[#e1127a]">S/ {parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-[11px] font-bold">
                    <span className="text-[#1a2b49]">{item.quantity}x {item.product_name}</span>
                    <span className="text-gray-400">S/ {parseFloat(item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <p className="text-[10px] text-gray-400 italic line-clamp-1 flex-grow mr-4">Enviado a: {order.customer_address}</p>
                <button 
                  onClick={() => {
                    const msg = `Hola GIOFARMA, consulto por mi pedido #${order.id.split('-')[0].toUpperCase()}`;
                    window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${msg}`, '_blank');
                  }}
                  className="text-[#e1127a] text-[10px] font-black uppercase hover:underline whitespace-nowrap flex items-center gap-1"
                >
                  <i className="fab fa-whatsapp text-xs"></i> Consultar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-6 bg-gray-50 text-center border-t">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">GIOFARMA - Cuidamos de ti</p>
        </div>
      </div>
    </div>
  );
};
