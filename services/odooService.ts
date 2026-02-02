
import { Product, CartItem, OrderFormData, CompanyConfig } from '../types';
import { supabase } from '../lib/supabase';
import { LOGO_URL, ODOO_CONFIG } from '../constants';

export const getCompanyConfig = async (): Promise<CompanyConfig> => {
  try {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
    if (error) throw error;
    return {
      logo_url: data.logo_url || LOGO_URL,
      whatsapp_number: data.whatsapp_number || ODOO_CONFIG.whatsappNumber,
      company_name: data.company_name || ODOO_CONFIG.company,
      facebook_url: data.facebook_url || '',
      instagram_url: data.instagram_url || '',
      odoo_host: data.odoo_host || ODOO_CONFIG.host,
      odoo_db: data.odoo_db || ODOO_CONFIG.db,
      odoo_username: data.odoo_username || ODOO_CONFIG.username,
      odoo_api_key: data.odoo_api_key || ODOO_CONFIG.apiKey,
      banners: data.banners || []
    };
  } catch (error) {
    return {
      logo_url: LOGO_URL,
      whatsapp_number: ODOO_CONFIG.whatsappNumber,
      company_name: ODOO_CONFIG.company,
      banners: []
    };
  }
};

export const syncProductsFromOdoo = async (config: Partial<CompanyConfig>): Promise<{ success: boolean; count: number }> => {
  // Esta llamada invoca la lógica de servidor en Supabase
  const { data, error } = await supabase.functions.invoke('odoo-sync-massive', {
    body: { 
      host: config.odoo_host,
      db: config.odoo_db,
      username: config.odoo_username,
      password: config.odoo_api_key
    }
  });

  if (error) {
    console.error("Error en Edge Function:", error);
    throw new Error("No se pudo conectar con la función de sincronización. Asegúrese de haber desplegado 'odoo-sync-massive' en Supabase.");
  }
  
  return { success: true, count: data?.count || 0 }; 
};

export const getProductsFromCache = async (): Promise<Product[]> => {
  try {
    // Aumentamos el rango para soportar hasta 5000 productos
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('category_name', { ascending: true })
      .order('name', { ascending: true })
      .range(0, 5000); 
    
    if (error) throw error;

    return (data || []).map((p: any) => ({
      id: p.id,
      odoo_id: p.odoo_id,
      name: p.name,
      price: parseFloat(p.price),
      stock: p.qty_available || 0,
      image_url: p.image_url || 'https://via.placeholder.com/400?text=Sin+Imagen',
      category: p.category_name || 'General',
      sku: p.default_code || 'S/N',
      description: p.description_sale || '',
      presentation: p.uom_name || 'UNIDAD',
      is_generic: p.is_generic || false,
      requires_prescription: p.requires_prescription || false
    }));
  } catch (error) {
    console.error("Error cargando productos:", error);
    return [];
  }
};

export const createFullOrder = async (formData: OrderFormData, cart: CartItem[]) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_address: formData.address,
        total_amount: total,
        status: 'pendiente'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const itemsToInsert = cart.map(item => ({
      order_id: order.id,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
    if (itemsError) throw itemsError;

    return { success: true, supabase_id: order.id };
  } catch (error) {
    throw error;
  }
};

// Se añade la función faltante para buscar pedidos por número de teléfono
export const getOrdersByPhone = async (phone: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error buscando pedidos:", error);
    return [];
  }
};
