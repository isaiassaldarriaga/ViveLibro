const db = require('./Supabase');
const TABLA_PERFIL = "Usuarios";

const COL = {
    authId: "auth_user_id",
    nombre: "NombreUsuario",
    apellido: "ApellidoUsuario",
    celular: "CelularUsuario",
    tipoDocumento: "IdTipoDocumento",
    documento: "DocumentoUsuario"
};

function DesdeFila(fila, email = "") {
    return {
        nombre: fila[COL.nombre] ?? "",
        apellido: fila[COL.apellido] ?? "",
        celular: fila[COL.celular] ?? "",
        tipoDocumento: Number(fila[COL.tipoDocumento]) || 1,
        documento: fila[COL.documento] ?? "",
        email: email
    };
}

function AFila(perfil) {
    return {
        [COL.nombre]: perfil.nombre,
        [COL.apellido]: perfil.apellido,
        [COL.celular]: perfil.celular,
        [COL.tipoDocumento]: perfil.tipoDocumento,
        [COL.documento]: perfil.documento
    };
}

async function ObtenerPerfil(authUserId, email) {
    const { data, error } = await db
        .from(TABLA_PERFIL)
        .select("*")
        .eq(COL.authId, authUserId)
        .single();

    if (error) throw error;
    return DesdeFila(data, email);
}

async function ActualizarPerfil(authUserId, email, nuevo) {
    const { data, error } = await db
        .from(TABLA_PERFIL)
        .update(AFila(nuevo))
        .eq(COL.authId, authUserId)
        .select()
        .single();

    if (error) return { ok: false, error: error.message };
    return { ok: true, perfil: DesdeFila(data, email) };
}

module.exports = {
    ObtenerPerfil,
    ActualizarPerfil
};
