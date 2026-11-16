const db = require('./Supabase');

async function RegistrarUsuario({ email, password, nombre, apellido, tipoDocumento, documento, celular }) {
    const { data, error } = await db.auth.signUp({
        email,
        password,
        options: {
            data: {
                NombreUsuario: nombre,
                ApellidoUsuario: apellido,
                IdTipoDocumento: tipoDocumento,
                DocumentoUsuario: documento,
                CorreoUsuario: email,
                CelularUsuario: celular
            }
        }
    });

    if (error) return { ok: false, error: error.message };
    return { ok: true, session: data.session, user: data.user };
}

async function IniciarSesionUsuario(email, password) {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    return { ok: true, session: data.session, user: data.user };
}

async function RecuperarContrasenaUsuario(email, redirectUrl) {
    const { error } = await db.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
}

async function CambiarContrasenaUsuario(accessToken, refreshToken, newPassword) {
    // Establecemos la sesión temporal de recuperación en el servidor
    const { error: sessionError } = await db.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
    });
    if (sessionError) return { ok: false, error: "El enlace no es válido o ya venció. Solicita uno nuevo." };

    const { error } = await db.auth.updateUser({ password: newPassword });
    if (error) return { ok: false, error: error.message };

    await db.auth.signOut();
    return { ok: true };
}

module.exports = {
    RegistrarUsuario,
    IniciarSesionUsuario,
    RecuperarContrasenaUsuario,
    CambiarContrasenaUsuario
};
