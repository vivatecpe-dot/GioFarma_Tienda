
export interface Product {
  id: number;
  odoo_id: number;
  name: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
  sku: string;
  description?: string;
  presentation?: string;
  is_generic?: boolean;
  requires_prescription?: boolean;
  presentations?: { label: string; price: number }[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedPresentation?: string;
}

export interface OrderFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface CompanyConfig {
  logo_url: string;
  whatsapp_number: string;
  company_name: string;
  facebook_url?: string;
  instagram_url?: string;
  banners: {
    image_url: string;
    title: string;
    subtitle: string;
    badge: string;
  }[];
}

export interface Category {
  id: number;
  name: string;
}
