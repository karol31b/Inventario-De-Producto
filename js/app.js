// ============================================
// Lógica principal de la aplicación
// ============================================

// Variables globales
let productoEditandoId = null;
let vistaActual = 'tabla'; // 'tabla' o 'tarjetas'

// ==========================================
// LOGIN.HTML - Registro e inicio de sesión
// ==========================================

// Ejecutar al cargar login.html
if (document.getElementById('loginPage')) {
    auth.onAuthChange((session) => {
        if (session) {
            window.location.href = 'inventario.html';
        }
    });

    // Alternar entre formularios
    const btnIrRegistro = document.getElementById('irRegistro');
    const btnIrLogin = document.getElementById('irLogin');
    const formLogin = document.getElementById('formLogin');
    const formRegistro = document.getElementById('formRegistro');

    if (btnIrRegistro) {
        btnIrRegistro.addEventListener('click', (e) => {
            e.preventDefault();
            formLogin.classList.add('oculto');
            formRegistro.classList.remove('oculto');
        });
    }

    if (btnIrLogin) {
        btnIrLogin.addEventListener('click', (e) => {
            e.preventDefault();
            formRegistro.classList.add('oculto');
            formLogin.classList.remove('oculto');
        });
    }

    // Registro
    formRegistro.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSubmit = formRegistro.querySelector('button[type="submit"]');
        const msgRegistro = document.getElementById('msgRegistro');

        // Desactivar botón para evitar múltiples envíos
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Procesando...';
        msgRegistro.textContent = '';
        msgRegistro.className = '';

        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;

        const resultado = await auth.registrar(email, password);

        // Reactivar botón
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Registrarse';

        if (resultado.exito) {
            msgRegistro.textContent = resultado.mensaje;
            msgRegistro.className = 'mensaje-exito';
            formRegistro.reset();
        } else {
            msgRegistro.textContent = resultado.mensaje;
            msgRegistro.className = 'mensaje-error';
        }
    });

    // Login
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSubmit = formLogin.querySelector('button[type="submit"]');
        const msgLogin = document.getElementById('msgLogin');

        // Desactivar botón
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Ingresando...';
        msgLogin.textContent = '';
        msgLogin.className = '';

        const email = document.getElementById('logEmail').value.trim();
        const password = document.getElementById('logPassword').value;

        const resultado = await auth.login(email, password);

        // Reactivar botón
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Ingresar';

        if (resultado.exito) {
            window.location.href = 'inventario.html';
        } else {
            msgLogin.textContent = resultado.mensaje;
            msgLogin.className = 'mensaje-error';
        }
    });
}

// ==========================================
// INVENTARIO.HTML - Gestión de productos
// ==========================================

if (document.getElementById('inventarioPage')) {
    auth.onAuthChange((session) => {
        if (!session) {
            window.location.href = 'login.html';
        } else {
            mostrarNombreUsuario(session.user.email);
            cargarProductos();
        }
    });

    // Cerrar sesión
    document.getElementById('btnLogout').addEventListener('click', async () => {
        await auth.logout();
        window.location.href = 'login.html';
    });

    // Cambiar vista tabla/tarjetas
    document.getElementById('btnVistaTabla').addEventListener('click', () => {
        vistaActual = 'tabla';
        cargarProductos();
    });

    document.getElementById('btnVistaTarjetas').addEventListener('click', () => {
        vistaActual = 'tarjetas';
        cargarProductos();
    });

    // Formulario de producto (crear/editar)
    const formProducto = document.getElementById('formProducto');
    formProducto.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = await auth.obtenerUsuario();
        if (!user) return;

        const nombre = document.getElementById('prodNombre').value.trim();
        const descripcion = document.getElementById('prodDescripcion').value.trim();
        const precio = parseFloat(document.getElementById('prodPrecio').value);
        const cantidad = parseInt(document.getElementById('prodCantidad').value);
        const imagenUrl = document.getElementById('prodImagen').value.trim();

        if (!nombre || isNaN(precio) || isNaN(cantidad)) {
            mostrarMensajeForm('Completa todos los campos obligatorios.', 'error');
            return;
        }

        const producto = {
            nombre: nombre,
            descripcion: descripcion,
            precio: precio,
            cantidad: cantidad,
            imagen_url: imagenUrl || null,
            user_id: user.id
        };

        let resultado;
        if (productoEditandoId) {
            // Actualizar
            resultado = await crud.actualizarProducto(productoEditandoId, producto);
            productoEditandoId = null;
            document.getElementById('tituloForm').textContent = 'Nuevo Producto';
            document.getElementById('btnSubmitForm').textContent = 'Guardar Producto';
        } else {
            // Crear
            resultado = await crud.crearProducto(producto);
        }

        if (resultado.exito) {
            mostrarMensajeForm(resultado.mensaje, 'exito');
            formProducto.reset();
            cargarProductos();
        } else {
            mostrarMensajeForm(resultado.mensaje, 'error');
        }
    });

    // Cancelar edición
    document.getElementById('btnCancelarEdicion').addEventListener('click', () => {
        productoEditandoId = null;
        formProducto.reset();
        document.getElementById('tituloForm').textContent = 'Nuevo Producto';
        document.getElementById('btnSubmitForm').textContent = 'Guardar Producto';
        document.getElementById('btnCancelarEdicion').classList.add('oculto');
        mostrarMensajeForm('', '');
    });
}

