const LUENCE_CONFIG = Object.freeze({
  supabaseUrl: "https://pmhpgrdeknzbvegkrnxi.supabase.co",
  publishableKey: "sb_publishable_pTdf3oXkrwazZbligXLmQg_OCc0TEyW",
  adminEmail: "vyzo.studiodesign@gmail.com",
  whatsappNumber: "556193969031",
  businessName: "Luence Space",
  professionalName: "Larissa Luenda",
  timezone: "America/Sao_Paulo",
  openingTime: "08:00",
  closingTime: "18:00",
  scheduleAnchor: "2026-10-03",
  pendingMinutes: 5
});

window.LUENCE_CONFIG = LUENCE_CONFIG;

if (typeof window.supabase !== "undefined") {
  window.luenceSupabase = window.supabase.createClient(
    LUENCE_CONFIG.supabaseUrl,
    LUENCE_CONFIG.publishableKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );
}
