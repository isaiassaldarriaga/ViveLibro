const db = require('./Supabase');

async function ObtenerPerfil(authUserId, email) {
    let { data: usuario, error } = await db
        .from('Usuarios')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

    if (error) throw error;

    if (!usuario && email) {
        const { data: porCorreo } = await db
            .from('Usuarios')
            .select('*')
            .eq('CorreoUsuario', email)
            .maybeSingle();

        if (porCorreo) {
            await db.from('Usuarios').update({ auth_user_id: authUserId }).eq('IdUsuario', porCorreo.IdUsuario);
            usuario = porCorreo;
        }
    }

    return {
        nombre: usuario?.NombreUsuario || "",
        apellido: usuario?.ApellidoUsuario || "",
        celular: usuario?.CelularUsuario || "",
        tipoDocumento: usuario?.IdTipoDocumento || 1,
        documento: usuario?.DocumentoUsuario || "",
        email: usuario?.CorreoUsuario || email || ""
    };
}

async function ActualizarPerfil(authUserId, nuevo) {
    let { data: existente } = await db
        .from('Usuarios')
        .select('"IdUsuario"')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

    if (!existente && nuevo.email) {
        const { data: porCorreo } = await db
            .from('Usuarios')
            .select('"IdUsuario"')
            .eq('CorreoUsuario', nuevo.email)
            .maybeSingle();
        existente = porCorreo;
    }

    const camposActualizar = {
        auth_user_id: authUserId,
        NombreUsuario: nuevo.nombre,
        ApellidoUsuario: nuevo.apellido,
        CelularUsuario: nuevo.celular,
        IdTipoDocumento: Number(nuevo.tipoDocumento),
        DocumentoUsuario: nuevo.documento,
        CorreoUsuario: nuevo.email
    };

    let errorOp;
    if (existente) {
        const { error } = await db
            .from('Usuarios')
            .update(camposActualizar)
            .eq('IdUsuario', existente.IdUsuario);
        errorOp = error;
    } else {
        const { error } = await db
            .from('Usuarios')
            .insert(camposActualizar);
        errorOp = error;
    }

    if (errorOp) return { ok: false, error: errorOp.message };

    return {
        ok: true,
        perfil: nuevo
    };
}

module.exports = {
    ObtenerPerfil,
    ActualizarPerfil
};
