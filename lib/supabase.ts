
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../constants';

const isConfigured = SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey;

if (!isConfigured) {
  console.warn("Supabase credentials missing. App will use mock data.");
}

// Creamos un cliente dummy o el real dependiendo de la configuración
export const supabase = isConfigured 
  ? createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
  : { 
      from: () => ({ 
        select: () => ({ 
          order: () => Promise.resolve({ data: [], error: null }) 
        }) 
      }) 
    } as any;
