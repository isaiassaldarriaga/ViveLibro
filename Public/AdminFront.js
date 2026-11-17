const supabaseUrl = "https://yxsogwdxqnmzppuafhqx.supabase.co";

const supabaseKey = "sb_publishable_PTgYE8EXqVQSWqnWQ_pU4A_CpGJ-gY-";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
const API_URL = "/api";

async function ObtenerUsuarioAdmin() {
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

async function EsAdministrador() {
    const user = await ObtenerUsuarioAdmin();
    if (!user) {
        window.location.href = "Login.html";
        return false;
    }

    const { data, error } = await supabaseClient.rpc("es_admin");
    if (error) throw error;
    return data === true;
}

async function ObtenerRecomendaciones() {
    const res = await fetch(`${API_URL}/recomendaciones`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al obtener recomendaciones");
    return data;
}

async function CrearRecomendacion(d) {
    const res = await fetch(`${API_URL}/recomendaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d)
    });
    return await res.json();
}

async function ActualizarRecomendacion(id, d) {
    const res = await fetch(`${API_URL}/recomendaciones/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d)
    });
    return await res.json();
}

async function EliminarRecomendacion(id) {
    const res = await fetch(`${API_URL}/recomendaciones/${id}`, {
        method: "DELETE"
    });
    return await res.json();
}
