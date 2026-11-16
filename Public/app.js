const supabaseUrl = "https://yxsogwdxqnmzppuafhqx.supabase.co";
const supabaseKey = "sb_publishable_PTgYE8EXqVQSWqnWQ_pU4A_CpGJ-gY-";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const API_URL = "/api";
let libroSeleccionado = null;

async function ObtenerIdUsuarioActual() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const user = session?.user;

    if (!user) {
        console.warn("No hay sesión activa en el navegador.");
        return null;
    }

    try {
        const res = await fetch(`${API_URL}/usuario-actual/${user.id}?email=${encodeURIComponent(user.email || '')}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        return data.IdUsuario;
    } catch (err) {
        console.error("Error obteniendo IdUsuario desde el servidor:", err.message);
        return null;
    }
}

async function GuardarLibro() {
    try {
        const idUsuarioActual = await ObtenerIdUsuarioActual();
        if (!idUsuarioActual) throw new Error("No hay sesión activa. Inicia sesión nuevamente.");

        let titulo = document.getElementById("t").value.trim();
        let autor = document.getElementById("a").value.trim();
        let paginas = Number(document.getElementById("p").value);
        let estado = parseInt(document.getElementById('s').value, 10);

        if (titulo === "" || autor === "" || isNaN(paginas)) {
            throw new Error("Por favor, completa los campos obligatorios.");
        }

        const respuesta = await fetch(`${API_URL}/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                titulo,
                autor,
                paginas,
                estado,
                idUsuario: idUsuarioActual
            })
        });

        const resultado = await respuesta.json();
        if (!respuesta.ok) throw new Error(resultado.error);

        alert("Libro guardado con éxito");
        document.getElementById("t").value = "";
        document.getElementById("a").value = "";
        document.getElementById("p").value = "";
        await CargarCarrusel();
    } catch (error) {
        alert("Hubo un error: " + error.message);
    }
}

