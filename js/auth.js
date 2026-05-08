// ============================================
// Lógica de autenticación (registro, login, logout)
// ============================================

const auth = {
    // Registrar un nuevo usuario
    async registrar(email, password) {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password
        });
        if (error) {
            return { exito: false, mensaje: error.message };
        }
        return { exito: true, mensaje: 'Usuario registrado. Revisa tu correo para confirmar.', data: data };
    },

    // Iniciar sesión
    async login(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        if (error) {
            return { exito: false, mensaje: error.message };
        }
        return { exito: true, mensaje: 'Sesión iniciada correctamente.', data: data };
    },

    // Cerrar sesión
    async logout() {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            return { exito: false, mensaje: error.message };
        }
        return { exito: true, mensaje: 'Sesión cerrada.' };
    },

    // Obtener el usuario actual
    async obtenerUsuario() {
        const { data: { user } } = await supabaseClient.auth.getUser();
        return user;
    },

    // Escuchar cambios en el estado de autenticación
    onAuthChange(callback) {
        supabaseClient.auth.onAuthStateChange((event, session) => {
            callback(session);
        });
    }
};