
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderInterval = useRef<number | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const companyConfig = await getCompanyConfig();
      setConfig(companyConfig);

      const cachedProducts = await getProductsFromCache();
      if (cachedProducts && cachedProducts.length > 0) {
        setProducts(cachedProducts);
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

  // Extraer categorías únicas de los 1000+ productos dinámicamente
  const categories = useMemo(() => {
    const cats = products.map(p => p.category);
    return ['Todos', ...new Set(cats)].filter(Boolean);
  }, [products]);

  useEffect(() => {
    if (config?.banners && config.banners.length > 1) {
      if (sliderInterval.current) window.clearInterval(sliderInterval.current);
      sliderInterval.current = window.setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % config.banners.length);
      }, 6000);
    }
    return () => {
      if (sliderInterval.current) window.clearInterval(sliderInterval.current);
    };
  }, [config?.banners]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const addToCart = (product: Product, presentation?: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedPresentation === presentation);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.selectedPresentation === presentation) 
          ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedPresentation: presentation || product.presentation }];
    });
    setIsCartOpen(true);
    setIsDetailOpen(false);
  };

  const handleUpdateQty = (id: number, delta: number) => {
    setCart(c => c.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + delta)} : i));
  };

  const handleRemoveFromCart = (id: number) => {
    setCart(c => c.filter(i => i.id !== id));
  };

  const handleCheckout = async (formData: OrderFormData) => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const whatsappNum = config?.whatsapp_number || ODOO_CONFIG.whatsappNumber;
    
    try {
      const result = await createFullOrder(formData, cart);
      const itemsText = cart.map(item => `• ${item.name} (${item.quantity} x S/ ${item.price.toFixed(2)})`).join('%0A');
      const orderRef = typeof result.supabase_id === 'string' ? result.supabase_id.split('-')[0].toUpperCase() : 'ORD';
      
      const message = `*NUEVO PEDIDO GIOFARMA*%0A%0A*Ref:* #${orderRef}%0A*Cliente:* ${formData.name}%0A*Dirección:* ${formData.address}%0A%0A*Pedido:*%0A${itemsText}%0A%0A*Total:* S/ ${total.toFixed(2)}`;
      
      window.open(`https://wa.me/${whatsappNum.replace(/\D/g, '')}?text=${message}`, '_blank');
      setCart([]);
      setIsCheckoutOpen(false);
      alert("¡Pedido enviado correctamente!");
    } catch (e) {
      alert("Error al procesar el pedido.");
    }
  };

  const handleAdminAccess = () => {
    const pass = prompt("Ingrese contraseña de administrador:");
    if (pass === "admin123") {
      setIsAdminOpen(true);
    } else {
      alert("Acceso denegado");
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
          <div className="mb-12 relative h-[250px] md:h-[480px] w-full rounded-[40px] overflow-hidden shadow-2xl group">
              {config.banners.map((banner, index) => (
                <div 
                  key={index}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#e1127a] via-[#e1127a]/80 to-transparent z-10"></div>
                  <img src={banner.image_url} className="w-full h-full object-cover" alt={banner.title} />
                  <div className="absolute inset-0 z-20 flex items-center px-10 md:px-24">
                      <div className="max-w-xl text-white">
                          <span className="inline-block bg-[#a5cf4c] text-white text-[10px] md:text-[12px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-6 shadow-lg">
                            {banner.badge}
                          </span>
                          <h2 className="text-4xl md:text-7xl font-black italic leading-[0.9] mb-6 drop-shadow-2xl uppercase">
                            {banner.title}
                          </h2>
                          <p className="text-sm md:text-xl font-bold opacity-90 mb-8 max-w-sm">
                            {banner.subtitle}
                          </p>
                          <button 
                            onClick={() => document.getElementById('catalog-start')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-white text-[#e1127a] px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform"
                          >
                            Explorar Catálogo
                          </button>
                      </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        <div id="catalog-start" className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-[#1a2b49] uppercase italic tracking-tighter">Catálogo de Productos</h2>
              <div className="h-1.5 w-20 bg-[#a5cf4c] rounded-full mt-2"></div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Mostrando</span>
              <span className="text-sm font-black text-[#e1127a]">{filteredProducts.length} de {products.length} productos</span>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="w-full lg:w-72 flex-shrink-0">
             <div className="bg-white rounded-[32px] p-6 sticky top-32 border border-gray-100 shadow-sm max-h-[70vh] flex flex-col">
              <h3 className="text-[11px] font-black text-[#1a2b49] uppercase tracking-widest mb-4 flex items-center gap-2">
                <i className="fas fa-filter text-[#e1127a]"></i> Categorías
              </h3>
              <div className="overflow-y-auto pr-2 custom-scroll space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-[13px] transition-all flex justify-between items-center ${
                      selectedCategory === cat ? 'bg-[#e1127a] text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <i className="fas fa-check text-[10px]"></i>}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-grow">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-12 h-12 border-4 border-[#e1127a] border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black text-gray-300 uppercase tracking-widest text-xs">Cargando inventario masivo...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                  <i className="fas fa-search text-4xl text-gray-200 mb-4"></i>
                  <p className="font-black text-gray-400 uppercase tracking-widest text-sm">No encontramos productos con ese filtro</p>
                  <button onClick={() => {setSearchQuery(''); setSelectedCategory('Todos');}} className="mt-4 text-[#e1127a] font-bold text-xs uppercase underline">Limpiar filtros</button>
              </div>
            ) : (
              <ProductGrid 
                products={filteredProducts} 
                onAddToCart={(p) => addToCart(p)} 
                onProductClick={(p) => {
                  setSelectedProduct(p);
                  setIsDetailOpen(true);
                }} 
              />
            )}
          </div>
        </div>
      </main>

      {/* FOOTER PREMIUM */}
      <footer className="bg-white border-t border-gray-100 mt-24">
        <div className="container mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-8 text-center md:text-left">
              <img src={config?.logo_url || LOGO_URL} alt="GIOFARMA" className="h-16 object-contain mx-auto md:mx-0" />
              <p className="text-gray-400 text-sm font-medium leading-relaxed">Tu salud es nuestra prioridad. Encuentra lo mejor en farmacia y cuidado personal entre más de 1,000 productos garantizados.</p>
              <div className="flex justify-center md:justify-start gap-4">
                <a href={config?.facebook_url || "#"} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center hover:bg-[#e1127a] hover:text-white transition-all"><i className="fab fa-facebook-f"></i></a>
                <a href={config?.instagram_url || "#"} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center hover:bg-[#e1127a] hover:text-white transition-all"><i className="fab fa-instagram"></i></a>
              </div>
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-[11px] font-black text-[#1a2b49] uppercase tracking-[0.2em] mb-8 border-b-4 border-[#e1127a] w-fit mx-auto md:mx-0 pb-2">Servicios</h4>
              <ul className="space-y-4">
                <li><button onClick={() => setIsMyOrdersOpen(true)} className="text-gray-400 text-sm font-bold hover:text-[#e1127a]">Mis Pedidos</button></li>
                <li><button className="text-gray-400 text-sm font-bold hover:text-[#e1127a]">Nuestras Boticas</button></li>
              </ul>
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-[11px] font-black text-[#1a2b49] uppercase tracking-[0.2em] mb-8 border-b-4 border-[#a5cf4c] w-fit mx-auto md:mx-0 pb-2">Contáctanos</h4>
              <div className="flex items-center gap-4 justify-center md:justify-start">
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-[#a5cf4c]"><i className="fab fa-whatsapp text-2xl"></i></div>
                  <div className="text-left">
                    <span className="block text-[9px] font-black text-gray-400 uppercase">WhatsApp de Atención</span>
                    <span className="text-sm font-black text-[#1a2b49]">{config?.whatsapp_number || ODOO_CONFIG.whatsappNumber}</span>
                  </div>
              </div>
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-[11px] font-black text-[#1a2b49] uppercase tracking-[0.2em] mb-8 border-b-4 border-gray-100 w-fit mx-auto md:mx-0 pb-2">Pagos Seguros</h4>
              <div className="flex justify-center md:justify-start gap-3">
                  <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-2 shadow-sm"><div className="w-6 h-6 bg-[#742284] rounded-lg text-white font-black text-[10px] flex items-center justify-center">Y</div><span className="text-[10px] font-black text-[#742284]">YAPE</span></div>
                  <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-2 shadow-sm"><div className="w-6 h-6 bg-[#00A4E4] rounded-lg text-white font-black text-[10px] flex items-center justify-center">P</div><span className="text-[10px] font-black text-[#00A4E4]">PLIN</span></div>
              </div>
              <button onClick={handleAdminAccess} className="w-full mt-6 py-4 bg-gray-50 rounded-2xl text-[10px] font-black text-gray-300 hover:text-[#e1127a] uppercase tracking-widest transition-all">Panel Administrativo <i className="fas fa-lock ml-2"></i></button>
            </div>
          </div>
        </div>
      </footer>

      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onRemove={handleRemoveFromCart} 
        onUpdateQty={handleUpdateQty} 
        onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
        whatsappNumber={config?.whatsapp_number}
      />
      {isDetailOpen && selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setIsDetailOpen(false)} onAddToCart={addToCart} />
      )}
      {isAdminOpen && (
        <AdminPanel onClose={() => setIsAdminOpen(false)} config={config} products={products} onRefresh={loadData} />
      )}
      {isCheckoutOpen && (
        <CheckoutModal total={cart.reduce((s, i) => s + i.price * i.quantity, 0)} onClose={() => setIsCheckoutOpen(false)} onSubmit={handleCheckout} />
      )}
      {isMyOrdersOpen && (
        <MyOrdersModal onClose={() => setIsMyOrdersOpen(false)} whatsappNumber={config?.whatsapp_number || ODOO_CONFIG.whatsappNumber} />
      )}
    </div>
  );
};

export default App;
