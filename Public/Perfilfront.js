const supabaseUrl = "https://supabase.co";
const supabaseKey = "sb_publishable_PTgYE8EXqVQSWqnWQ_pU4A_CpGJ-gY-";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
const API_URL = "/api";

async function ObtenerUsuarioActual() {
    const storageKey = "sb-yxsogwdxqnmzppuafhqx-auth-token";
    const rawSession = localStorage.getItem(storageKey);

    if (rawSession) {
        try {
            const parsed = JSON.parse(rawSession);
            if (parsed?.user) return parsed.user;
        } catch (e) { /* continúa */ }
    }

    const { data: { session } } = await supabaseClient.auth.getSession();
    return session?.user || null;
}

async function ObtenerPerfil() {
    const user = await ObtenerUsuarioActual();

    if (!user) {
        window.location.href = "Login.html";
        return null;
    }

    await fetch(`${API_URL}/usuario-actual/${user.id}?email=${encodeURIComponent(user.email || '')}`);

    const res = await fetch(`${API_URL}/perfil/${user.id}?email=${encodeURIComponent(user.email || '')}`);
    if (!res.ok) throw new Error("No se pudo cargar el perfil");
    return await res.json();
}

async function ActualizarPerfil(nuevo) {
    const user = await ObtenerUsuarioActual();
    if (!user) return { ok: false, error: "Tu sesión expiró. Inicia sesión de nuevo." };

    const res = await fetch(`${API_URL}/perfil/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...nuevo, email: user.email })
    });
    return await res.json();
}

