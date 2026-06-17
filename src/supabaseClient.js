import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://xmxjspsfuupwqdyeobnl.supabase.co",
  "sb_publishable_PdRyXX5kFBvg0DHMlo78Kg_zGZT_TrT"
);

// Single-family app — all devices (fridge + phones) share this household scope.
export const HOUSEHOLD_ID = "hockman";
