
import { supabase } from "@/integrations/supabase/client";

/**
 * Helper function to safely query any table, including those not in the current type definitions
 * Use this until the Supabase types can be regenerated to include the new tables
 */
export const safeQuery = (tableName: string) => {
  return supabase.from(tableName as any);
};
