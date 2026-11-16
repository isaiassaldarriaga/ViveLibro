const express = require('express');
const cors = require('cors');
const path = require('path');

// 1. IMPORTACIONES DE TUS MÓDULOS DE BACKEND
const {
    GuardarLibro,
    ObtenerLibros,
    ObtenerLibroPorId,
    BuscarLibro,
    GuardarDetalleLibro,
    ObtenerNotas,
    EliminarLibro
} = require('./Peticiones');

const {
    EsAdministrador,
    ObtenerRecomendaciones,
    CrearRecomendacion,
    ActualizarRecomendacion,
    EliminarRecomendacion
} = require('./Recomendaciones');

const {
    ObtenerPerfil,
    ActualizarPerfil
} = require('./Perfil');

const {
    RegistrarUsuario,
    IniciarSesionUsuario,
    RecuperarContrasenaUsuario,
    CambiarContrasenaUsuario
} = require('./Auth');

const app = express();
const PORT = 3000;

// 2. MIDDLEWARES
app.use(cors());
app.use(express.json());

// 3. SERVIR ARCHIVOS DEL FRONTEND (HTML, CSS, JS)
// Asegúrate de que tu carpeta hermana se llame 'frontend'
app.use(express.static(path.join(__dirname, '../Public')));

// Ruta principal al entrar a http://localhost:3000
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Public', 'index.html'));
});

// ================= RUTAS DE LIBROS =================
app.post('/api/guardar', async (req, res) => {
    try {
        const data = await GuardarLibro(req.body);
        res.status(200).json({ mensaje: '¡Guardado con éxito!', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/libros', async (req, res) => {
    try {
        const data = await ObtenerLibros(req.query.idUsuario);
        res.status(200).json(data);
    } catch (err) {
        alert("Error"+err)
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/libros/buscar', async (req, res) => {
    try {
        const data = await BuscarLibro(req.query.q || "");
        res.status(200).json(data);
    } catch (err) {
        alert("Error"+err)
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/libros/:id', async (req, res) => {
    try {
        const data = await ObtenerLibroPorId(req.params.id);
        res.status(200).json(data);
    } catch (err) {
        alert("Error"+err)
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/libros/:id/detalle', async (req, res) => {
    try {
        const { estado, nuevaNota } = req.body;
        const data = await GuardarDetalleLibro(req.params.id, estado, nuevaNota);
        res.status(200).json({ mensaje: 'Cambios guardados', data });
    } catch (err) {
        alert("Error"+err)
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/libros/:id/notas', async (req, res) => {
    try {
        const data = await ObtenerNotas(req.params.id);
        res.status(200).json(data);
    } catch (err) {
        alert("Error"+err)
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/libros/:id', async (req, res) => {
    try {
        const data = await EliminarLibro(req.params.id);
        res.status(200).json({ mensaje: 'Libro eliminado', data });
    } catch (err) {
        alert("Error"+err)
        res.status(500).json({ error: err.message });
    }
});

// ================= RUTAS DE RECOMENDACIONES =================
app.get('/api/recomendaciones', async (req, res) => {
    try {
        const data = await ObtenerRecomendaciones();
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/recomendaciones', async (req, res) => {
    try {
        const resultado = await CrearRecomendacion(req.body);
        res.status(resultado.ok ? 200 : 400).json(resultado);
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

app.put('/api/recomendaciones/:id', async (req, res) => {
    try {
        const resultado = await ActualizarRecomendacion(req.params.id, req.body);
        res.status(resultado.ok ? 200 : 400).json(resultado);
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

app.delete('/api/recomendaciones/:id', async (req, res) => {
    try {
        const resultado = await EliminarRecomendacion(req.params.id);
        res.status(resultado.ok ? 200 : 400).json(resultado);
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// ================= RUTAS DE PERFIL =================
app.get('/api/perfil/:authUserId', async (req, res) => {
    try {
        const data = await ObtenerPerfil(req.params.authUserId, req.query.email);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/perfil/:authUserId', async (req, res) => {
    try {
        const { email, ...datosPerfil } = req.body;
        const resultado = await ActualizarPerfil(req.params.authUserId, email, datosPerfil);
        res.status(resultado.ok ? 200 : 400).json(resultado);
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// ================= RUTAS DE AUTENTICACIÓN =================
app.post('/api/auth/registro', async (req, res) => {
    try {
        const resultado = await RegistrarUsuario(req.body);
        res.status(resultado.ok ? 200 : 400).json(resultado);
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const resultado = await IniciarSesionUsuario(email, password);
        res.status(resultado.ok ? 200 : 400).json(resultado);
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

app.post('/api/auth/recuperar', async (req, res) => {
    try {
        const { email, redirectUrl } = req.body;
        const resultado = await RecuperarContrasenaUsuario(email, redirectUrl);
        res.status(resultado.ok ? 200 : 400).json(resultado);
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

app.post('/api/auth/restablecer', async (req, res) => {
    try {
        const { accessToken, refreshToken, password } = req.body;
        const resultado = await CambiarContrasenaUsuario(accessToken, refreshToken, password);
        res.status(resultado.ok ? 200 : 400).json(resultado);
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});
// ================= RUTA PARA OBTENER O CREAR ID DE USUARIO =================
const db = require('./Supabase');

app.get('/api/usuario-actual/:authUserId', async (req, res) => {
    try {
        const { authUserId } = req.params;
        const { email } = req.query;

        // 1. Buscamos el usuario en la tabla Usuarios usando la Secret key
        let { data: usuario, error } = await db
            .from('Usuarios')
            .select('"IdUsuario"')
            .eq('auth_user_id', authUserId)
            .maybeSingle();

        if (error) throw error;

        // 2. Si el usuario se creó desde Supabase y no tiene fila en Usuarios, la creamos
        if (!usuario) {
            const { data: nuevo, error: errorInsert } = await db
                .from('Usuarios')
                .insert({
                    auth_user_id: authUserId,
                    CorreoUsuario: email || '',
                    NombreUsuario: 'Lector',
                    ApellidoUsuario: ''
                })
                .select('"IdUsuario"')
                .single();

            if (errorInsert) throw errorInsert;
            usuario = nuevo;
        }

        res.status(200).json({ IdUsuario: usuario.IdUsuario });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}

module.exports = app;

