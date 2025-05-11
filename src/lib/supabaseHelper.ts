
import { supabase } from "@/integrations/supabase/client";

/**
 * Helper function to safely query any table, including those not in the current type definitions
 * Use this until the Supabase types can be regenerated to include the new tables
 */
export const safeQuery = (tableName: string) => {
  return supabase.from(tableName as any);
};

/**
 * Helper type for safely casting query results to the expected type
 * This helps avoid TypeScript errors when querying tables that aren't in the current type definitions
 */
export function safeCast<T>(data: any): T {
  return data as T;
}
