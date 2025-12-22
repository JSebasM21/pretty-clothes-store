// === VERIFICACIÓN DE ACCESO ===
document.addEventListener('DOMContentLoaded', () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuario || !usuario.esAdmin) {
        alert('❌ Acceso denegado. Solo administradores pueden ver esta página.');
        window.location.href = 'login.html';
        return;
    }
    
    cargarEstadisticas();
    cargarProductos();
    cargarPedidos();
});

// === ESTADÍSTICAS ===
function cargarEstadisticas() {
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const productos = JSON.parse(localStorage.getItem('productos_db')) || [];
    
    // Total productos habilitados
    const productosHabilitados = productos.filter(p => p.habilitado).length;
    document.getElementById('stat-productos').textContent = productosHabilitados;
    
    // Total pedidos
    document.getElementById('stat-pedidos').textContent = pedidos.length;
    
    // Ventas totales (solo pedidos con pago realizado)
    let totalVentas = 0;
    pedidos.forEach(pedido => {
        if (pedido.estadoPago === 'verificado' || pedido.estadoPago === 'realizado') {
            totalVentas += pedido.total;
        }
    });
    document.getElementById('stat-ventas').textContent = totalVentas.toFixed(2) + ' Bs';
    
    // Productos con stock bajo
    const stockBajo = productos.filter(p => p.stock > 0 && p.stock <= 5 && p.habilitado).length;
    document.getElementById('stat-stock-bajo').textContent = stockBajo;
}

// === AGREGAR PRODUCTO ===
document.getElementById('producto-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('prod-nombre').value;
    const descripcion = document.getElementById('prod-descripcion').value;
    const precio = parseFloat(document.getElementById('prod-precio').value);
    const stock = parseInt(document.getElementById('prod-stock').value);
    const imagen = document.getElementById('prod-imagen').value;
    const categoria = document.getElementById('prod-categoria').value;
    
    const nuevoProducto = {
        id: 'p' + Date.now(),
        nombre,
        descripcion,
        precio,
        stock,
        imagen,
        categoria,
        habilitado: true,
        fechaCreacion: new Date().toISOString()
    };
    
    // Guardar en base de datos
    let productos = JSON.parse(localStorage.getItem('productos_db')) || [];
    productos.push(nuevoProducto);
    localStorage.setItem('productos_db', JSON.stringify(productos));
    
    // Exportar automáticamente
    exportarBaseDatos();
    
    alert('✅ Producto agregado exitosamente y aparecerá en la tienda!');
    document.getElementById('producto-form').reset();
    
    cargarEstadisticas();
    cargarProductos();
});

