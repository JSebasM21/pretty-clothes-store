// === PRODUCTOS INICIALES CON STOCK ===
const productosIniciales = [
    { id: 'p1', nombre: 'Vestido Floral Verano', descripcion: 'Vestido ligero con estampado floral, perfecto para el verano.', precio: 250, imagen: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800', categoria: 'mujer', stock: 15, habilitado: true },
    { id: 'p2', nombre: 'Blusa Elegante', descripcion: 'Blusa de seda con diseño elegante para ocasiones especiales.', precio: 180, imagen: 'https://images.unsplash.com/photo-1564257577802-99e47c825881?q=80&w=800', categoria: 'mujer', stock: 20, habilitado: true },
    { id: 'p3', nombre: 'Jean Skinny Azul', descripcion: 'Jean ajustado de mezclilla premium con acabado suave.', precio: 320, imagen: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800', categoria: 'mujer', stock: 10, habilitado: true },
    { id: 'p4', nombre: 'Camisa Casual Oxford', descripcion: 'Camisa de algodón tipo Oxford, ideal para trabajo y eventos.', precio: 200, imagen: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800', categoria: 'hombre', stock: 25, habilitado: true },
    { id: 'p5', nombre: 'Pantalón Chino Beige', descripcion: 'Pantalón chino clásico, cómodo y versátil.', precio: 280, imagen: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800', categoria: 'hombre', stock: 18, habilitado: true },
    { id: 'p6', nombre: 'Polo Deportivo', descripcion: 'Polo con tecnología Dry-Fit para mayor comodidad.', precio: 150, imagen: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=800', categoria: 'hombre', stock: 30, habilitado: true },
    { id: 'p7', nombre: 'Conjunto Deportivo Infantil', descripcion: 'Set de sudadera y pantalón para niños de 4-12 años.', precio: 180, imagen: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?q=80&w=800', categoria: 'ninos', stock: 12, habilitado: true },
    { id: 'p8', nombre: 'Vestido Princesa', descripcion: 'Hermoso vestido con diseño de princesa para niñas.', precio: 220, imagen: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=800', categoria: 'ninos', stock: 8, habilitado: true },
    { id: 'p9', nombre: 'Bolso de Cuero', descripcion: 'Bolso de cuero genuino con múltiples compartimentos.', precio: 380, imagen: 'https://images.unsplash.com/photo-1564422170194-896b89110ef8?q=80&w=800', categoria: 'accesorios', stock: 5, habilitado: true },
    { id: 'p10', nombre: 'Gafas de Sol Premium', descripcion: 'Gafas con protección UV400 y diseño moderno.', precio: 120, imagen: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800', categoria: 'accesorios', stock: 22, habilitado: true },
    { id: 'p11', nombre: 'Chaqueta Denim Vintage', descripcion: 'Chaqueta de jean con estilo retro. ¡50% OFF!', precio: 150, imagen: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800', categoria: 'ofertas mujer', stock: 6, habilitado: true },
    { id: 'p12', nombre: 'Zapatillas Deportivas', descripcion: 'Zapatillas running con tecnología de amortiguación.', precio: 280, imagen: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800', categoria: 'ofertas hombre', stock: 0, habilitado: true }
];

// === ESTADO GLOBAL ===
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let productoActual = null;
let modalQuantity = 1;
let pedidoActual = null;
let datosEnvio = null;
let metodoPago = null;

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
    inicializarBaseDatos();
    cargarProductos();
    verificarUsuario();
    actualizarInterfazCarrito();
});

// === INICIALIZAR BASE DE DATOS ===
function inicializarBaseDatos() {
    if (!localStorage.getItem('productos_db')) {
        localStorage.setItem('productos_db', JSON.stringify(productosIniciales));
    }
}

// === CARGAR PRODUCTOS DINÁMICAMENTE ===
function cargarProductos() {
    const productos = JSON.parse(localStorage.getItem('productos_db')) || [];
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    productos.forEach(prod => {
        // No mostrar productos deshabilitados
        if (!prod.habilitado) return;
        
        const stockClass = prod.stock === 0 ? 'sin-stock' : prod.stock <= 5 ? 'stock-bajo' : '';
        const categorias = prod.categoria.split(' ').join(' ');
        
        const article = document.createElement('article');
        article.className = `product-card ${categorias} show ${stockClass}`;
        article.setAttribute('data-id', prod.id);
        article.onclick = () => openModal(prod);
        
        article.innerHTML = `
            <div class="product-title-bar"><h3>${prod.nombre}</h3></div>
            <div class="product-image-container">
                <img src="${prod.imagen}" alt="${prod.nombre}">
                ${prod.stock === 0 ? '<div class="agotado-badge">AGOTADO</div>' : ''}
                ${prod.stock > 0 && prod.stock <= 5 ? '<div class="ultimas-badge">¡ÚLTIMAS UNIDADES!</div>' : ''}
                ${prod.categoria.includes('ofertas') && prod.stock > 0 ? '<div class="discount-badge">-50%</div>' : ''}
            </div>
            <div class="product-ingredients-bar">
                <p>Stock disponible: ${prod.stock} unidades</p>
                <p><b>${prod.precio} Bs</b></p>
            </div>
        `;
        
        grid.appendChild(article);
    });
}

// === VERIFICACIÓN DE USUARIO ===
function verificarUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const authLink = document.getElementById('auth-link');
    const adminLink = document.getElementById('admin-link');
    
    if (usuario) {
        if (authLink) authLink.textContent = `👤 ${usuario.nombre}`;
        if (usuario.esAdmin && adminLink) {
            adminLink.style.display = 'block';
        }
    }
}

// === MODAL DE PRODUCTO ===
function openModal(producto) {
    if (producto.stock === 0) {
        alert('❌ Lo sentimos, este producto está agotado');
        return;
    }
    
    const modal = document.getElementById('modal-overlay');
    document.getElementById('modal-title').innerText = producto.nombre;
    document.getElementById('modal-description').innerText = producto.descripcion;
    document.getElementById('modal-img').src = producto.imagen;
    document.getElementById('modal-price').innerText = producto.precio + ' Bs';
    
    const stockBadge = document.getElementById('stock-badge');
    stockBadge.textContent = `Stock: ${producto.stock}`;
    stockBadge.className = 'stock-badge ' + (producto.stock <= 5 ? 'stock-bajo' : 'stock-ok');
    
    if (producto.stock <= 5) {
        document.getElementById('stock-warning').style.display = 'block';
        document.getElementById('stock-remaining').textContent = producto.stock;
    } else {
        document.getElementById('stock-warning').style.display = 'none';
    }
    
    productoActual = producto;
    modalQuantity = 1;
    document.getElementById('modal-quantity').innerText = modalQuantity;
    
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    productoActual = null;
    modalQuantity = 1;
}

function changeModalQuantity(change) {
    const nuevoValor = modalQuantity + change;
    if (nuevoValor < 1 || nuevoValor > productoActual.stock) {
        if (nuevoValor > productoActual.stock) {
            alert(`⚠️ Solo hay ${productoActual.stock} unidades disponibles`);
        }
        return;
    }
    modalQuantity = nuevoValor;
    document.getElementById('modal-quantity').innerText = modalQuantity;
}

// === CARRITO ===
function toggleCart() {
    document.getElementById('cart-drawer').classList.toggle('active');
}

document.getElementById('btn-add-to-cart').addEventListener('click', () => {
    if (productoActual) {
        const talla = document.getElementById('size-select').value;
        
        const productos = JSON.parse(localStorage.getItem('productos_db'));
        const prod = productos.find(p => p.id === productoActual.id);
        
        if (!prod || prod.stock < modalQuantity) {
            alert('❌ No hay suficiente stock disponible');
            return;
        }
        
        const itemExistente = carrito.find(
            item => item.id === productoActual.id && item.talla === talla
        );

        if (itemExistente) {
            const totalCantidad = itemExistente.cantidad + modalQuantity;
            if (totalCantidad > prod.stock) {
                alert(`⚠️ Solo puedes agregar ${prod.stock - itemExistente.cantidad} unidades más`);
                return;
            }
            itemExistente.cantidad += modalQuantity;
        } else {
            carrito.push({ 
                ...productoActual,
                talla, 
                cantidad: modalQuantity 
            });
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarInterfazCarrito();
        closeModal();
        
        if (!document.getElementById('cart-drawer').classList.contains('active')) {
            toggleCart();
        }
    }
});

function actualizarInterfazCarrito() {
    const container = document.getElementById('cart-items-container');
    const countBadge = document.getElementById('cart-count');
    const totalDisplay = document.getElementById('cart-total-amount');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (carrito.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888; margin-top:40px;">Tu carrito está vacío...</p>';
        countBadge.innerText = '0';
        totalDisplay.innerText = '0 Bs';
        return;
    }

    let totalGlobal = 0;
    let unidadesTotales = 0;

    carrito.forEach((item, index) => {
        const precioNum = typeof item.precio === 'number' ? item.precio : parseFloat(item.precio.replace(' Bs', ''));
        const subtotal = precioNum * item.cantidad;
        totalGlobal += subtotal;
        unidadesTotales += item.cantidad;

        container.innerHTML += `
            <div class="cart-item">
                <img src="${item.imagen}" alt="${item.nombre}">
                <div class="cart-item-info">
                    <h4>${item.nombre}</h4>
                    <p style="font-size:0.85rem; color:#666;">Talla: ${item.talla}</p>
                    <div class="quantity-controls">
                        <button onclick="cambiarCantidad(${index}, -1)">-</button>
                        <span>${item.cantidad}</span>
                        <button onclick="cambiarCantidad(${index}, 1)">+</button>
                    </div>
                    <button class="btn-eliminar-item" onclick="eliminarProducto(${index})">
                        Eliminar
                    </button>
                </div>
                <div class="item-subtotal">${subtotal.toFixed(2)} Bs</div>
            </div>
        `;
    });

    countBadge.innerText = unidadesTotales;
    totalDisplay.innerText = `${totalGlobal.toFixed(2)} Bs`;
}

function cambiarCantidad(index, cambio) {
    const item = carrito[index];
    const productos = JSON.parse(localStorage.getItem('productos_db'));
    const prod = productos.find(p => p.id === item.id);
    
    const nuevaCantidad = item.cantidad + cambio;
    
    if (nuevaCantidad < 1) {
        eliminarProducto(index);
        return;
    }
    
    if (nuevaCantidad > prod.stock) {
        alert(`⚠️ Solo hay ${prod.stock} unidades disponibles`);
        return;
    }
    
    carrito[index].cantidad = nuevaCantidad;
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarInterfazCarrito();
}

function eliminarProducto(index) {
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarInterfazCarrito();
}

// === FORMULARIO DE ENVÍO ===
function mostrarFormularioEnvio() {
    if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
    }
    document.getElementById('envio-modal').style.display = 'flex';
    toggleCart();
}

function cerrarFormularioEnvio() {
    document.getElementById('envio-modal').style.display = 'none';
}

document.getElementById('envio-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    datosEnvio = {
        nombre: document.getElementById('envio-nombre').value,
        direccion: document.getElementById('envio-direccion').value,
        telefono: document.getElementById('envio-telefono').value,
        ubicacion: document.getElementById('envio-ubicacion').value || 'No proporcionado'
    };
    
    metodoPago = document.getElementById('metodo-pago').value;
    
    if (!metodoPago) {
        alert('⚠️ Por favor selecciona un método de pago');
        return;
    }
    
    cerrarFormularioEnvio();
    
    if (metodoPago === 'qr') {
        procesarPagoQR();
    } else {
        procesarPagoEfectivo();
    }
});

// === PAGO CON QR ===
function procesarPagoQR() {
    let total = 0;
    carrito.forEach(item => {
        const precioNum = typeof item.precio === 'number' ? item.precio : parseFloat(item.precio.replace(' Bs', ''));
        total += precioNum * item.cantidad;
    });

    const codigoPedido = 'FL' + Date.now().toString().slice(-8);
    
    pedidoActual = {
        codigo: codigoPedido,
        items: [...carrito],
        total: total,
        datosEnvio: datosEnvio,
        metodoPago: 'QR',
        fecha: new Date().toISOString(),
        estado: 'pendiente_pago',
        estadoPago: 'pendiente'
    };

    mostrarQR(total, codigoPedido);
}

function mostrarQR(monto, codigoPedido) {
    const qrModal = document.getElementById('qr-modal');
    const qrContainer = document.getElementById('qr-container');
    const qrAmount = document.getElementById('qr-amount');
    
    qrContainer.innerHTML = '';
    qrAmount.textContent = `Total a pagar: ${monto.toFixed(2)} Bs`;
    
    const qrData = `FASHION_LAB|PEDIDO:${codigoPedido}|MONTO:${monto.toFixed(2)}Bs|METODO:QR`;
    
    new QRCode(qrContainer, {
        text: qrData,
        width: 250,
        height: 250,
        colorDark: "#000000",
        colorLight: "#ffffff",
    });
    
    qrModal.style.display = 'flex';
}

function closeQRModal() {
    document.getElementById('qr-modal').style.display = 'none';
}

// === PAGO EN EFECTIVO ===
function procesarPagoEfectivo() {
    let total = 0;
    carrito.forEach(item => {
        const precioNum = typeof item.precio === 'number' ? item.precio : parseFloat(item.precio.replace(' Bs', ''));
        total += precioNum * item.cantidad;
    });

    const codigoPedido = 'FL' + Date.now().toString().slice(-8);
    
    pedidoActual = {
        codigo: codigoPedido,
        items: [...carrito],
        total: total,
        datosEnvio: datosEnvio,
        metodoPago: 'Efectivo',
        fecha: new Date().toISOString(),
        estado: 'preparando',
        estadoPago: 'pendiente'
    };
    
    finalizarPedido();
}

// === SIMULAR PAGO QR ===
function simularPago() {
    if (!pedidoActual) return;
    
    const verificando = document.createElement('div');
    verificando.innerHTML = '<p style="text-align:center; margin:20px;">🔄 Verificando pago...</p>';
    document.getElementById('qr-container').appendChild(verificando);
    
    setTimeout(() => {
        pedidoActual.estado = 'preparando';
        pedidoActual.estadoPago = 'verificado';
        pedidoActual.fechaPago = new Date().toISOString();
        
        closeQRModal();
        finalizarPedido();
    }, 3000);
}

// === FINALIZAR PEDIDO ===
function finalizarPedido() {
    // Actualizar stock
    const productos = JSON.parse(localStorage.getItem('productos_db'));
    pedidoActual.items.forEach(item => {
        const prod = productos.find(p => p.id === item.id);
        if (prod) {
            prod.stock -= item.cantidad;
        }
    });
    localStorage.setItem('productos_db', JSON.stringify(productos));
    
    // Guardar pedido
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    
    // Asociar pedido al usuario si está logueado
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario) {
        pedidoActual.usuarioEmail = usuario.email;
    }
    
    pedidos.push(pedidoActual);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    
    generarFactura(pedidoActual);
    
    // Limpiar carrito
    carrito = [];
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarInterfazCarrito();
    cargarProductos();
    
    // Mostrar modal de éxito
    mostrarModalExito(pedidoActual.codigo);
    
    pedidoActual = null;
    datosEnvio = null;
    metodoPago = null;
}

// === MODAL DE ÉXITO ===
function mostrarModalExito(codigo) {
    document.getElementById('codigo-pedido-display').textContent = codigo;
    document.getElementById('success-modal').style.display = 'flex';
}

function cerrarModalExito() {
    document.getElementById('success-modal').style.display = 'none';
}

function copiarCodigo() {
    const codigo = document.getElementById('codigo-pedido-display').textContent;
    navigator.clipboard.writeText(codigo).then(() => {
        alert('✅ Código copiado al portapapeles');
    });
}

// === FACTURA ===
function generarFactura(pedido) {
    let factura = `
=================================
   pretty clothes store
    Bloque McDonald's B
    Feria Barrio Lindo
    Santa Cruz, Bolivia
=================================

FACTURA
Código: ${pedido.codigo}
Fecha: ${new Date(pedido.fecha).toLocaleString('es-BO')}

DATOS DE ENVÍO:
Nombre: ${pedido.datosEnvio.nombre}
Dirección: ${pedido.datosEnvio.direccion}
Teléfono: ${pedido.datosEnvio.telefono}
Ubicación: ${pedido.datosEnvio.ubicacion}

MÉTODO DE PAGO: ${pedido.metodoPago}
ESTADO DE PAGO: ${pedido.estadoPago === 'pendiente' ? 'PENDIENTE' : 'VERIFICADO'}

---------------------------------
PRODUCTOS:
`;

    pedido.items.forEach(item => {
        const precio = typeof item.precio === 'number' ? item.precio : parseFloat(item.precio.replace(' Bs', ''));
        const subtotal = precio * item.cantidad;
        factura += `
${item.nombre}
Talla: ${item.talla}
Cantidad: ${item.cantidad} x ${precio.toFixed(2)} Bs
Subtotal: ${subtotal.toFixed(2)} Bs
`;
    });

    factura += `
---------------------------------
TOTAL: ${pedido.total.toFixed(2)} Bs
=================================

Estado del pedido: ${pedido.estado.toUpperCase()}

Gracias por tu compra!
`;

    const facturas = JSON.parse(localStorage.getItem('facturas')) || {};
    facturas[pedido.codigo] = factura;
    localStorage.setItem('facturas', JSON.stringify(facturas));
}

// === FILTROS ===
function filterMenu(category) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    const items = document.querySelectorAll('.product-card');
    items.forEach(item => {
        const match = category === 'all' || item.classList.contains(category);
        if (match) {
            item.classList.remove('hidden');
            item.classList.add('show');
        } else {
            item.classList.remove('show');
            item.classList.add('hidden');
        }
    });
    
    // Scroll a productos
    if (category !== 'all') {
        document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
    }
}

// === MENÚ HAMBURGUESA ===
const hamburger = document.getElementById('hamburger-btn');
const navMenu = document.getElementById('nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

document.querySelectorAll('.nav-main-links a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});
function mostrarAlerta({titulo, mensaje, tipo = "success", onOk, onCancel}) {
  const overlay = document.createElement("div");
  overlay.className = "custom-alert-overlay";

  overlay.innerHTML = `
    <div class="custom-alert ${tipo}">
      <h3>${titulo}</h3>
      <p>${mensaje}</p>
      <div class="alert-buttons">
        <button class="btn-ok">Aceptar</button>
        ${onCancel ? `<button class="btn-cancel">Cancelar</button>` : ``}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector(".btn-ok").onclick = () => {
    overlay.remove();
    if(onOk) onOk();
  };

  if(onCancel){
    overlay.querySelector(".btn-cancel").onclick = () => {
      overlay.remove();
      onCancel();
    };
  }
}
/* ===============================
   PERFIL DE USUARIO
   =============================== */

function verificarUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    const authLink = document.getElementById('auth-link');
    const userMenu = document.getElementById('user-menu');
    const userBtn = document.getElementById('user-btn');
    const userDropdown = document.getElementById('user-dropdown');

    if (!authLink || !userMenu) return;

    if (usuario) {
        authLink.style.display = 'none';
        userMenu.style.display = 'block';

        userBtn.textContent = `👤 ${usuario.nombre}`;
        document.getElementById('user-name').textContent = usuario.nombre;
        document.getElementById('user-email').textContent = usuario.email;
        document.getElementById('user-role').textContent =
            usuario.esAdmin ? '👑 Administrador' : '🛍️ Cliente';

        userBtn.onclick = () => {
            userDropdown.style.display =
                userDropdown.style.display === 'block' ? 'none' : 'block';
        };

        document.addEventListener('click', (e) => {
            if (!userMenu.contains(e.target)) {
                userDropdown.style.display = 'none';
            }
        });

        if (usuario.esAdmin) {
            const adminLink = document.getElementById('admin-link');
            if (adminLink) adminLink.style.display = 'block';
        }
    }
}


function cerrarSesion() {
    if (confirm('¿Seguro que deseas cerrar sesión?')) {
        localStorage.removeItem('usuario');
        window.location.href = 'login.html';
    }
}

/* Ejecutar al cargar */
document.addEventListener('DOMContentLoaded', verificarUsuario);
