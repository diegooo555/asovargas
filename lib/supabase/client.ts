import { createClient } from "@supabase/supabase-js";
import {
  Client,
  ProductionRecord,
  Variable,
  VariableFortnight,
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
): Promise<ProductionRecord[] | null> {
  const { data, error } = await supabase!
    .from("production_records")
    .select("*")
    .eq("client_id", userId)
    .order("production_datetime", { ascending: false });

  if (error) {
    throw error;
  }
  return data;
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