// ==========================================
// Funciones auxiliares para inventario
// ==========================================

function mostrarNombreUsuario(email) {
    const el = document.getElementById('nombreUsuario');
    if (el) el.textContent = email;
}

function mostrarMensajeForm(texto, tipo) {
    const el = document.getElementById('msgForm');
    el.textContent = texto;
    el.className = '';
    if (tipo === 'exito') el.className = 'mensaje-exito';
    else if (tipo === 'error') el.className = 'mensaje-error';
    else if (tipo === 'info') el.className = 'mensaje-info';
}

async function cargarProductos() {
    const user = await auth.obtenerUsuario();
    if (!user) return;

    const contenedorTabla = document.getElementById('contenedorTabla');
    const contenedorTarjetas = document.getElementById('contenedorTarjetas');

    const resultado = await crud.obtenerProductos(user.id);

    if (vistaActual === 'tabla') {
        contenedorTabla.classList.remove('oculto');
        contenedorTarjetas.classList.add('oculto');
        renderizarTabla(resultado.data);
    } else {
        contenedorTabla.classList.add('oculto');
        contenedorTarjetas.classList.remove('oculto');
        renderizarTarjetas(resultado.data);
    }
}

function renderizarTabla(productos) {
    const tbody = document.getElementById('tbodyProductos');
    tbody.innerHTML = '';

    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="vacio">No hay productos registrados.</td></tr>';
        return;
    }

    productos.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(p.nombre)}</td>
            <td>${escapeHtml(p.descripcion || '—')}</td>
            <td>$${p.precio.toFixed(2)}</td>
            <td>${p.cantidad}</td>
            <td>${p.imagen_url ? '<img src="' + escapeHtml(p.imagen_url) + '" alt="img" class="img-mini">' : '—'}</td>
            <td class="acciones">
                <button class="btn btn-editar" onclick="editarProducto('${p.id}')">Editar</button>
                <button class="btn btn-eliminar" onclick="eliminarProducto('${p.id}')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderizarTarjetas(productos) {
    const contenedor = document.getElementById('contenedorTarjetas');
    contenedor.innerHTML = '';

    if (productos.length === 0) {
        contenedor.innerHTML = '<p class="vacio">No hay productos registrados.</p>';
        return;
    }

    productos.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            ${p.imagen_url ? '<img src="' + escapeHtml(p.imagen_url) + '" alt="' + escapeHtml(p.nombre) + '" class="card-img">' : '<div class="card-img-placeholder">Sin imagen</div>'}
            <div class="card-body">
                <h3>${escapeHtml(p.nombre)}</h3>
                <p class="card-desc">${escapeHtml(p.descripcion || 'Sin descripción')}</p>
                <p class="card-precio">$${p.precio.toFixed(2)}</p>
                <p class="card-cantidad">Stock: ${p.cantidad}</p>
                <div class="card-acciones">
                    <button class="btn btn-editar" onclick="editarProducto('${p.id}')">Editar</button>
                    <button class="btn btn-eliminar" onclick="eliminarProducto('${p.id}')">Eliminar</button>
                </div>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

async function editarProducto(id) {
    const user = await auth.obtenerUsuario();
    if (!user) return;

    const resultado = await crud.obtenerProductos(user.id);
    const producto = resultado.data.find(p => p.id === id);
    if (!producto) return;

    productoEditandoId = id;
    document.getElementById('prodNombre').value = producto.nombre;
    document.getElementById('prodDescripcion').value = producto.descripcion || '';
    document.getElementById('prodPrecio').value = producto.precio;
    document.getElementById('prodCantidad').value = producto.cantidad;
    document.getElementById('prodImagen').value = producto.imagen_url || '';

    document.getElementById('tituloForm').textContent = 'Editar Producto';
    document.getElementById('btnSubmitForm').textContent = 'Actualizar Producto';
    document.getElementById('btnCancelarEdicion').classList.remove('oculto');

    document.getElementById('formProducto').scrollIntoView({ behavior: 'smooth' });
}

async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    const resultado = await crud.eliminarProducto(id);
    if (resultado.exito) {
        cargarProductos();
    } else {
        alert('Error al eliminar: ' + resultado.mensaje);
    }
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}