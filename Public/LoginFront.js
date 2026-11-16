const supabaseUrl = "https://yxsogwdxqnmzppuafhqx.supabase.co";
const supabaseKey = "sb_publishable_PTgYE8EXqVQSWqnWQ_pU4A_CpGJ-gY-";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
const API_URL = "http:/api";

function MostrarRegistro() {
    document.getElementById("seccionLogin").classList.add("d-none");
    document.getElementById("seccionRegistro").classList.remove("d-none");
}

function MostrarLogin() {
    document.getElementById("seccionRegistro").classList.add("d-none");
    document.getElementById("seccionLogin").classList.remove("d-none");
}

async function Registrar() {
    try {
        const nombre = document.getElementById("rNombre").value.trim();
        const apellido = document.getElementById("rApellido").value.trim();
        const celular = document.getElementById("rCelular").value.trim();
        const tipoDocumento = document.getElementById("rTipoDocumento").value.trim();
        const documento = document.getElementById("rDocumento").value.trim();
        const email = document.getElementById("rEmail").value.trim();
        const password = document.getElementById("rPassword").value;
        const password2 = document.getElementById("rPassword2").value;

        if (!nombre || !apellido || !celular || !tipoDocumento || !documento || !email || !password) {
            throw new Error("Completa todos los campos");
        }
        if (password.length < 6) {
            throw new Error("La contraseña debe tener mínimo 6 caracteres");
        }
        if (password !== password2) {
            throw new Error("Las contraseñas no coinciden");
        }
        if (!document.getElementById("rPoliticas").checked) {
            throw new Error("Aceptar las políticas de tratamiento de datos es necesario para continuar");
        }

        const res = await fetch(`${API_URL}/auth/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, apellido, celular, tipoDocumento, documento, email, password })
        });

        const resultado = await res.json();
        if (!res.ok || !resultado.ok) throw new Error(resultado.error || "Error al registrar");

        if (resultado.session) {
            await supabaseClient.auth.setSession(resultado.session);
            window.location.href = "index.html";
        } else {
            alert("Cuenta creada. Revisa tu correo para confirmarla.");
            MostrarLogin();
        }
    } catch (error) {
        alert("Hubo un error: " + error.message);
    }
}

async function IniciarSesion() {
    try {
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        if (!email || !password) throw new Error("Ingresa tu correo y contraseña");

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw new Error(error.message);

        if (data.session) {
            window.location.href = "index.html";
        }
    } catch (error) {
        alert("Hubo un error: " + error.message);
    }
}



async function RecuperarContrasena() {
    try {
        const email = document.getElementById("recEmail").value.trim();
        if (!email) throw new Error("Escribe tu correo");

        const redirectUrl = new URL("Restablecer.html", window.location.href).href;

        const res = await fetch(`${API_URL}/auth/recuperar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, redirectUrl })
        });

        const resultado = await res.json();
        if (!res.ok || !resultado.ok) throw new Error(resultado.error);

        alert("Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.");
        window.location.href = "Login.html";
    } catch (error) {
        alert("Hubo un error: " + error.message);
    }
}

async function CambiarContrasena() {
    try {
        const password = document.getElementById("nuevaPassword").value;
        const password2 = document.getElementById("nuevaPassword2").value;

        if (!password || !password2) throw new Error("Completa los dos campos");
        if (password.length < 6) throw new Error("La contraseña debe tener mínimo 6 caracteres");
        if (password !== password2) throw new Error("Las contraseñas no coinciden");

        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
            throw new Error("El enlace no es válido o ya venció. Solicita uno nuevo.");
        }

        const res = await fetch(`${API_URL}/auth/restablecer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                accessToken: session.access_token,
                refreshToken: session.refresh_token,
                password
            })
        });

        const resultado = await res.json();
        if (!res.ok || !resultado.ok) throw new Error(resultado.error);

        await supabaseClient.auth.signOut();
        alert("Contraseña actualizada. Inicia sesión con la nueva.");
        window.location.href = "Login.html";
    } catch (error) {
        alert("Hubo un error: " + error.message);
    }
}

