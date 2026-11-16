const db = require('./Supabase');
const TABLA_RECOMENDACIONES = "Recomendaciones";

async function EsAdministrador(token) {
    // Crea un cliente con el token del usuario para validar su rol en Supabase
    const { data: { user }, error: authError } = await db.auth.getUser(token);
    if (authError || !user) return false;

    const { data, error } = await db.rpc("es_admin");
    if (error) throw error;
    return data === true;
}

async function ObtenerRecomendaciones() {
    const { data, error } = await db
        .from(TABLA_RECOMENDACIONES)
        .select("*")
        .order("FechaCreacion", { ascending: false });
    if (error) throw error;
    return data;
}

async function CrearRecomendacion(d) {
    const { error } = await db.from(TABLA_RECOMENDACIONES).insert({
        Titulo: d.Titulo,
        Autor: d.Autor,
        Genero: d.Genero || null,
        Resumen: d.Resumen || null
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
}

async function ActualizarRecomendacion(id, d) {
    const { data, error } = await db
        .from(TABLA_RECOMENDACIONES)
        .update({
            Titulo: d.Titulo,
            Autor: d.Autor,
            Genero: d.Genero || null,
            Resumen: d.Resumen || null
        })
        .eq("IdRecomendacion", id)
        .select();
    if (error) return { ok: false, error: error.message };
    if (!data || data.length === 0) return { ok: false, error: "No se pudo editar esta recomendación." };
    return { ok: true };
}

async function EliminarRecomendacion(id) {
    const { data, error } = await db
        .from(TABLA_RECOMENDACIONES)
        .delete()
        .eq("IdRecomendacion", id)
        .select();
    if (error) return { ok: false, error: error.message };
    if (!data || data.length === 0) return { ok: false, error: "No se pudo borrar esta recomendación." };
    return { ok: true };
}

module.exports = {
    EsAdministrador,
    ObtenerRecomendaciones,
    CrearRecomendacion,
    ActualizarRecomendacion,
    EliminarRecomendacion
};
