
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lvemooxazqhjpfqnnuzg.supabase.co'

const supabaseKey = 'sb_publishable_sgZxihoGIDn9Zg2ThAHXNQ_YCwroT-Q'

export const supabase = createClient(supabaseUrl, supabaseKey)
