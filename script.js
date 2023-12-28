let presupuestos = [];
let movimientos = [];

window.onload = function() {
    cargarDatos();
    actualizarInterfaz();
};

function crearPresupuesto() {
    const nombre = document.getElementById('presupuesto-nombre').value;
    const monto = parseFloat(document.getElementById('presupuesto-monto').value);
    const fechaCreacion = new Date().toISOString().split('T')[0];

    presupuestos.push({ nombre, montoOriginal: monto, montoRestante: monto, fechaCreacion });

    guardarDatos();
    actualizarInterfaz();
    resetearCampos();
}

function registrarIngreso() {
    const nombreIngreso = document.getElementById('nombre-ingreso').value;
    const montoMovimiento = parseFloat(document.getElementById('registro-monto-ingreso').value);
    const fecha = new Date().toISOString().split('T')[0];

    if (nombreIngreso === '' || isNaN(montoMovimiento)) {
        alert('Por favor, ingresa un nombre y un monto válido para el ingreso.');
        return;
    }

    movimientos.push({ tipo: 'Ingreso', nombrePresupuesto: nombreIngreso, montoMovimiento, fecha });

    guardarDatos();
    actualizarInterfaz();
    resetearCampos();
}

function registrarGasto() {
    const nombrePresupuesto = document.getElementById('presupuesto-registro-gasto').value;
    const montoMovimiento = parseFloat(document.getElementById('registro-monto-gasto').value);
    const fecha = new Date().toISOString().split('T')[0];

    const presupuesto = presupuestos.find(p => p.nombre === nombrePresupuesto);
    if (presupuesto && montoMovimiento <= presupuesto.montoRestante) {
        presupuesto.montoRestante -= montoMovimiento;
    } else {
        alert("Gasto inválido o excede el monto restante del presupuesto.");
        return;
    }

    movimientos.push({ tipo: 'Gasto', nombrePresupuesto, montoMovimiento, fecha });

    guardarDatos();
    actualizarInterfaz();
    resetearCampos();
}

function resetearCampos() {
    document.getElementById('presupuesto-nombre').value = '';
    document.getElementById('presupuesto-monto').value = '';
    document.getElementById('nombre-ingreso').value = '';
    document.getElementById('registro-monto-ingreso').value = '';
    document.getElementById('presupuesto-registro-gasto').selectedIndex = 0;
    document.getElementById('registro-monto-gasto').value = '';
}

function actualizarInterfaz(mes = null) {
    mostrarPresupuestos(mes);
    mostrarMovimientos(mes);
    actualizarOpcionesPresupuesto();
}

function filtrarPorMes() {
    const mesSeleccionado = document.getElementById('selector-mes').value;
    actualizarInterfaz(mesSeleccionado);
}

function mostrarPresupuestos(mes) {
    const tablaPresupuestos = document.getElementById('tabla-presupuestos').getElementsByTagName('tbody')[0];
    tablaPresupuestos.innerHTML = '';

    let presupuestosFiltrados = presupuestos;
    if (mes !== null && mes !== '') {
        presupuestosFiltrados = presupuestos.filter(presupuesto => new Date(presupuesto.fechaCreacion).getMonth().toString() === mes);
    }

    presupuestosFiltrados.forEach((presupuesto, index) => {
        const fila = tablaPresupuestos.insertRow();
        fila.insertCell(0).textContent = presupuesto.nombre;
        fila.insertCell(1).textContent = `${presupuesto.montoOriginal.toFixed(2)}€`;

        const celdaCantidadRestante = fila.insertCell(2);
        celdaCantidadRestante.textContent = `${presupuesto.montoRestante.toFixed(2)}€`;

        // Color de la celda según la cantidad restante
        if (presupuesto.montoRestante > 100) {
            celdaCantidadRestante.style.backgroundColor = '#CCFFCC';
        } else if (presupuesto.montoRestante >= 50) {
            celdaCantidadRestante.style.backgroundColor = '#FFFFCC';
        } else {
            celdaCantidadRestante.style.backgroundColor = '#FFCCCC';
        }

        fila.insertCell(3).textContent = presupuesto.fechaCreacion;
        const celdaEliminar = fila.insertCell(4);
        celdaEliminar.innerHTML = `<button onclick="eliminarPresupuesto(${index})">Eliminar</button>`;
    });
}

function mostrarMovimientos(mes) {
    const tablaMovimientos = document.getElementById('tabla-gastos').getElementsByTagName('tbody')[0];
    tablaMovimientos.innerHTML = '';

    let movimientosFiltrados = movimientos;
    if (mes !== null && mes !== '') {
        movimientosFiltrados = movimientos.filter(movimiento => new Date(movimiento.fecha).getMonth().toString() === mes);
    }

    movimientosFiltrados.forEach((movimiento, index) => {
        const fila = tablaMovimientos.insertRow();
        fila.className = movimiento.tipo.toLowerCase();
        fila.insertCell(0).textContent = movimiento.tipo;
        fila.insertCell(1).textContent = movimiento.nombrePresupuesto;
        fila.insertCell(2).textContent = `${movimiento.montoMovimiento.toFixed(2)}€`;
        fila.insertCell(3).textContent = movimiento.fecha;

        const celdaEliminar = fila.insertCell(4);
        celdaEliminar.innerHTML = `<button onclick="eliminarMovimiento(${index})">Eliminar</button>`;
    });
}

function eliminarPresupuesto(index) {
    if (confirm('¿Estás seguro de que quieres eliminar este presupuesto?')) {
        presupuestos.splice(index, 1);
        guardarDatos();
        actualizarInterfaz();
    }
}

function eliminarMovimiento(index) {
    if (confirm('¿Estás seguro de que quieres eliminar este movimiento?')) {
        movimientos.splice(index, 1);
        guardarDatos();
        actualizarInterfaz();
    }
}

function guardarDatos() {
    localStorage.setItem('presupuestos', JSON.stringify(presupuestos));
    localStorage.setItem('movimientos', JSON.stringify(movimientos));
}

function cargarDatos() {
    const datosPresupuestos = localStorage.getItem('presupuestos');
    const datosMovimientos = localStorage.getItem('movimientos');

    presupuestos = datosPresupuestos ? JSON.parse(datosPresupuestos) : [];
    movimientos = datosMovimientos ? JSON.parse(datosMovimientos) : [];
}

function actualizarOpcionesPresupuesto() {
    const selectGasto = document.getElementById('presupuesto-registro-gasto');
    selectGasto.innerHTML = '';

    presupuestos.forEach(presupuesto => {
        const option = document.createElement('option');
        option.value = presupuesto.nombre;
        option.textContent = presupuesto.nombre;
        selectGasto.appendChild(option);
    });
}