// === CARGAR PRODUCTOS ===
function cargarProductos() {
    const productos = JSON.parse(localStorage.getItem('productos_db')) || [];
    const tbody = document.getElementById('productos-tbody');
    
    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#666;">No hay productos</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    productos.forEach((prod, index) => {
        const stockClass = prod.stock === 0 ? 'color:red; font-weight:bold;' : prod.stock <= 5 ? 'color:orange; font-weight:bold;' : 'color:green; font-weight:bold;';
        const estadoClass = prod.habilitado ? 'color:green;' : 'color:red;';
        
        const row = document.createElement('tr');
        row.style.opacity = prod.habilitado ? '1' : '0.5';
        
        row.innerHTML = `
            <td><img src="${prod.imagen}" alt="${prod.nombre}" style="width:60px; height:60px; object-fit:cover; border-radius:8px;"></td>
            <td><strong>${prod.nombre}</strong></td>
            <td>${prod.precio} Bs</td>
            <td style="${stockClass}">${prod.stock}</td>
            <td>${prod.categoria}</td>
            <td style="${estadoClass}; font-weight:bold;">${prod.habilitado ? '✅ Activo' : '❌ Inactivo'}</td>
            <td>
                <div style="display:flex; gap:5px; flex-wrap:wrap;">
                    <button onclick="editarStock('${prod.id}')" style="padding:6px 12px; background:#2a9d8f; color:white; border:none; border-radius:5px; cursor:pointer; font-size:0.85rem;">
                        📦 Stock
                    </button>
                    <button onclick="toggleHabilitar('${prod.id}')" style="padding:6px 12px; background:${prod.habilitado ? '#ff9800' : '#4CAF50'}; color:white; border:none; border-radius:5px; cursor:pointer; font-size:0.85rem;">
                        ${prod.habilitado ? '🔒 Ocultar' : '👁️ Mostrar'}
                    </button>
                    <button onclick="copiarIdProducto('${prod.id}')" style="padding:6px 12px; background:#457b9d; color:white; border:none; border-radius:5px; cursor:pointer; font-size:0.85rem;">
                        📋 ID
                    </button>
                    <button onclick="eliminarProducto('${prod.id}')" style="padding:6px 12px; background:#e63946; color:white; border:none; border-radius:5px; cursor:pointer; font-size:0.85rem;">
                        🗑️
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// === EDITAR STOCK ===
function editarStock(id) {
    let productos = JSON.parse(localStorage.getItem('productos_db')) || [];
    const producto = productos.find(p => p.id === id);
    
    if (!producto) return;
    
    const nuevoStock = prompt(`📦 Stock actual: ${producto.stock}\n\nIngresa el nuevo stock:`, producto.stock);
    
    if (nuevoStock === null) return;
    
    const stockNum = parseInt(nuevoStock);
    
    if (isNaN(stockNum) || stockNum < 0) {
        alert('❌ Stock inválido. Debe ser un número mayor o igual a 0.');
        return;
    }
    
    producto.stock = stockNum;
    localStorage.setItem('productos_db', JSON.stringify(productos));
    
    exportarBaseDatos();
    alert('✅ Stock actualizado exitosamente');
    cargarEstadisticas();
    cargarProductos();
}

// === HABILITAR/DESHABILITAR PRODUCTO ===
function toggleHabilitar(id) {
    let productos = JSON.parse(localStorage.getItem('productos_db')) || [];
    const producto = productos.find(p => p.id === id);
    
    if (!producto) return;
    
    const accion = producto.habilitado ? 'ocultar' : 'mostrar';
    
    if (!confirm(`¿Seguro que deseas ${accion} este producto en la tienda?`)) return;
    
    producto.habilitado = !producto.habilitado;
    localStorage.setItem('productos_db', JSON.stringify(productos));
    
    exportarBaseDatos();
    alert(`✅ Producto ${producto.habilitado ? 'visible' : 'oculto'} en la tienda`);
    cargarEstadisticas();
    cargarProductos();
}

// === COPIAR ID DEL PRODUCTO ===
function copiarIdProducto(id) {
    navigator.clipboard.writeText(id).then(() => {
        alert(`✅ ID copiado: ${id}`);
    }).catch(() => {
        prompt('Copia este ID:', id);
    });
}

// === ELIMINAR PRODUCTO ===
function eliminarProducto(id) {
    if (!confirm('⚠️ ¿Seguro que deseas ELIMINAR permanentemente este producto?\n\nEsta acción no se puede deshacer.')) return;
    
    let productos = JSON.parse(localStorage.getItem('productos_db')) || [];
    productos = productos.filter(p => p.id !== id);
    localStorage.setItem('productos_db', JSON.stringify(productos));
    
    exportarBaseDatos();
    alert('✅ Producto eliminado permanentemente');
    cargarEstadisticas();
    cargarProductos();
}

// === CARGAR PEDIDOS ===
function cargarPedidos() {
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const tbody = document.getElementById('pedidos-tbody');
    
    if (pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#666;">No hay pedidos aún</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    pedidos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    pedidos.forEach(pedido => {
        const fecha = new Date(pedido.fecha).toLocaleString('es-BO');
        
        // Color según estado de pago
        const colorPago = pedido.estadoPago === 'pendiente' ? 'background:#ff9800; color:white;' : 
                         pedido.estadoPago === 'verificado' ? 'background:#4CAF50; color:white;' :
                         'background:#2196F3; color:white;';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${pedido.codigo}</strong></td>
            <td>${pedido.datosEnvio.nombre}</td>
            <td style="font-size:0.85rem;">${fecha}</td>
            <td><strong>${pedido.total.toFixed(2)} Bs</strong></td>
            <td>
                <select class="status-select" onchange="cambiarEstadoPedido('${pedido.codigo}', this.value)">
                    <option value="preparando" ${pedido.estado === 'preparando' ? 'selected' : ''}>⏳ Preparando</option>
                    <option value="enviado" ${pedido.estado === 'enviado' ? 'selected' : ''}>🚚 Enviado</option>
                    <option value="entregado" ${pedido.estado === 'entregado' ? 'selected' : ''}>✅ Entregado</option>
                </select>
            </td>
            <td>
                <select class="status-select" onchange="cambiarEstadoPago('${pedido.codigo}', this.value)" style="${colorPago} padding:8px; border-radius:8px; border:none; font-weight:bold;">
                    <option value="pendiente" ${pedido.estadoPago === 'pendiente' ? 'selected' : ''}>⏳ Pago Pendiente</option>
                    <option value="verificado" ${pedido.estadoPago === 'verificado' ? 'selected' : ''}>✅ Verificado</option>
                    <option value="realizado" ${pedido.estadoPago === 'realizado' ? 'selected' : ''}>💵 Pago Realizado</option>
                </select>
            </td>
            <td>
                <button onclick="verDetallesPedido('${pedido.codigo}')" style="padding:8px 15px; background:#457b9d; color:white; border:none; border-radius:5px; cursor:pointer; font-size:0.85rem;">
                    👁️ Ver
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// === CAMBIAR ESTADO DE PEDIDO ===
function cambiarEstadoPedido(codigo, nuevoEstado) {
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    
    const pedido = pedidos.find(p => p.codigo === codigo);
    if (pedido) {
        pedido.estado = nuevoEstado;
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        alert(`✅ Estado del pedido ${codigo} actualizado a: ${nuevoEstado.toUpperCase()}`);
    }
}

// === CAMBIAR ESTADO DE PAGO ===
function cambiarEstadoPago(codigo, nuevoEstado) {
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    
    const pedido = pedidos.find(p => p.codigo === codigo);
    if (pedido) {
        pedido.estadoPago = nuevoEstado;
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        
        const mensajes = {
            'pendiente': 'Pago marcado como PENDIENTE',
            'verificado': 'Pago VERIFICADO exitosamente',
            'realizado': 'Pago marcado como REALIZADO (efectivo recibido)'
        };
        
        alert(`✅ ${mensajes[nuevoEstado]}`);
        cargarPedidos();
        cargarEstadisticas();
    }
}

// === VER DETALLES DE PEDIDO ===
function verDetallesPedido(codigo) {
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const pedido = pedidos.find(p => p.codigo === codigo);
    
    if (!pedido) {
        alert('Pedido no encontrado');
        return;
    }
    
    const estadoPagoTexto = {
        'pendiente': '⏳ PAGO PENDIENTE',
        'verificado': '✅ PAGO VERIFICADO',
        'realizado': '💵 PAGO REALIZADO'
    };
    
    let detalles = `═══════════════════════════════════════════════\n`;
    detalles += `          DETALLES DEL PEDIDO\n`;
    detalles += `═══════════════════════════════════════════════\n\n`;
    detalles += `📋 CÓDIGO: ${pedido.codigo}\n`;
    detalles += `📅 Fecha: ${new Date(pedido.fecha).toLocaleString('es-BO')}\n`;
    detalles += `📍 Estado: ${pedido.estado.toUpperCase()}\n`;
    detalles += `💰 Estado de Pago: ${estadoPagoTexto[pedido.estadoPago]}\n`;
    detalles += `💳 Método de Pago: ${pedido.metodoPago}\n\n`;
    detalles += `───────────────────────────────────────────────\n`;
    detalles += `👤 DATOS DEL CLIENTE:\n`;
    detalles += `───────────────────────────────────────────────\n`;
    detalles += `Nombre: ${pedido.datosEnvio.nombre}\n`;
    detalles += `Dirección: ${pedido.datosEnvio.direccion}\n`;
    detalles += `Teléfono: ${pedido.datosEnvio.telefono}\n`;
    detalles += `Ubicación: ${pedido.datosEnvio.ubicacion}\n\n`;
    detalles += `───────────────────────────────────────────────\n`;
    detalles += `🛍️ PRODUCTOS:\n`;
    detalles += `───────────────────────────────────────────────\n`;
    
    pedido.items.forEach((item, i) => {
        const precio = typeof item.precio === 'number' ? item.precio : parseFloat(item.precio.replace(' Bs', ''));
        const subtotal = precio * item.cantidad;
        detalles += `\n${i + 1}. ${item.nombre}\n`;
        detalles += `   • Talla: ${item.talla}\n`;
        detalles += `   • Cantidad: ${item.cantidad}\n`;
        detalles += `   • Precio Unitario: ${precio.toFixed(2)} Bs\n`;
        detalles += `   • Subtotal: ${subtotal.toFixed(2)} Bs\n`;
    });
    
    detalles += `\n═══════════════════════════════════════════════\n`;
    detalles += `💰 TOTAL A PAGAR: ${pedido.total.toFixed(2)} Bs\n`;
    detalles += `═══════════════════════════════════════════════`;
    
    alert(detalles);
}

// === EXPORTAR BASE DE DATOS COMPLETA ===
function exportarBaseDatos() {
    const productos = JSON.parse(localStorage.getItem('productos_db')) || [];
    const fecha = new Date().toISOString().split('T')[0];
    
    let contenido = `═══════════════════════════════════════════════════════════\n`;
    contenido += `           FASHION LAB - BASE DE DATOS\n`;
    contenido += `           Fecha: ${fecha}\n`;
    contenido += `═══════════════════════════════════════════════════════════\n\n`;
    contenido += `Total de Productos: ${productos.length}\n`;
    contenido += `Productos Activos: ${productos.filter(p => p.habilitado).length}\n`;
    contenido += `Productos Ocultos: ${productos.filter(p => !p.habilitado).length}\n\n`;
    contenido += `═══════════════════════════════════════════════════════════\n`;
    contenido += `                    LISTA DE PRODUCTOS\n`;
    contenido += `═══════════════════════════════════════════════════════════\n\n`;
    
    productos.forEach((prod, index) => {
        contenido += `【 PRODUCTO #${index + 1} 】\n`;
        contenido += `───────────────────────────────────────────────────────────\n`;
        contenido += `ID:          ${prod.id}\n`;
        contenido += `Nombre:      ${prod.nombre}\n`;
        contenido += `Descripción: ${prod.descripcion}\n`;
        contenido += `Precio:      ${prod.precio} Bs\n`;
        contenido += `Stock:       ${prod.stock} unidades\n`;
        contenido += `Categoría:   ${prod.categoria}\n`;
        contenido += `Estado:      ${prod.habilitado ? 'ACTIVO (Visible en tienda)' : 'INACTIVO (Oculto)'}\n`;
        contenido += `Imagen:      ${prod.imagen}\n`;
        contenido += `Fecha Creación: ${prod.fechaCreacion ? new Date(prod.fechaCreacion).toLocaleString('es-BO') : 'N/A'}\n`;
        contenido += `───────────────────────────────────────────────────────────\n\n`;
    });
    
    contenido += `═══════════════════════════════════════════════════════════\n`;
    contenido += `                    RESUMEN DE STOCK\n`;
    contenido += `═══════════════════════════════════════════════════════════\n\n`;
    
    const stockTotal = productos.reduce((sum, p) => sum + p.stock, 0);
    const agotados = productos.filter(p => p.stock === 0).length;
    const stockBajo = productos.filter(p => p.stock > 0 && p.stock <= 5).length;
    
    contenido += `Stock Total:           ${stockTotal} unidades\n`;
    contenido += `Productos Agotados:    ${agotados}\n`;
    contenido += `Stock Bajo (≤5):       ${stockBajo}\n\n`;
    
    contenido += `═══════════════════════════════════════════════════════════\n`;
    contenido += `           FIN DE LA BASE DE DATOS\n`;
    contenido += `═══════════════════════════════════════════════════════════\n`;
    
    descargarArchivo(contenido, `FashionLab_BaseDatos_${fecha}.txt`);
}

