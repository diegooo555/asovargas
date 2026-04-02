// hooks/useClient.ts
"use client"

import { useQuery, useQueries } from "@tanstack/react-query"
import { getClientById, getProductionHistory, getVariablesLiters, getVariablesFortnight } from "@/lib/supabase/client"
import { Client } from "@/lib/types"

export function useClient(userId: string | null) {
  return useQuery<Client | null, Error>({
    queryKey: ["client", userId],
    queryFn: () => getClientById(userId as string),
    enabled: Boolean(userId),        // no ejecuta hasta tener userId
    staleTime: 5 * 60 * 1000,        // 5 min
    gcTime: 30 * 60 * 1000,          // 30 min en caché
    retry: 1,
  })
}

export function dataUserProduction(userId: string | null) {
  const requests =  useQueries({
    queries: [
      {
        queryKey: ["client", userId],
        queryFn: () => getClientById(userId!),
        enabled: !!userId,
        staleTime: 5 * 60_000,
        gcTime: 30 * 60_000,
        retry: 1,
      },
      {
        queryKey: ["variables", "Litro"],
        queryFn: getVariablesLiters,
        staleTime: 10 * 60_000,
        gcTime: 30 * 60_000,
        retry: 1,
      },
      {
        queryKey: ["production", userId],
        queryFn: () => getProductionHistory(userId!),
        enabled: !!userId,
        staleTime: 10 * 60_000,
        gcTime: 30 * 60_000,
        retry: 1,
      },
      {
        queryKey: ["variables", "Quincena"],
        queryFn: getVariablesFortnight,
        staleTime: 10 * 60_000,
        gcTime: 30 * 60_000,
        retry: 1,
      }                     
    ]
  })

    const [
    { data: client, isLoading: cLoading, isError: cErr, error: cError },
    { data: variables, isLoading: vLoading, isError: vErr, error: vError },
    { data: records, isLoading: rLoading, isError: rErr, error: rError},
    { data: variablesFortnight, isLoading: fLoading, isError: fErr, error: fError}
  ] = requests;

  return {
    client,
    cLoading,
    cErr,
    cError,
    variables,
    vLoading,
    vErr,
    vError,
    records,
    rLoading,
    rErr,
    rError,
    variablesFortnight,
    fLoading,
    fErr,
    fError
  };

}