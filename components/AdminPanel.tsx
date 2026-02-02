
import React, { useState, useEffect } from 'react';
import { CompanyConfig, Product } from '../types';
import { supabase } from '../lib/supabase';
import { LOGO_URL } from '../constants';
import { syncProductsFromOdoo } from '../services/odooService';

interface AdminPanelProps {
  onClose: () => void;
  config: CompanyConfig | null;
  products: Product[];
  onRefresh: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, config, products, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'config' | 'banners' | 'odoo' | 'orders'>('config');
  const [formData, setFormData] = useState<any>(config || { banners: [] });
  const [orders, setOrders] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{msg: string, type: 'success' | 'error' | 'none'}>({msg: '', type: 'none'});

  useEffect(() => {
    if (config) setFormData(config);
  }, [config]);

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
          odoo_host: formData.odoo_host,
          odoo_db: formData.odoo_db,
          odoo_username: formData.odoo_username,
          odoo_api_key: formData.odoo_api_key,
          banners: formData.banners
        })
        .eq('id', 1);

      if (error) throw error;
      setSyncStatus({msg: "Configuración guardada", type: 'success'});
      onRefresh();
    } catch (error: any) {
      setSyncStatus({msg: error.message, type: 'error'});
    } finally {
      setIsSaving(false);
      setTimeout(() => setSyncStatus({msg: '', type: 'none'}), 3000);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus({msg: 'Conectando con Odoo...', type: 'none'});
    try {
      const result = await syncProductsFromOdoo(formData);
      setSyncStatus({msg: `¡Éxito! ${result.count} productos sincronizados.`, type: 'success'});
      onRefresh();
    } catch (error) {
      setSyncStatus({msg: "Error de conexión: Verifica el Host y la API Key", type: 'error'});
    } finally {
      setIsSyncing(false);
    }
  };

  const updateBannerField = (index: number, field: string, value: string) => {
    const newBanners = [...formData.banners];
    newBanners[index] = { ...newBanners[index], [field]: value };
    setFormData({ ...formData, banners: newBanners });
  };

  const addBanner = () => {
    const newBanners = [...(formData.banners || []), { 
      image_url: 'https://via.placeholder.com/1200x480', 
      title: 'NUEVA PROMOCIÓN', 
      subtitle: 'Descripción breve', 
      badge: 'OFERTA' 
    }];
    setFormData({ ...formData, banners: newBanners });
  };

  const removeBanner = (idx: number) => {
    const newBanners = formData.banners.filter((_: any, i: number) => i !== idx);
    setFormData({ ...formData, banners: newBanners });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* Header Admin */}
      <div className="bg-[#1a2b49] text-white p-6 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <img src={formData.logo_url || LOGO_URL} className="h-10 object-contain brightness-0 invert" alt="Logo" />
          <h2 className="text-xl font-black uppercase tracking-tighter">Panel de Gestión GIOFARMA</h2>
        </div>
        <button onClick={onClose} className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
          Cerrar Panel
        </button>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-gray-50 border-r border-gray-100 p-8 space-y-3">
          <button onClick={() => setActiveTab('config')} className={`w-full text-left px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-4 transition-all ${activeTab === 'config' ? 'bg-[#e1127a] text-white shadow-xl scale-105' : 'text-gray-400 hover:bg-gray-100'}`}>
            <i className="fas fa-store"></i> General
          </button>
          <button onClick={() => setActiveTab('banners')} className={`w-full text-left px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-4 transition-all ${activeTab === 'banners' ? 'bg-[#e1127a] text-white shadow-xl scale-105' : 'text-gray-400 hover:bg-gray-100'}`}>
            <i className="fas fa-images"></i> Banners Slider
          </button>
          <button onClick={() => setActiveTab('odoo')} className={`w-full text-left px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-4 transition-all ${activeTab === 'odoo' ? 'bg-blue-600 text-white shadow-xl scale-105' : 'text-gray-400 hover:bg-gray-100'}`}>
            <i className="fas fa-plug"></i> Sincronizar Odoo
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-4 transition-all ${activeTab === 'orders' ? 'bg-[#a5cf4c] text-white shadow-xl scale-105' : 'text-gray-400 hover:bg-gray-100'}`}>
            <i className="fas fa-clipboard-list"></i> Pedidos
          </button>
        </aside>

        {/* Content */}
        <main className="flex-grow overflow-y-auto p-12 bg-white relative">
          
          {syncStatus.msg && (
            <div className={`fixed top-24 right-12 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest animate-in slide-in-from-right shadow-2xl z-50 ${
              syncStatus.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {syncStatus.msg}
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="max-w-5xl space-y-10">
            
            {activeTab === 'config' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-xl font-black text-[#1a2b49] uppercase italic border-b-2 border-pink-100 pb-2 flex items-center gap-3">
                  <i className="fas fa-info-circle text-[#e1127a]"></i> Datos del Negocio
                </h3>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre Comercial</label>
                    <input type="text" value={formData.company_name || ''} onChange={e => setFormData({...formData, company_name: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-[#e1127a] outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">WhatsApp de Pedidos</label>
                    <input type="text" value={formData.whatsapp_number || ''} onChange={e => setFormData({...formData, whatsapp_number: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-[#e1127a] outline-none transition-all" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">URL del Logo (ImgBB/Link Directo)</label>
                    <input type="text" value={formData.logo_url || ''} onChange={e => setFormData({...formData, logo_url: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-[#e1127a] outline-none text-xs text-blue-500" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'odoo' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-xl font-black text-[#1a2b49] uppercase italic border-b-2 border-blue-100 pb-2 flex items-center gap-3">
                  <i className="fas fa-network-wired text-blue-600"></i> Conexión Odoo ERP
                </h3>
                <div className="bg-blue-50/50 p-10 rounded-[40px] border-2 border-blue-100 space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Host (Sin https://)</label>
                      <input type="text" value={formData.odoo_host || ''} onChange={e => setFormData({...formData, odoo_host: e.target.value})} className="w-full p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500 shadow-sm" placeholder="ej: baltodano.facturaclic.pe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Base de Datos</label>
                      <input type="text" value={formData.odoo_db || ''} onChange={e => setFormData({...formData, odoo_db: e.target.value})} className="w-full p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500 shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Usuario Administrador</label>
                      <input type="text" value={formData.odoo_username || ''} onChange={e => setFormData({...formData, odoo_username: e.target.value})} className="w-full p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500 shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">API Key / Contraseña</label>
                      <input type="password" value={formData.odoo_api_key || ''} onChange={e => setFormData({...formData, odoo_api_key: e.target.value})} className="w-full p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500 shadow-sm" />
                    </div>
                  </div>
                  
                  <div className="pt-8 border-t border-blue-100 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-black text-[#1a2b49] uppercase italic">Sincronización Inteligente</p>
                      <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Mapeo automático de Stock, Precios e Imágenes</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center gap-4 shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all hover:scale-105"
                    >
                      {isSyncing ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-cloud-download-alt"></i>}
                      {isSyncing ? 'Procesando datos...' : 'Sincronizar Catálogo'}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-start gap-4">
                    <i className="fas fa-info-circle text-blue-500 mt-1"></i>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                        La sincronización importa todos los productos marcados como <b>"Puede ser vendido"</b> en Odoo. 
                        Se recomienda usar imágenes cuadradas para una mejor visualización en el catálogo.
                    </p>
                </div>
              </div>
            )}

            {/* Los otros tabs se mantienen igual */}
            {activeTab === 'banners' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                 <div className="flex justify-between items-center border-b-2 border-pink-100 pb-2">
                    <h3 className="text-xl font-black text-[#1a2b49] uppercase italic">Banners del Carrusel</h3>
                    <button type="button" onClick={addBanner} className="bg-[#a5cf4c] text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-all">+ Añadir Promo</button>
                </div>
                <div className="grid gap-6">
                  {formData.banners?.map((banner: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-[32px] border-2 border-gray-100 relative group transition-all hover:border-pink-200">
                      <button type="button" onClick={() => removeBanner(index)} className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:scale-110 shadow-lg z-10"><i className="fas fa-times"></i></button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase ml-2">URL Imagen</label>
                            <input type="text" placeholder="URL Imagen" value={banner.image_url} onChange={e => updateBannerField(index, 'image_url', e.target.value)} className="w-full p-3 bg-white rounded-xl border font-bold text-xs" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Título de la Promo</label>
                            <input type="text" placeholder="Título" value={banner.title} onChange={e => updateBannerField(index, 'title', e.target.value)} className="w-full p-3 bg-white rounded-xl border font-black text-sm uppercase" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Subtítulo</label>
                                <input type="text" placeholder="Subtítulo" value={banner.subtitle} onChange={e => updateBannerField(index, 'subtitle', e.target.value)} className="w-full p-3 bg-white rounded-xl border font-bold text-xs" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Badge (Etiqueta)</label>
                                <input type="text" placeholder="Badge" value={banner.badge} onChange={e => updateBannerField(index, 'badge', e.target.value)} className="w-full p-3 bg-white rounded-xl border font-black text-[10px] uppercase text-[#e1127a]" />
                             </div>
                          </div>
                        </div>
                        <div className="aspect-[3/1] rounded-2xl overflow-hidden border-2 border-white shadow-inner relative bg-gray-200">
                            <img src={banner.image_url} className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-xl font-black text-[#1a2b49] uppercase italic border-b-2 border-green-100 pb-2">Historial de Ventas</h3>
                <div className="grid gap-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white border-2 border-gray-50 p-6 rounded-[32px] flex justify-between items-center group hover:border-[#a5cf4c] transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-[#a5cf4c] font-black text-xl">
                          <i className="fas fa-shopping-bag"></i>
                        </div>
                        <div>
                          <p className="font-black text-[#1a2b49] uppercase">#{order.id.split('-')[0]} - {order.customer_name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-[#e1127a]">S/ {parseFloat(order.total_amount).toFixed(2)}</p>
                        <span className="text-[10px] font-black bg-green-50 text-green-500 px-3 py-1 rounded-full uppercase">{order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab !== 'orders' && (
              <div className="pt-10 flex justify-end sticky bottom-8">
                <button type="submit" disabled={isSaving} className="bg-[#1a2b49] text-white px-20 py-5 rounded-3xl font-black uppercase tracking-widest shadow-2xl hover:bg-[#e1127a] transform hover:-translate-y-1 transition-all">
                  {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                </button>
              </div>
            )}
          </form>
        </main>
      </div>
    </div>
  );
};
