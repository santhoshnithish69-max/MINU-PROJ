import { getSupabaseClient } from "./supabase.js";

try {
    const { data: { session }, error } = await getSupabaseClient().auth.getSession();
    if (error || !session) window.location.replace("signin.html");
} catch {
    window.location.replace("signin.html");
}