async function CargarCarrusel() {
    try {
        const idUsuario = await ObtenerIdUsuarioActual();
        if (!idUsuario) return;

        const respuesta = await fetch(`${API_URL}/libros?idUsuario=${idUsuario}`);
        const data = await respuesta.json();
        if (!respuesta.ok) throw new Error(data.error);

        document.querySelectorAll('tbody[data-estado]').forEach(tb => tb.innerHTML = "");
        const contadores = {};

        data.forEach(libro => {
            const tbody = document.querySelector(`tbody[data-estado="${libro.IdEstadoLibro}"]`);
            if (!tbody) return;

            contadores[libro.IdEstadoLibro] = (contadores[libro.IdEstadoLibro] || 0) + 1;

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td></td><td></td><td></td>
                <td class="text-center align-middle">
                    <button type="button" class="btn btn-outline-secondary btn-sm btn-detalle"
                            data-id="${libro.IdLibro}" title="Ver detalles"
                            onclick="SeleccionarLibro(${libro.IdLibro})">
                        <i class="bi bi-search"></i>
                    </button>
                </td>`;
            fila.children[0].textContent = contadores[libro.IdEstadoLibro];
            fila.children[1].textContent = libro.TituloLibro;
            fila.children[2].textContent = libro.CantidadPaginas;

            tbody.appendChild(fila);
        });

        document.querySelectorAll('tbody[data-estado]').forEach(tb => {
            if (tb.children.length === 0) {
                tb.innerHTML = '<tr><td colspan="4" class="text-center">No hay libros en este estado</td></tr>';
            }
        });
    } catch (error) {
        console.error("Error al cargar tablas:", error.message);
    }
}

async function SeleccionarLibro(idLibro) {
    try {
        const respuesta = await fetch(`${API_URL}/libros/${idLibro}`);
        const libro = await respuesta.json();
        if (!respuesta.ok) throw new Error(libro.error);

        libroSeleccionado = libro.IdLibro;

        document.getElementById("dTitulo").textContent = libro.TituloLibro;
        document.getElementById("dAutor").textContent = `${libro.AutorLibro}, ${libro.CantidadPaginas} páginas`;
        document.getElementById("dEstado").value = libro.IdEstadoLibro;
        document.getElementById("dNuevaNota").value = "";

        document.getElementById("detalleVacio").classList.add("d-none");
        document.getElementById("detalleContenido").classList.remove("d-none");

        await CargarNotas();
    } catch (error) {
        alert("Hubo un error: " + error.message);
    }
}

async function CargarNotas() {
    const contenedor = document.getElementById("dNotas");
    try {
        const respuesta = await fetch(`${API_URL}/libros/${libroSeleccionado}/notas`);
        const data = await respuesta.json();
        if (!respuesta.ok) throw new Error(data.error);

        contenedor.innerHTML = "";

        if (data.length === 0) {
            contenedor.innerHTML = '<p class="text-muted small mb-0">Aún no hay notas.</p>';
            return;
        }

        data.forEach(nota => {
            const item = document.createElement("div");
            item.className = "border-bottom pb-2 mb-2";

            const fecha = document.createElement("div");
            fecha.className = "small text-muted";
            fecha.textContent = nota.FechaCreacion
                ? new Date(nota.FechaCreacion).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
                : "Sin fecha";

            const texto = document.createElement("div");
            texto.textContent = nota.NotaComentario;

            item.appendChild(fecha);
            item.appendChild(texto);
            contenedor.appendChild(item);
        });
    } catch (error) {
        alert("Hubo un error al cargar las notas: " + error.message);
    }
}

async function GuardarDetalle() {
    try {
        if (!libroSeleccionado) return;

        const estado = parseInt(document.getElementById("dEstado").value, 10);
        const nuevaNota = document.getElementById("dNuevaNota").value.trim();

        const respuesta = await fetch(`${API_URL}/libros/${libroSeleccionado}/detalle`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado, nuevaNota })
        });

        const resultado = await respuesta.json();
        if (!respuesta.ok) throw new Error(resultado.error);

        document.getElementById("dNuevaNota").value = "";
        await CargarNotas();
        await CargarCarrusel();
        alert("Cambios guardados");
    } catch (error) {
        alert("Hubo un error: " + error.message);
    }
}

async function EliminarDetalle() {
    try {
        if (!libroSeleccionado) return;
        if (!confirm("¿Seguro que quieres eliminar este libro y sus notas?")) return;

        const respuesta = await fetch(`${API_URL}/libros/${libroSeleccionado}`, {
            method: 'DELETE'
        });

        const resultado = await respuesta.json();
        if (!respuesta.ok) throw new Error(resultado.error);

        libroSeleccionado = null;
        document.getElementById("detalleContenido").classList.add("d-none");
        document.getElementById("detalleVacio").classList.remove("d-none");

        await CargarCarrusel();
        alert("Libro eliminado");
    } catch (error) {
        alert("Hubo un error: " + error.message);
    }
}

async function CargarRecomendacionesInicio() {
    const contenedor = document.getElementById("listaRecomendaciones") || document.getElementById("contenedorRecomendaciones");
    if (!contenedor) return;

    try {
        const respuesta = await fetch(`${API_URL}/recomendaciones`);
        const recomendaciones = await respuesta.json();
        if (!respuesta.ok) throw new Error(recomendaciones.error);

        contenedor.innerHTML = "";

        if (recomendaciones.length === 0) {
            contenedor.innerHTML = '<p class="text-muted">No hay recomendaciones disponibles por ahora.</p>';
            return;
        }

        recomendaciones.forEach(rec => {
            const col = document.createElement("div");
            col.className = "col-md-4 mb-3";
            col.innerHTML = `
                <div class="card rec">
                    <div class="card-body">
                        <span class="etiqueta">${rec.Genero || "General"}</span>
                        <h3>${rec.Titulo}</h3>
                        <div class="autor">${rec.Autor}</div>
                        <p class="resumen">${rec.Resumen || ""}</p>
                        <button type="button" class="btn btn-outline-secondary btn-sm mt-auto"
                            onclick="PrellenarFormulario('${rec.Titulo.replace(/'/g, "\\'")}', '${rec.Autor.replace(/'/g, "\\'")}')">
                            Agregar a mi lista
                        </button>
                    </div>
                </div>`;
            contenedor.appendChild(col);
        });
    } catch (error) {
        console.error("Error al cargar recomendaciones:", error.message);
    }
}

function PrellenarFormulario(titulo, autor) {
    document.getElementById("t").value = titulo;
    document.getElementById("a").value = autor;
    document.getElementById("p").focus();
}

async function VerificarMenuAdmin() {
    const itemAdmin = document.getElementById("itemAdmin");
    if (!itemAdmin) return;

    try {
        const { data: esAdmin } = await supabaseClient.rpc("es_admin");
        if (esAdmin === true) {
        itemAdmin.classList.remove("d-none");
    }
    } catch (error) {
    console.error("Error verificando rol:", error.message);
    }
}
async function CerrarSesion() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        alert("Sesión cerrada correctamente.");
        window.location.href = "Login.html";
    } catch (error) {
    alert("Hubo un error al cerrar la sesión: " + error.message);
    }
}
const btnGuardar = document.getElementById("btnGuardar");
if (btnGuardar) btnGuardar.addEventListener("click", GuardarDetalle);
const btnEliminar = document.getElementById("btnEliminar");
if (btnEliminar) btnEliminar.addEventListener("click", EliminarDetalle);
document.addEventListener("DOMContentLoaded", () => {
    CargarCarrusel();
    CargarRecomendacionesInicio();
    VerificarMenuAdmin();
});
