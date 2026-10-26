
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lvemooxazqhjpfqnnuzg.supabase.co'

const supabaseKey = 'sb_publishable_sgZxihoGIDn9Zg2ThAHXNQ_YCwroT-Q'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Keep the delivery-order dashboard's login session completely separate from
// the restaurant site's admin session, even though both use the same Supabase project.
export const ordersSupabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storageKey: 'sumer-orders-auth-v1',
    persistSession: true,
    autoRefreshToken: true
  }
})