// === EXPORTAR SOLO PRODUCTOS ===
function exportarProductos() {
    const productos = JSON.parse(localStorage.getItem('productos_db')) || [];
    const fecha = new Date().toISOString().split('T')[0];
    
    let contenido = `FASHION LAB - LISTA DE PRODUCTOS\n`;
    contenido += `Fecha: ${fecha}\n`;
    contenido += `Total: ${productos.length} productos\n\n`;
    contenido += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    productos.forEach((prod, index) => {
        const stockStatus = prod.stock === 0 ? '❌ AGOTADO' : prod.stock <= 5 ? '⚠️ BAJO' : '✅ OK';
        const estadoTienda = prod.habilitado ? '👁️ VISIBLE' : '🔒 OCULTO';
        contenido += `${index + 1}. ${prod.nombre}\n`;
        contenido += `   Precio: ${prod.precio} Bs | Stock: ${prod.stock} ${stockStatus}\n`;
        contenido += `   Categoría: ${prod.categoria} | Estado: ${estadoTienda}\n`;
        contenido += `   ID: ${prod.id}\n\n`;
    });
    
    descargarArchivo(contenido, `FashionLab_Productos_${fecha}.txt`);
}

// === EXPORTAR PEDIDOS ===
function exportarPedidos() {
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const fecha = new Date().toISOString().split('T')[0];
    
    let contenido = `FASHION LAB - REGISTRO DE PEDIDOS\n`;
    contenido += `Fecha: ${fecha}\n`;
    contenido += `Total: ${pedidos.length} pedidos\n\n`;
    contenido += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    pedidos.forEach((pedido, index) => {
        const estadoPagoTexto = {
            'pendiente': 'PAGO PENDIENTE',
            'verificado': 'PAGO VERIFICADO',
            'realizado': 'PAGO REALIZADO'
        };
        
        contenido += `【 PEDIDO #${index + 1} 】\n`;
        contenido += `Código: ${pedido.codigo}\n`;
        contenido += `Cliente: ${pedido.datosEnvio.nombre}\n`;
        contenido += `Teléfono: ${pedido.datosEnvio.telefono}\n`;
        contenido += `Dirección: ${pedido.datosEnvio.direccion}\n`;
        contenido += `Método de Pago: ${pedido.metodoPago}\n`;
        contenido += `Estado de Pago: ${estadoPagoTexto[pedido.estadoPago]}\n`;
        contenido += `Total: ${pedido.total.toFixed(2)} Bs\n`;
        contenido += `Estado: ${pedido.estado.toUpperCase()}\n`;
        contenido += `Fecha: ${new Date(pedido.fecha).toLocaleString('es-BO')}\n`;
        contenido += `\nProductos:\n`;
        
        pedido.items.forEach(item => {
            contenido += `  - ${item.nombre} (Talla: ${item.talla}, Cant: ${item.cantidad})\n`;
        });
        
        contenido += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    });
    
    descargarArchivo(contenido, `FashionLab_Pedidos_${fecha}.txt`);
}

// === FUNCIÓN PARA DESCARGAR ARCHIVO ===
function descargarArchivo(contenido, nombreArchivo) {
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert(`✅ Archivo "${nombreArchivo}" descargado exitosamente`);
}

// === CERRAR SESIÓN ===
function cerrarSesion() {
    if (confirm('¿Seguro que deseas cerrar sesión?')) {
        localStorage.removeItem('usuario');
        window.location.href = 'login.html';
    }
}

// Estilos adicionales
const style = document.createElement('style');
style.textContent = `
    .status-select {
        padding: 8px 12px;
        border: 2px solid #ddd;
        border-radius: 8px;
        font-size: 0.9rem;
        cursor: pointer;
        background: white;
        font-weight: 600;
    }
    
    .status-select:focus {
        outline: none;
        border-color: #e63946;
    }
`;
document.head.appendChild(style);
