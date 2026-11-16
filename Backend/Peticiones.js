const supabaseClient = require('./Supabase');

// Guardar un libro nuevo
async function GuardarLibro({ titulo, autor, paginas, estado, idUsuario }) {
    const fecha = new Date().toLocaleDateString('en-CA');

    const { data, error } = await supabaseClient
        .from('Libros')
        .insert({
            TituloLibro: titulo,
            AutorLibro: autor,
            CantidadPaginas: paginas,
            IdEstadoLibro: estado,
            FechaCreacion: fecha,
            IdUsuarioCreacion: idUsuario
        })
        .select();

    if (error) throw error;
    return data;
}

// Obtener todos los libros de un usuario
async function ObtenerLibros(idUsuario) {
    let query = supabaseClient
        .from('Libros')
        .select('*')
        .order('TituloLibro');

    if (idUsuario) {
        query = query.eq('IdUsuarioCreacion', idUsuario);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

// Obtener un libro específico por su ID
async function ObtenerLibroPorId(idLibro) {
    const { data, error } = await supabaseClient
        .from('Libros')
        .select('*')
        .eq('IdLibro', idLibro)
        .single();

    if (error) throw error;
    return data;
}

// Buscar libros por título o autor
async function BuscarLibro(texto) {
    const { data, error } = await supabaseClient
        .from('Libros')
        .select('*')
        .or(`TituloLibro.ilike.%${texto}%,AutorLibro.ilike.%${texto}%`);

    if (error) throw error;
    return data;
}

// Actualizar estado y agregar nota opcional
async function GuardarDetalleLibro(idLibro, estado, nuevaNota) {
    const { data, error } = await supabaseClient
        .from('Libros')
        .update({ IdEstadoLibro: estado })
        .eq('IdLibro', idLibro)
        .select();

    if (error) throw error;
    if (data.length === 0) throw new Error("No se modificó ningún registro");

    if (nuevaNota && nuevaNota.trim() !== "") {
        const { error: errorNota } = await supabaseClient
            .from('NotasComentarios')
            .insert({ IdLibro: idLibro, NotaComentario: nuevaNota.trim() });

        if (errorNota) throw errorNota;
    }

    return data;
}

// Obtener notas de un libro
async function ObtenerNotas(idLibro) {
    const { data, error } = await supabaseClient
        .from('NotasComentarios')
        .select('*')
        .eq('IdLibro', idLibro)
        .order('FechaCreacion', { ascending: false });

    if (error) throw error;
    return data;
}

// Eliminar un libro
async function EliminarLibro(idLibro) {
    const { data, error } = await supabaseClient
        .from('Libros')
        .delete()
        .eq('IdLibro', idLibro)
        .select();

    if (error) throw error;
    if (data.length === 0) throw new Error("No se eliminó ningún registro");
    return data;
}

// Exportamos todas las funciones para que Server.js pueda usarlas
module.exports = {
    GuardarLibro,
    ObtenerLibros,
    ObtenerLibroPorId,
    BuscarLibro,
    GuardarDetalleLibro,
    ObtenerNotas,
    EliminarLibro
};
