const PRODUCTOS_CLAVE = "PRODUCTOS";

const NOMBRE_PRODUCTO_INPUT = document.getElementById('nombre-producto');
const PRECIO_PRODUCTO_INPUT = document.getElementById('precio-producto');
const BOTON_GUARDAR_PRODUCTO = document.getElementById('guardar-producto');
const LISTA_PRODUCTOS = document.getElementById('lista-productos');
const PRODUCTOS_SELECCIONADOS = document.getElementById('productos-seleccionados');
const BOTON_CALCULAR_COSTO = document.getElementById('calcular-costo');
const COSTO_TOTAL = document.getElementById('costo-total');
const MENSAJE = document.getElementById('mensaje');
const COSTO_TOTAL_MODAL = document.getElementById('costoTotalModal');
const COSTO_TOTAL_MENSAJE = document.getElementById('costoTotalMensaje');
const MODAL_CLOSE = document.getElementsByClassName('close')[0];

const obtenerDatos = (clave) => {
    const datosJSON = localStorage.getItem(clave);
    return datosJSON ? JSON.parse(datosJSON) : [];
};

const guardarDatos = (clave, datos) => {
    localStorage.setItem(clave, JSON.stringify(datos));
};

const mostrarMensaje = (texto, tipo = 'error') => {
    MENSAJE.textContent = texto;
    MENSAJE.style.color = tipo === 'error' ? 'red' : 'green';
    MENSAJE.style.display = 'block';
    setTimeout(() => {
        MENSAJE.style.display = 'none';
    }, 3000);
};

const renderizarProductos = () => {
    LISTA_PRODUCTOS.innerHTML = '';
    const productos = obtenerDatos(PRODUCTOS_CLAVE);
    productos.forEach(producto => {
        const productoElemento = document.createElement('div');
        productoElemento.className = 'list-group-item';
        productoElemento.innerHTML = `Producto: ${producto.nombre} - Precio: $${producto.precio} <button class="eliminar-producto">&times;</button>`;
        LISTA_PRODUCTOS.appendChild(productoElemento);

        productoElemento.addEventListener('click', () => {
            agregarProductoSeleccionado(producto);
        });

        const botonEliminar = productoElemento.querySelector('.eliminar-producto');
        botonEliminar.addEventListener('click', (e) => {
            e.stopPropagation();
            eliminarProducto(producto.nombre);
        });
    });
};

const agregarProductoSeleccionado = (producto) => {
    const productoExistente = Array.from(PRODUCTOS_SELECCIONADOS.children).find(item => item.dataset.nombre === producto.nombre);

    if (productoExistente) {
        const cantidadElemento = productoExistente.querySelector('.cantidad');
        let cantidad = parseInt(cantidadElemento.textContent);
        cantidad++;
        cantidadElemento.textContent = cantidad;
    } else {
        const productoSeleccionado = document.createElement('div');
        productoSeleccionado.className = 'list-group-item';
        productoSeleccionado.dataset.nombre = producto.nombre;
        productoSeleccionado.innerHTML = `Producto: ${producto.nombre} - Precio: $${producto.precio} - Cantidad: <span class="cantidad">1</span> <button class="eliminar-seleccionado">&times;</button>`;
        PRODUCTOS_SELECCIONADOS.appendChild(productoSeleccionado);

        const botonEliminarSeleccionado = productoSeleccionado.querySelector('.eliminar-seleccionado');
        botonEliminarSeleccionado.addEventListener('click', (e) => {
            e.stopPropagation();
            productoSeleccionado.remove();
        });
    }
};

const eliminarProducto = (nombre) => {
    let productos = obtenerDatos(PRODUCTOS_CLAVE);
    productos = productos.filter(producto => producto.nombre !== nombre);
    guardarDatos(PRODUCTOS_CLAVE, productos);
    renderizarProductos();
};

const cargarDatosDesdeJSON = async () => {
    try {
        const respuesta = await fetch('data/productos.json');
        if (!respuesta.ok) {
            throw new Error('Error al cargar los productos');
        }
        const productos = await respuesta.json();
        guardarDatos(PRODUCTOS_CLAVE, productos);
        renderizarProductos();
        mostrarMensaje('Productos cargados correctamente', 'success');
    } catch (error) {
        mostrarMensaje('Error al cargar los productos');
    }
};

BOTON_GUARDAR_PRODUCTO.addEventListener('click', () => {
    const nombreProducto = NOMBRE_PRODUCTO_INPUT.value.trim();
    const precioProducto = parseFloat(PRECIO_PRODUCTO_INPUT.value);
    if (nombreProducto && !isNaN(precioProducto) && precioProducto > 0) {
        const productos = obtenerDatos(PRODUCTOS_CLAVE);
        productos.push({ nombre: nombreProducto, precio: precioProducto });
        guardarDatos(PRODUCTOS_CLAVE, productos);
        NOMBRE_PRODUCTO_INPUT.value = '';
        PRECIO_PRODUCTO_INPUT.value = '';
        renderizarProductos();
        mostrarMensaje('Producto guardado correctamente', 'success');
    } else {
        mostrarMensaje('Por favor, ingrese un nombre y un precio válido');
    }
});

BOTON_CALCULAR_COSTO.addEventListener('click', () => {
    let costoTotal = 0;
    PRODUCTOS_SELECCIONADOS.childNodes.forEach(producto => {
        const cantidad = parseInt(producto.querySelector('.cantidad').textContent);
        const precioTexto = producto.textContent.split('- Precio: $')[1].split(' -')[0];
        const precio = parseFloat(precioTexto);
        costoTotal += precio * cantidad;
    });
    COSTO_TOTAL.textContent = `Costo Total: $${costoTotal}`;
    COSTO_TOTAL_MENSAJE.textContent = `El costo total de los productos seleccionados es: $${costoTotal}`;
    COSTO_TOTAL_MODAL.style.display = 'block';
});

MODAL_CLOSE.addEventListener('click', () => {
    COSTO_TOTAL_MODAL.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === COSTO_TOTAL_MODAL) {
        COSTO_TOTAL_MODAL.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosDesdeJSON();
});
