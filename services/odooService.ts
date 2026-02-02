
import { Product, CartItem, OrderFormData, CompanyConfig } from '../types';
import { supabase } from '../lib/supabase';
import { LOGO_URL, ODOO_CONFIG } from '../constants';

export const getCompanyConfig = async (): Promise<CompanyConfig> => {
  try {
    const { data, error } = await supabase.from('settings').select('*').single();
    if (error) throw error;
    return {
      logo_url: data.logo_url || LOGO_URL,
      whatsapp_number: data.whatsapp_number || ODOO_CONFIG.whatsappNumber,
      company_name: data.company_name || ODOO_CONFIG.company,
      facebook_url: data.facebook_url,
      instagram_url: data.instagram_url,
      banners: data.banners || [{
        image_url: 'https://media.mifarma.com.pe/media/promotions/banner/Mifarma_Banner_Desktop_Mifa25_20240120.jpg',
        title: 'DONDE TU BIENESTAR ES PRIORIDAD',
        subtitle: 'Aprovecha hasta un 25% de descuento directo en el checkout.',
        badge: 'Ahorra Siempre'
      }]
    };
  } catch (error) {
    return {
      logo_url: LOGO_URL,
      whatsapp_number: ODOO_CONFIG.whatsappNumber,
      company_name: ODOO_CONFIG.company,
      banners: [{
        image_url: 'https://media.mifarma.com.pe/media/promotions/banner/Mifarma_Banner_Desktop_Mifa25_20240120.jpg',
        title: 'DONDE TU BIENESTAR ES PRIORIDAD',
        subtitle: 'Aprovecha hasta un 25% de descuento directo en el checkout.',
        badge: 'Ahorra Siempre'
      }]
    };
  }
};

export const getOrdersByPhone = async (phone: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching customer orders:", error);
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
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price,
      presentation: item.selectedPresentation || 'Unidad'
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
    if (itemsError) throw itemsError;

    return { 
      success: true, 
      supabase_id: order.id,
      odoo_id: Math.floor(Math.random() * 9000) + 1000 
    };
  } catch (error) {
    throw error;
  }
};

export const getProductsFromCache = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return (data || []).map((p: any) => ({
      id: p.id,
      odoo_id: p.odoo_id,
      name: p.name,
      price: parseFloat(p.price),
      stock: p.stock,
      image_url: p.image_url || 'https://via.placeholder.com/400',
      category: p.category_name,
      sku: p.sku
    }));
  } catch (error) {
    return [];
  }
};

export const createOdooOrder = createFullOrder;
export const getProductsFromOdoo = getProductsFromCache;
