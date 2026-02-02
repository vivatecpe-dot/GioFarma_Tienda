
import React, { useState, useEffect } from 'react';
import { CompanyConfig, Product } from '../types';
import { supabase } from '../lib/supabase';
import { LOGO_URL, COLORS } from '../constants';

interface AdminPanelProps {
  onClose: () => void;
  config: CompanyConfig | null;
  products: Product[];
  onRefresh: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, config, products, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'config' | 'orders' | 'products'>('config');
  const [formData, setFormData] = useState<any>(config || {});
  const [orders, setOrders] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    setOrders(data || []);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          company_name: formData.company_name,
          logo_url: formData.logo_url,
          whatsapp_number: formData.whatsapp_number,
          facebook_url: formData.facebook_url,
          instagram_url: formData.instagram_url,
          banners: formData.banners
        })
        .eq('id', 1);

      if (error) throw error;
      alert("Configuración guardada con éxito");
      onRefresh();
    } catch (error) {
      alert("Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const updateBanner = (index: number, field: string, value: string) => {
    const newBanners = [...(formData.banners || [])];
    newBanners[index] = { ...newBanners[index], [field]: value };
    setFormData({ ...formData, banners: newBanners });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* Header Admin */}
      <div className="bg-[#1a2b49] text-white p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src={config?.logo_url || LOGO_URL} className="h-8 brightness-0 invert" alt="Logo" />
          <h2 className="text-xl font-black uppercase tracking-widest">Panel de Control</h2>
        </div>
        <button onClick={onClose} className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl transition-colors font-bold text-sm">
          Cerrar Panel
        </button>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar Tabs */}
        <aside className="w-64 bg-gray-50 border-r border-gray-200 p-6 space-y-2">
          <button 
            onClick={() => setActiveTab('config')}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'config' ? 'bg-[#e1127a] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <i className="fas fa-cog"></i> Configuración
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'orders' ? 'bg-[#e1127a] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <i className="fas fa-shopping-cart"></i> Pedidos Web
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'products' ? 'bg-[#e1127a] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <i className="fas fa-box"></i> Inventario
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-grow overflow-y-auto p-10 bg-white">
          {activeTab === 'config' && (
            <form onSubmit={handleSaveConfig} className="max-w-4xl space-y-10">
              <section>
                <h3 className="text-lg font-black text-[#1a2b49] mb-6 border-b pb-2 flex items-center gap-2">
                  <span className="w-2 h-6 bg-[#a5cf4c] rounded-full"></span> Información General
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Nombre de Empresa</label>
                    <input 
                      type="text" 
                      value={formData.company_name} 
                      onChange={e => setFormData({...formData, company_name: e.target.value})}
                      className="w-full p-3 bg-gray-50 border rounded-xl focus:border-[#e1127a] outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">WhatsApp Pedidos</label>
                    <input 
                      type="text" 
                      value={formData.whatsapp_number} 
                      onChange={e => setFormData({...formData, whatsapp_number: e.target.value})}
                      className="w-full p-3 bg-gray-50 border rounded-xl focus:border-[#e1127a] outline-none"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">URL del Logo (Imagen PNG)</label>
                    <input 
                      type="text" 
                      value={formData.logo_url} 
                      onChange={e => setFormData({...formData, logo_url: e.target.value})}
                      className="w-full p-3 bg-gray-50 border rounded-xl focus:border-[#e1127a] outline-none"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-black text-[#1a2b49] mb-6 border-b pb-2 flex items-center gap-2">
                  <span className="w-2 h-6 bg-[#e1127a] rounded-full"></span> Gestión de Banners
                </h3>
                {formData.banners?.map((banner: any, idx: number) => (
                  <div key={idx} className="p-6 bg-gray-50 rounded-2xl mb-4 border border-gray-100 space-y-4">
                    <p className="text-[10px] font-black text-[#e1127a]">BANNER #{idx + 1}</p>
                    <input 
                      placeholder="Título" 
                      value={banner.title} 
                      onChange={e => updateBanner(idx, 'title', e.target.value)}
                      className="w-full p-2 border-b bg-transparent outline-none font-bold"
                    />
                    <input 
                      placeholder="URL Imagen" 
                      value={banner.image_url} 
                      onChange={e => updateBanner(idx, 'image_url', e.target.value)}
                      className="w-full p-2 border-b bg-transparent outline-none text-xs text-blue-500"
                    />
                  </div>
                ))}
              </section>

              <button 
                type="submit" 
                disabled={isSaving}
                className="bg-[#e1127a] text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:brightness-110 disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Actualizar Configuración'}
              </button>
            </form>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h3 className="text-xl font-black text-[#1a2b49]">Historial de Pedidos Supabase</h3>
              <div className="overflow-x-auto rounded-3xl border border-gray-100 shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400">
                    <tr>
                      <th className="p-4">Ref / Fecha</th>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Productos</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 text-sm">
                        <td className="p-4">
                          <p className="font-black text-[#e1127a]">#{order.id.split('-')[0].toUpperCase()}</p>
                          <span className="text-[10px] text-gray-400">{new Date(order.created_at).toLocaleString()}</span>
                        </td>
                        <td className="p-4">
                          <p className="font-bold">{order.customer_name}</p>
                          <p className="text-xs text-gray-500">{order.customer_phone}</p>
                        </td>
                        <td className="p-4">
                          <div className="max-w-[200px] truncate text-xs text-gray-500">
                            {order.order_items?.map((i: any) => `${i.quantity}x ${i.product_name}`).join(', ')}
                          </div>
                        </td>
                        <td className="p-4 font-black">S/ {parseFloat(order.total_amount).toFixed(2)}</td>
                        <td className="p-4">
                          <a 
                            href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`} 
                            target="_blank" 
                            className="bg-[#a5cf4c] text-white p-2 rounded-lg"
                          >
                            <i className="fab fa-whatsapp"></i>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              <h3 className="text-xl font-black text-[#1a2b49]">Inventario Sincronizado</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map(p => (
                  <div key={p.id} className="p-4 border rounded-2xl flex items-center gap-4">
                    <img src={p.image_url} className="w-12 h-12 object-contain" />
                    <div className="flex-grow">
                      <p className="text-[11px] font-bold line-clamp-1">{p.name}</p>
                      <p className="text-xs font-black text-[#e1127a]">S/ {p.price.toFixed(2)}</p>
                      <p className="text-[9px] text-gray-400">Stock: {p.stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
