import { createClient } from "@supabase/supabase-js";
import {
  Client,
  ProductionRecord,
  Variable,
  VariableFortnight,
  Fortnight,
} from "../types";

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0;

// Create a singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance && isSupabaseConfigured) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return supabaseInstance;
}

export const supabase = getSupabaseClient();

export async function getClientById(userId: string): Promise<Client | null> {
  const { data, error } = await supabase!
    .from("clients")
    .select("*")
    .eq("client_id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function getVariablesLiters(): Promise<Variable[] | null> {
  const { data, error } = await supabase!
    .from("variables")
    .select("*")
    .or(`detail.ilike.%Litro%,detail.ilike.%Sostenimiento%`);
  if (error) {
    throw new Error(error.message);
  }

  console.log(data);
  return data;
}

export async function getProductionHistory(
  userId: string,
  fortnightId?: string,
): Promise<ProductionRecord[] | null> {
  let query = supabase!
    .from("production_records")
    .select("*")
    .eq("client_id", userId)

  if (fortnightId) {
    query = query.eq("fortnight_id", fortnightId)
  }

  const { data, error } = await query.order("production_datetime", { ascending: false });

  if (error) {
    throw error;
  }
  return data;
}

export async function getCurrentFortnight(): Promise<Fortnight | null> {
  const { data, error } = await supabase!
    .from("fortnights")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  return data;
}

export async function upsertFortnight(
  fortnight: Partial<Fortnight> & { id?: string },
): Promise<Fortnight> {
  if (fortnight.id) {
    const { data, error } = await supabase!
      .from("fortnights")
      .update({
        start_date: fortnight.start_date,
        end_date: fortnight.end_date,
        price_liter_associate: fortnight.price_liter_associate,
        price_liter_buyer: fortnight.price_liter_buyer,
        sostenimiento_fee: fortnight.sostenimiento_fee,
      })
      .eq("id", fortnight.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await supabase!
    .from("fortnights")
    .insert({
      start_date: fortnight.start_date,
      end_date: fortnight.end_date,
      price_liter_associate: fortnight.price_liter_associate,
      price_liter_buyer: fortnight.price_liter_buyer,
      sostenimiento_fee: fortnight.sostenimiento_fee,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function finishFortnight(id: string): Promise<void> {
  const { error } = await supabase!
    .from("fortnights")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function getVariablesFortnight(): Promise<
  VariableFortnight[] | null
> {
  const { data, error } = await supabase!
    .from("fortnight_variables")
    .select("*")
    .order("variable_id", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}
