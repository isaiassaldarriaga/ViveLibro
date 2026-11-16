
const supabaseClient = require('./Supabase');


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
        const apellido=document.getElementById("rApellido").value.trim();
        const celular=document.getElementById("rCelular").value.trim();
        const tipoDocumento=document.getElementById("rTipoDocumento").value.trim();
        const documento=document.getElementById("rDocumento").value.trim();
        const email = document.getElementById("rEmail").value.trim();
        const password = document.getElementById("rPassword").value;
        const password2 = document.getElementById("rPassword2").value;
        
        if (nombre === "" ||apellido==""||celular=="" ||tipoDocumento=="" ||documento=="" || email === "" || password === "") {
            throw new Error("Completa todos los campos");
        }
        if (password.length < 6) {
            throw new Error("La contraseña debe tener mínimo 6 caracteres");
        }
        if (password !== password2) {
            throw new Error("Las contraseñas no coinciden");
        }
        if(!document.getElementById("rPoliticas").checked){
            throw new Error("Aceptar las politicas de tratamiento de datos es necesario para continuar");
        }
        
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: { data: { NombreUsuario:nombre, ApellidoUsuario:apellido, IdTipoDocumento:tipoDocumento, DocumentoUsuario:documento, CorreoUsuario:email, CelularUsuario:celular } } // se guarda en los datos del usuario
        });
        if (error) throw error;

        if (data.session) {
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

        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;

        window.location.href = "index.html";
    } catch (error) {
        alert("Hubo un error: " + error.message);
    }
}

// Si ya hay sesión abierta, pasa directo a la biblioteca
(async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) window.location.href = "index.html";
})();


async function RecuperarContrasena() {
    try {
        const email = document.getElementById("recEmail").value.trim();
        if (email === "") throw new Error("Escribe tu correo");

        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: new URL("Restablecer.html", window.location.href).href
        });
        if (error) throw error;

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

        if (password === "" || password2 === "") {
            throw new Error("Completa los dos campos");
        }
        if (password.length < 6) {
            throw new Error("La contraseña debe tener mínimo 6 caracteres");
        }
        if (password !== password2) {
            throw new Error("Las contraseñas no coinciden");
        }
        
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
            throw new Error("El enlace no es válido o ya venció. Solicita uno nuevo.");
        }

        const { error } = await supabaseClient.auth.updateUser({ password });
        if (error) throw error;

        await supabaseClient.auth.signOut();
        alert("Contraseña actualizada. Inicia sesión con la nueva.");
        window.location.href = "Login.html";
    } catch (error) {
        alert("Hubo un error: " + error.message);
    }
}


