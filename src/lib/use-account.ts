import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const profileQuery = (uid: string) => queryOptions({
  queryKey: ["profile", uid],
  queryFn: async () => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (error) throw error;
    return data;
  },
});

/** Resolves an avatar reference: bundled `asset:` image or an uploaded `avatars/` file via a signed link. */
export function useAvatarUrl(ref: string | null | undefined, resolveAsset: (r: string) => string) {
  const uploaded = ref?.startsWith("avatars:") ? ref.slice(8) : null;
  const q = useQuery({
    queryKey: ["avatar-url", uploaded],
    enabled: !!uploaded,
    staleTime: 50 * 60_000,
    queryFn: async () => (await supabase.storage.from("avatars").createSignedUrl(uploaded!, 3600)).data?.signedUrl ?? "",
  });
  return uploaded ? q.data ?? "" : resolveAsset(ref ?? "");
}
