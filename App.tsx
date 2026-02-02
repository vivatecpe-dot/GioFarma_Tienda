
import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ProductGrid } from './components/ProductGrid';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutModal } from './components/CheckoutModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AdminPanel } from './components/AdminPanel';
import { MyOrdersModal } from './components/MyOrdersModal';
import { Product, CartItem, OrderFormData, CompanyConfig } from './types';
import { getProductsFromCache, createFullOrder, getCompanyConfig } from './services/odooService';
import { mockProducts } from './services/mockData';
import { LOGO_URL, ODOO_CONFIG } from './constants';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<CompanyConfig | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const companyConfig = await getCompanyConfig();
      setConfig(companyConfig);

      const cachedProducts = await getProductsFromCache();
      if (cachedProducts && cachedProducts.length > 0) {
        const enriched = cachedProducts.map(p => {
          let presentation = 'UNIDAD';
          if (p.name.toUpperCase().includes('CAJA')) presentation = 'CAJA';
          if (p.name.toUpperCase().includes('FRASCO')) presentation = 'FRASCO';
          if (p.name.toUpperCase().includes('TUBO')) presentation = 'TUBO';
          if (p.name.toUpperCase().includes('BOLSA')) presentation = 'BOLSA';
          
          return {
            ...p,
            presentation: p.presentation || presentation,
            is_generic: p.is_generic !== undefined ? p.is_generic : true,
            requires_prescription: p.requires_prescription !== undefined ? p.requires_prescription : (p.category === 'Medicamentos')
          };
        });
        setProducts(enriched);
      } else {
        setProducts(mockProducts);
      }
    } catch (error) {
      setProducts(mockProducts);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const addToCart = (product: Product, presentation?: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1, selectedPresentation: presentation || item.selectedPresentation } : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedPresentation: presentation || product.presentation }];
    });
    if (selectedProduct) setSelectedProduct(null);
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleAdminAccess = () => {
    const pass = prompt("Ingrese la clave administrativa:");
    if (pass === 'admin123') {
      setIsAdminOpen(true);
    } else {
      alert("Acceso denegado");
    }
  };

  const handleOrder = async (formData: OrderFormData) => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const whatsappNum = config?.whatsapp_number || ODOO_CONFIG.whatsappNumber;
    
    try {
      const result = await createFullOrder(formData, cart);
      const itemsText = cart.map(item => `• ${item.name} [${item.selectedPresentation || 'Unidad'}] (${item.quantity} x S/ ${item.price.toFixed(2)})`).join('%0A');
      const orderRef = result.supabase_id.split('-')[0].toUpperCase();
      
      const message = `*NUEVO PEDIDO - ${config?.company_name || ODOO_CONFIG.company}*%0A%0A*Ref:* #${orderRef}%0A*Cliente:* ${formData.name}%0A*WhatsApp:* ${formData.phone}%0A*Dirección:* ${formData.address}%0A%0A*Pedido:*%0A${itemsText}%0A%0A*Total:* S/ ${total.toFixed(2)}%0A%0A_Pedido registrado en sistema GIOFARMA_`;
      
      window.open(`https://wa.me/${whatsappNum.replace(/\+/g, '').replace(/\s/g, '')}?text=${message}`, '_blank');
      setCart([]);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      alert("¡Pedido registrado con éxito!");
    } catch (e) {
      alert("Error al procesar el pedido.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        logoUrl={config?.logo_url || LOGO_URL}
        onOpenMyOrders={() => setIsMyOrdersOpen(true)}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {config?.banners && config.banners.length > 0 && (
          <div className="mb-12 relative h-[250px] md:h-[450px] w-full rounded-[40px] overflow-hidden shadow-2xl border-4 border-white">
              <div className="absolute inset-0 bg-gradient-to-r from-[#e1127a] via-[#e1127a]/85 to-transparent z-10"></div>
              <img 
                src={config.banners[0].image_url} 
                className="w-full h-full object-cover grayscale opacity-40 transition-transform duration-1000 group-hover:scale-105" 
                alt="Banner Principal"
              />
              <div className="absolute inset-0 z-20 flex items-center p-10 md:p-24">
                  <div className="max-w-2xl text-white">
                      <div className="flex items-center gap-3 mb-8">
                          <span className="bg-[#a5cf4c] text-white text-[12px] font-black px-5 py-2 rounded-full uppercase tracking-widest shadow-lg">
                            {config.banners[0].badge}
                          </span>
                          <div className="h-1 w-12 bg-white/30 rounded-full"></div>
                      </div>
                      <h2 className="text-4xl md:text-7xl font-black italic leading-[0.9] mb-8 drop-shadow-xl">
                        {config.banners[0].title}
                      </h2>
                      <p className="text-sm md:text-xl font-bold opacity-95 mb-10 max-w-md leading-relaxed">
                        {config.banners[0].subtitle}
                      </p>
                      <button 
                        onClick={() => {
                          const el = document.getElementById('catalog-start');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-white text-[#e1127a] px-12 py-4.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-[#a5cf4c] hover:text-white transition-all transform hover:-translate-y-1"
                      >
                        Ver Catálogo Completo
                      </button>
                  </div>
              </div>
          </div>
        )}

        <div id="catalog-start" className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-[#1a2b49] tracking-tight">¡Elegidos para ti!</h2>
              <div className="h-1.5 w-20 bg-[#a5cf4c] rounded-full mt-2"></div>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="w-full lg:w-80 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-[32px] p-8 sticky top-32 border border-gray-50 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-8 bg-[#e1127a] rounded-full"></div>
                <h3 className="text-sm font-black text-[#1a2b49] uppercase tracking-widest">Nuestras Líneas</h3>
              </div>
              <ul className="space-y-3">
                {['Todos', 'Medicamentos', 'Cuidado Personal', 'Infantil', 'Suplementos', 'Primeros Auxilios'].map(cat => (
                  <li key={cat}>
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-6 py-4 rounded-2xl transition-all text-sm font-bold flex items-center justify-between group ${
                        selectedCategory === cat 
                          ? 'bg-[#e1127a] text-white shadow-xl shadow-pink-200' 
                          : 'text-[#1a2b49] hover:bg-[#fdf2f8] hover:text-[#e1127a]'
                      }`}
                    >
                      {cat}
                      <i className={`fas fa-chevron-right text-[10px] transition-transform ${selectedCategory === cat ? 'translate-x-1' : 'opacity-20 group-hover:opacity-100 group-hover:translate-x-1'}`}></i>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="flex-grow">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center h-96 gap-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-100 border-t-[#e1127a]"></div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Cargando...</p>
              </div>
            ) : (
              <ProductGrid 
                products={filteredProducts} 
                onAddToCart={(p) => addToCart(p)} 
                onProductClick={(p) => setSelectedProduct(p)} 
              />
            )}
          </div>
        </div>
      </main>

      {/* FOOTER PREMIUM GIOFARMA */}
      <footer className="bg-white border-t border-gray-100 mt-24">
        <div className="container mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            
            {/* Columna 1: Branding y Redes */}
            <div className="space-y-8">
              <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <img 
                  src={config?.logo_url || LOGO_URL} 
                  alt="GIOFARMA" 
                  className="h-16 object-contain"
                  onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x60?text=GIOFARMA'}
                />
              </div>
              <p className="text-gray-400 text-sm font-medium leading-relaxed">
                Comprometidos con tu bienestar. Brindamos atención farmacéutica de calidad y una amplia variedad de productos para toda tu familia.
              </p>
              <div className="flex gap-4">
                <a 
                  href={config?.facebook_url || "https://facebook.com"} 
                  target="_blank" 
                  className="w-11 h-11 rounded-2xl bg-[#f1f4f8] text-[#1a2b49] flex items-center justify-center hover:bg-[#e1127a] hover:text-white transition-all shadow-sm"
                >
                  <i className="fab fa-facebook-f text-lg"></i>
                </a>
                <a 
                  href={config?.instagram_url || "https://instagram.com"} 
                  target="_blank" 
                  className="w-11 h-11 rounded-2xl bg-[#f1f4f8] text-[#1a2b49] flex items-center justify-center hover:bg-[#e1127a] hover:text-white transition-all shadow-sm"
                >
                  <i className="fab fa-instagram text-lg"></i>
                </a>
              </div>
            </div>

            {/* Columna 2: Enlaces de Ayuda */}
            <div>
              <h4 className="text-[11px] font-black text-[#1a2b49] uppercase tracking-[0.2em] mb-8 border-l-4 border-[#e1127a] pl-4">Servicios</h4>
              <ul className="space-y-4">
                <li><button onClick={() => setIsMyOrdersOpen(true)} className="text-gray-400 text-sm font-bold hover:text-[#e1127a] transition-colors flex items-center gap-2">
                  <i className="fas fa-history text-[10px]"></i> Mis Pedidos
                </button></li>
                <li><button className="text-gray-400 text-sm font-bold hover:text-[#e1127a] transition-colors flex items-center gap-2">
                  <i className="fas fa-map-marker-alt text-[10px]"></i> Nuestras Boticas
                </button></li>
                <li><button className="text-gray-400 text-sm font-bold hover:text-[#e1127a] transition-colors flex items-center gap-2">
                  <i className="fas fa-file-contract text-[10px]"></i> Términos y Condiciones
                </button></li>
                <li><button className="text-gray-400 text-sm font-bold hover:text-[#e1127a] transition-colors flex items-center gap-2">
                  <i className="fas fa-shield-alt text-[10px]"></i> Política de Privacidad
                </button></li>
              </ul>
            </div>

            {/* Columna 3: Contacto Directo */}
            <div>
              <h4 className="text-[11px] font-black text-[#1a2b49] uppercase tracking-[0.2em] mb-8 border-l-4 border-[#a5cf4c] pl-4">Contáctanos</h4>
              <div className="space-y-6">
                <a 
                  href={`https://wa.me/${(config?.whatsapp_number || ODOO_CONFIG.whatsappNumber).replace(/\D/g, '')}`} 
                  target="_blank"
                  className="flex items-center gap-5 group"
                >
                  <div className="w-14 h-14 rounded-[20px] bg-[#f0fdf4] text-[#a5cf4c] flex items-center justify-center group-hover:bg-[#a5cf4c] group-hover:text-white transition-all shadow-sm border border-[#dcfce7]">
                    <i className="fab fa-whatsapp text-2xl"></i>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Consultas por WhatsApp</span>
                    <span className="text-sm font-black text-[#1a2b49]">{config?.whatsapp_number || ODOO_CONFIG.whatsappNumber}</span>
                  </div>
                </a>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[20px] bg-[#f1f4f8] text-[#1a2b49] flex items-center justify-center shadow-sm border border-gray-100">
                    <i className="fas fa-phone-alt text-xl"></i>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Atención Telefónica</span>
                    <span className="text-sm font-black text-[#1a2b49]">(01) 234-5678</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna 4: Medios de Pago y Admin */}
            <div>
              <h4 className="text-[11px] font-black text-[#1a2b49] uppercase tracking-[0.2em] mb-8 border-l-4 border-gray-200 pl-4">Pagos Aceptados</h4>
              <div className="grid grid-cols-2 gap-3 mb-10">
                <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-center gap-2 border border-gray-100 group cursor-default">
                  <div className="w-6 h-6 bg-[#742284] rounded-lg flex items-center justify-center text-[10px] text-white font-black group-hover:scale-110 transition-transform">Y</div>
                  <span className="text-[10px] font-black text-[#742284]">YAPE</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-center gap-2 border border-gray-100 group cursor-default">
                  <div className="w-6 h-6 bg-[#00A4E4] rounded-lg flex items-center justify-center text-[10px] text-white font-black group-hover:scale-110 transition-transform">P</div>
                  <span className="text-[10px] font-black text-[#00A4E4]">PLIN</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-center border border-gray-100 grayscale hover:grayscale-0 transition-all cursor-default">
                  <i className="fab fa-cc-visa text-2xl text-[#1a2b49]"></i>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-center border border-gray-100 grayscale hover:grayscale-0 transition-all cursor-default">
                  <i className="fab fa-cc-mastercard text-2xl text-orange-600"></i>
                </div>
              </div>
              <button 
                onClick={handleAdminAccess}
                className="w-full py-4 rounded-2xl bg-gray-50 border-2 border-transparent hover:border-[#fce7f3] text-[10px] font-black uppercase text-gray-300 hover:text-[#e1127a] tracking-widest transition-all flex items-center justify-center gap-3"
              >
                Acceso Administrador <i className="fas fa-lock text-[9px]"></i>
              </button>
            </div>
          </div>

          <div className="mt-20 pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] text-center md:text-left">
              &copy; 2024 {config?.company_name || ODOO_CONFIG.company} SAC - TODOS LOS DERECHOS RESERVADOS
            </p>
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-2 opacity-30 grayscale scale-75 md:scale-90">
                <i className="fas fa-shield-virus text-2xl text-[#a5cf4c]"></i>
                <span className="text-[9px] font-black uppercase tracking-widest">Compra Segura</span>
              </div>
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest hidden sm:inline">Botica Autorizada por DIGEMID</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Panels */}
      {isAdminOpen && (
        <AdminPanel 
          config={config}
          products={products}
          onRefresh={loadData}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {isMyOrdersOpen && (
        <MyOrdersModal 
          onClose={() => setIsMyOrdersOpen(false)}
          whatsappNumber={config?.whatsapp_number || ODOO_CONFIG.whatsappNumber}
        />
      )}

      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onRemove={removeFromCart}
        onUpdateQty={updateQuantity}
        whatsappNumber={config?.whatsapp_number || ODOO_CONFIG.whatsappNumber}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal 
          onClose={() => setIsCheckoutOpen(false)}
          onSubmit={handleOrder}
          total={cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
        />
      )}
    </div>
  );
};

export default App;
