// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
    verificarUsuarioYMostrarHistorial();
});

// === BUSCAR PEDIDO ===
document.getElementById('tracking-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const codigo = document.getElementById('codigo-pedido').value.toUpperCase().trim();
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    
    const pedido = pedidos.find(p => p.codigo === codigo);
    
    if (!pedido) {
        mostrarError('❌ No se encontró ningún pedido con ese código');
        return;
    }
    
    mostrarResultado(pedido);
});

// === MOSTRAR RESULTADO ===
function mostrarResultado(pedido) {
    const resultDiv = document.getElementById('tracking-result');
    
    const estadoInfo = {
        'pendiente_pago': {
            emoji: '⏳',
            titulo: 'Pendiente de Pago',
            descripcion: 'Esperando confirmación del pago',
            color: '#ffc107'
        },
        'preparando': {
            emoji: '👕',
            titulo: 'Preparando tu Pedido',
            descripcion: 'Tu pedido está siendo preparado con cuidado',
            color: '#2196F3'
        },
        'enviado': {
            emoji: '🚚',
            titulo: 'En Camino',
            descripcion: 'Tu pedido está en camino a tu dirección',
            color: '#ff9800'
        },
        'entregado': {
            emoji: '✅',
            titulo: 'Entregado',
            descripcion: '¡Tu pedido ha sido entregado exitosamente!',
            color: '#4CAF50'
        }
    };
    
    const estadoPagoInfo = {
        'pendiente': { emoji: '⏳', texto: 'Pago Pendiente', color: '#ff9800' },
        'verificado': { emoji: '✅', texto: 'Pago Verificado', color: '#4CAF50' },
        'realizado': { emoji: '💵', texto: 'Pago Realizado', color: '#2196F3' }
    };
    
    const info = estadoInfo[pedido.estado] || estadoInfo['preparando'];
    const infoPago = estadoPagoInfo[pedido.estadoPago] || estadoPagoInfo['pendiente'];
    
    resultDiv.innerHTML = `
        <div class="tracking-result">
            <div style="text-align:center; margin-bottom:30px;">
                <div style="font-size:4rem; margin-bottom:10px;">${info.emoji}</div>
                <h2 style="color:${info.color}; margin-bottom:10px;">${info.titulo}</h2>
                <p style="color:#666;">${info.descripcion}</p>
            </div>
            
            <div style="background:#f8f9fa; padding:25px; border-radius:15px; margin-bottom:20px;">
                <h3 style="margin-bottom:15px;">📋 Información del Pedido</h3>
                <p><strong>Código:</strong> ${pedido.codigo}</p>
                <p><strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleString('es-BO')}</p>
                <p><strong>Total:</strong> ${pedido.total.toFixed(2)} Bs</p>
                <p><strong>Método de Pago:</strong> ${pedido.metodoPago}</p>
                <p style="margin-top:10px;">
                    <span style="background:${infoPago.color}; color:white; padding:8px 15px; border-radius:20px; font-weight:600; font-size:0.9rem;">
                        ${infoPago.emoji} ${infoPago.texto}
                    </span>
                </p>
            </div>
            
            <div style="background:#f8f9fa; padding:25px; border-radius:15px; margin-bottom:20px;">
                <h3 style="margin-bottom:15px;">📍 Datos de Envío</h3>
                <p><strong>Nombre:</strong> ${pedido.datosEnvio.nombre}</p>
                <p><strong>Dirección:</strong> ${pedido.datosEnvio.direccion}</p>
                <p><strong>Teléfono:</strong> ${pedido.datosEnvio.telefono}</p>
                ${pedido.datosEnvio.ubicacion !== 'No proporcionado' ? `<p><strong>Ubicación:</strong> <a href="${pedido.datosEnvio.ubicacion}" target="_blank">Ver en mapa</a></p>` : ''}
            </div>
            
            <div style="background:#f8f9fa; padding:25px; border-radius:15px; margin-bottom:20px;">
                <h3 style="margin-bottom:15px;">🛍️ Productos</h3>
                ${generarListaProductos(pedido.items)}
            </div>
            
            ${pedido.estadoPago === 'pendiente' && pedido.metodoPago === 'Efectivo' ? `
                <div style="background:#fff3cd; padding:20px; border-radius:10px; border-left:4px solid #ffc107; margin-bottom:20px;">
                    <p style="margin:0; font-size:0.9rem;">
                        <strong>💰 Pago en Efectivo:</strong> El pago se realizará al momento de la entrega. 
                        Ten listo el monto exacto de ${pedido.total.toFixed(2)} Bs.
                    </p>
                </div>
            ` : ''}
            
            <div style="background:#e3f2fd; padding:20px; border-radius:10px; border-left:4px solid #2196F3;">
                <p style="margin:0; font-size:0.9rem;">
                    <strong>💡 Nota:</strong> Si tienes alguna consulta sobre tu pedido, 
                    contáctanos por <a href="https://wa.me/59169078166?text=Hola,%20tengo%20una%20consulta%20sobre%20mi%20pedido%20${pedido.codigo}" target="_blank" style="color:#2196F3; font-weight:600;">WhatsApp</a>
                </p>
            </div>
            
            ${pedido.estado === 'entregado' && pedido.estadoPago === 'realizado' ? `
                <div style="text-align:center; margin-top:20px;">
                    <button onclick="descargarFactura('${pedido.codigo}')" class="btn-checkout" style="max-width:300px;">
                        📄 Descargar Factura
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    
    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// === GENERAR LISTA DE PRODUCTOS ===
function generarListaProductos(items) {
    let html = '<ul style="list-style:none; padding:0;">';
    
    items.forEach(item => {
        const precio = typeof item.precio === 'number' ? item.precio : parseFloat(item.precio.replace(' Bs', ''));
        const subtotal = precio * item.cantidad;
        
        html += `
            <li style="margin-bottom:15px; padding-bottom:15px; border-bottom:1px solid #ddd;">
                <div style="display:flex; gap:15px; align-items:center;">
                    <img src="${item.imagen}" alt="${item.nombre}" style="width:60px; height:60px; object-fit:cover; border-radius:8px;">
                    <div style="flex:1;">
                        <strong>${item.nombre}</strong><br>
                        <span style="color:#666; font-size:0.9rem;">Talla: ${item.talla} | Cantidad: ${item.cantidad}</span>
                    </div>
                    <div style="text-align:right;">
                        <strong style="color:#e63946;">${subtotal.toFixed(2)} Bs</strong>
                    </div>
                </div>
            </li>
        `;
    });
    
    html += '</ul>';
    return html;
}

// === MOSTRAR ERROR ===
function mostrarError(mensaje) {
    const resultDiv = document.getElementById('tracking-result');
    resultDiv.innerHTML = `
        <div style="text-align:center; padding:40px; background:#ffe0e0; border-radius:15px; border:2px solid #ff5252;">
            <div style="font-size:3rem; margin-bottom:15px;">😕</div>
            <h3 style="color:#d32f2f; margin-bottom:10px;">Pedido No Encontrado</h3>
            <p style="color:#666;">${mensaje}</p>
            <p style="margin-top:20px; font-size:0.9rem; color:#666;">
                Verifica que hayas ingresado correctamente el código. <br>
                El formato debe ser: <strong>FL12345678</strong>
            </p>
        </div>
    `;
    resultDiv.style.display = 'block';
}

// === DESCARGAR FACTURA ===
function descargarFactura(codigo) {
    const facturas = JSON.parse(localStorage.getItem('facturas')) || {};
    const factura = facturas[codigo];
    
    if (!factura) {
        alert('❌ No se encontró la factura');
        return;
    }
    
    const blob = new Blob([factura], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Factura_${codigo}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert('✅ Factura descargada exitosamente');
}

// === MOSTRAR HISTORIAL SOLO DEL USUARIO LOGUEADO ===
function verificarUsuarioYMostrarHistorial() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const noUsuarioMsg = document.getElementById('no-usuario-msg');
    
    if (!usuario) {
        if (noUsuarioMsg) noUsuarioMsg.style.display = 'block';
        return;
    }
    
    const todosLosPedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    
    // Filtrar solo los pedidos del usuario actual
    const pedidosUsuario = todosLosPedidos.filter(p => p.usuarioEmail === usuario.email);
    
    if (pedidosUsuario.length === 0) {
        const historialDiv = document.getElementById('historial-pedidos');
        const container = document.getElementById('historial-container');
        container.innerHTML = `
            <div style="text-align:center; padding:40px; background:#f8f9fa; border-radius:15px;">
                <div style="font-size:3rem; margin-bottom:15px;">📦</div>
                <h3 style="color:#666;">Aún no tienes pedidos</h3>
                <p style="color:#999; margin-top:10px;">¡Explora nuestra tienda y realiza tu primera compra!</p>
                <a href="index.html#productos" class="btn-checkout" style="display:inline-block; text-decoration:none; margin-top:20px;">
                    Ver Productos
                </a>
            </div>
        `;
        historialDiv.style.display = 'block';
        return;
    }
    
    const historialDiv = document.getElementById('historial-pedidos');
    const container = document.getElementById('historial-container');
    
    let html = '';
    
    // Ordenar por fecha
    pedidosUsuario.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    pedidosUsuario.forEach(pedido => {
        const estadoInfo = {
            'pendiente_pago': { emoji: '⏳', color: '#ffc107', texto: 'Pendiente de Pago' },
            'preparando': { emoji: '👕', color: '#2196F3', texto: 'Preparando' },
            'enviado': { emoji: '🚚', color: '#ff9800', texto: 'En Camino' },
            'entregado': { emoji: '✅', color: '#4CAF50', texto: 'Entregado' }
        };
        
        const estadoPagoInfo = {
            'pendiente': { emoji: '⏳', color: '#ff9800', texto: 'Pago Pendiente' },
            'verificado': { emoji: '✅', color: '#4CAF50', texto: 'Pago Verificado' },
            'realizado': { emoji: '💵', color: '#2196F3', texto: 'Pago Realizado' }
        };
        
        const info = estadoInfo[pedido.estado] || estadoInfo['preparando'];
        const infoPago = estadoPagoInfo[pedido.estadoPago] || estadoPagoInfo['pendiente'];
        
        html += `
            <div style="background:white; padding:25px; border-radius:15px; margin-bottom:20px; box-shadow:0 2px 15px rgba(0,0,0,0.1); cursor:pointer; transition:transform 0.3s;" 
                 onclick="document.getElementById('codigo-pedido').value='${pedido.codigo}'; document.getElementById('tracking-form').dispatchEvent(new Event('submit')); window.scrollTo({top:0, behavior:'smooth'});"
                 onmouseover="this.style.transform='translateY(-5px)'" 
                 onmouseout="this.style.transform='translateY(0)'">
                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:15px; flex-wrap:wrap; gap:15px;">
                    <div style="flex:1; min-width:200px;">
                        <h3 style="margin:0 0 8px 0; color:#1d3557;">
                            ${info.emoji} ${pedido.codigo}
                        </h3>
                        <p style="margin:0; color:#666; font-size:0.9rem;">
                            📅 ${new Date(pedido.fecha).toLocaleDateString('es-BO', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                        <p style="margin:5px 0 0 0; color:#666; font-size:0.85rem;">
                            💳 ${pedido.metodoPago}
                        </p>
                    </div>
                    <div style="text-align:right;">
                        <span style="display:inline-block; padding:6px 15px; background:${info.color}; color:white; border-radius:20px; font-size:0.85rem; font-weight:600; margin-bottom:8px;">
                            ${info.texto}
                        </span>
                        <br>
                        <span style="display:inline-block; padding:6px 15px; background:${infoPago.color}; color:white; border-radius:20px; font-size:0.85rem; font-weight:600;">
                            ${infoPago.emoji} ${infoPago.texto}
                        </span>
                    </div>
                </div>
                
                <div style="border-top:1px solid #eee; padding-top:15px; margin-top:15px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                        <div>
                            <p style="margin:0; color:#666; font-size:0.9rem;">
                                🛍️ ${pedido.items.length} producto${pedido.items.length !== 1 ? 's' : ''}
                            </p>
                            <p style="margin:5px 0 0 0; color:#999; font-size:0.85rem;">
                                📍 ${pedido.datosEnvio.direccion.substring(0, 50)}${pedido.datosEnvio.direccion.length > 50 ? '...' : ''}
                            </p>
                        </div>
                        <div style="text-align:right;">
                            <p style="margin:0; font-size:1.5rem; font-weight:bold; color:#e63946;">
                                ${pedido.total.toFixed(2)} Bs
                            </p>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top:15px; padding:10px; background:#f8f9fa; border-radius:8px; font-size:0.85rem; color:#666; text-align:center;">
                    👆 Haz clic para ver detalles completos del pedido
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    historialDiv.style.display = 'block';
}

// === AUTO-COMPLETAR SI HAY CÓDIGO EN URL ===
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const codigo = urlParams.get('codigo');
    
    if (codigo) {
        document.getElementById('codigo-pedido').value = codigo;
        document.getElementById('tracking-form').dispatchEvent(new Event('submit'));
    }
});