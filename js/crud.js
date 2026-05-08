// ============================================
// Operaciones CRUD sobre la tabla "productos"
// ============================================

const TABLA_PRODUCTOS = 'productos';

const crud = {

    // CREATE - Crear un producto
    async crearProducto(producto) {
        const { data, error } = await supabaseClient
            .from(TABLA_PRODUCTOS)
            .insert([producto])
            .select();
        if (error) {
            return { exito: false, mensaje: error.message };
        }
        return { exito: true, mensaje: 'Producto creado.', data: data[0] };
    },

    // READ - Obtener todos los productos del usuario autenticado
    async obtenerProductos(userId) {
        const { data, error } = await supabaseClient
            .from(TABLA_PRODUCTOS)
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) {
            return { exito: false, mensaje: error.message, data: [] };
        }
        return { exito: true, data: data };
    },

    // UPDATE - Actualizar un producto
    async actualizarProducto(id, producto) {
        const { data, error } = await supabaseClient
            .from(TABLA_PRODUCTOS)
            .update(producto)
            .eq('id', id)
            .select();
        if (error) {
            return { exito: false, mensaje: error.message };
        }
        return { exito: true, mensaje: 'Producto actualizado.', data: data[0] };
    },

    // DELETE - Eliminar un producto
    async eliminarProducto(id) {
        const { error } = await supabaseClient
            .from(TABLA_PRODUCTOS)
            .delete()
            .eq('id', id);
        if (error) {
            return { exito: false, mensaje: error.message };
        }
        return { exito: true, mensaje: 'Producto eliminado.' };
    }
};