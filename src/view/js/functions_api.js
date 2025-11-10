// functions_api.js - MODIFICADO para consumir SIRE2

// URL del API de SIRE2 - REEMPLAZA la URL local por SIRE2
const API_URL = API_SIRE2; // Usa la constante definida en la vista

function mostrarResultadosEnTabla(data) {
    const cuerpoTabla = document.getElementById('cuerpoTabla');
    const contadorResultados = document.getElementById('contadorResultados');
    const controlesResultados = document.getElementById('controlesResultados');
    
    if (!data.status || !data.data || data.data.length === 0) {
        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-5">
                    <i class="fas fa-search fa-3x mb-3"></i>
                    <h5>No se encontraron estudiantes en SIRE2</h5>
                    <p class="text-muted">Intente con otros criterios de búsqueda</p>
                </td>
            </tr>
        `;
        contadorResultados.textContent = '0 estudiantes encontrados';
        controlesResultados.style.display = 'none';
        return;
    }

    let html = '';
    data.data.forEach(estudiante => {
        const programa = estudiante.programa_nombre || `Programa ${estudiante.programa_id}`;
        
        html += `
            <tr>
                <td><strong>${estudiante.dni}</strong></td>
                <td>
                    <div class="font-weight-bold">${estudiante.nombre_completo}</div>
                    <small class="text-muted">${estudiante.nombres}</small>
                </td>
                <td>
                    <span class="badge badge-info">${programa}</span>
                    <small class="d-block text-muted">ID: ${estudiante.programa_id}</small>
                </td>
                <td>
                    <span class="badge badge-primary">${estudiante.semestre}° Semestre</span>
                </td>
                <td>
                    <span class="badge ${estudiante.estado === 'activo' ? 'badge-success' : 'badge-warning'}">
                        ${estudiante.estado}
                    </span>
                </td>
                <td>
                    <small class="text-muted">${estudiante.fecha_matricula || 'No registrada'}</small>
                </td>
            </tr>
        `;
    });

    cuerpoTabla.innerHTML = html;
    contadorResultados.textContent = `${data.data.length} estudiante(s) encontrado(s) en SIRE2`;
    controlesResultados.style.display = 'flex';
}

// MODIFICADO: Consume del API de SIRE2
function ejecutarBusqueda() {
    const dni = document.getElementById('dni').value;
    const nombres = document.getElementById('nombres').value;
    const pagina = document.getElementById('pagina').value;
    const limite = document.getElementById('limite').value;

    // Mostrar loading
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('cuerpoTabla').innerHTML = '';

    const formData = new FormData();
    formData.append('dni', dni);
    formData.append('nombres', nombres);
    formData.append('pagina', pagina);
    formData.append('limite', limite);

    // MODIFICADO: Consume de SIRE2 en lugar de local
    fetch(API_URL + '?tipo=buscar_estudiantes', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('loadingSpinner').style.display = 'none';
        
        if (data.status) {
            mostrarResultadosEnTabla(data);
            if (data.paginacion) {
                actualizarPaginacion(data.paginacion);
            }
        } else {
            if (data.error && !data.error.includes('no encontrado')) {
                console.error('Error del servidor SIRE2:', data.error);
            }
            mostrarResultadosEnTabla({status: false});
        }
    })
    .catch(error => {
        document.getElementById('loadingSpinner').style.display = 'none';
        console.error('Error de conexión con SIRE2:', error);
        mostrarResultadosEnTabla({status: false});
    });
}

// MODIFICADO: Consume del API de SIRE2
function buscarPorDNI() {
    const dni = document.getElementById('dni').value;
    
    if (!dni) {
        mostrarResultadosEnTabla({
            status: false,
            data: []
        });
        return;
    }

    // Mostrar loading
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('cuerpoTabla').innerHTML = '';

    const formData = new FormData();
    formData.append('dni', dni);

    // MODIFICADO: Consume de SIRE2 en lugar de local
    fetch(API_URL + '?tipo=buscar_estudiante_dni', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('loadingSpinner').style.display = 'none';
        
        if (data.status) {
            // Mostrar resultado individual en tabla
            mostrarResultadosEnTabla({
                status: true,
                data: [data.data]
            });
            document.getElementById('pagina').value = 1;
            actualizarPaginacion({
                pagina_actual: 1,
                limite: 1,
                total_estudiantes: 1,
                total_paginas: 1
            });
        } else {
            mostrarResultadosEnTabla({status: false});
        }
    })
    .catch(error => {
        document.getElementById('loadingSpinner').style.display = 'none';
        console.error('Error de conexión con SIRE2:', error);
        mostrarResultadosEnTabla({status: false});
    });
}

// Las demás funciones se mantienen igual
function actualizarPaginacion(paginacion) {
    const textoPaginacion = document.getElementById('texto_paginacion_tabla');
    const listaPaginacion = document.getElementById('lista_paginacion_tabla');
    
    if (!paginacion) {
        textoPaginacion.innerHTML = 'Ingrese criterios de búsqueda';
        listaPaginacion.innerHTML = '<li class="page-item disabled"><span class="page-link">-</span></li>';
        return;
    }
    
    const { pagina_actual, limite, total_estudiantes, total_paginas } = paginacion;
    
    // Texto de paginación
    const inicio = ((pagina_actual - 1) * limite) + 1;
    const fin = Math.min(pagina_actual * limite, total_estudiantes);
    
    textoPaginacion.innerHTML = total_estudiantes > 0 
        ? `Mostrando ${inicio} a ${fin} de ${total_estudiantes} registros`
        : 'No hay registros para mostrar';
    
    // Botones de paginación
    let html = '';
    
    if (pagina_actual > 1) {
        html += `<li class="page-item">
                    <a class="page-link" href="javascript:void(0)" onclick="cambiarPagina(${pagina_actual - 1})">Anterior</a>
                 </li>`;
    }
    
    for (let i = 1; i <= total_paginas; i++) {
        if (i === pagina_actual) {
            html += `<li class="page-item active">
                        <span class="page-link">${i}</span>
                     </li>`;
        } else {
            html += `<li class="page-item">
                        <a class="page-link" href="javascript:void(0)" onclick="cambiarPagina(${i})">${i}</a>
                     </li>`;
        }
    }
    
    if (pagina_actual < total_paginas) {
        html += `<li class="page-item">
                    <a class="page-link" href="javascript:void(0)" onclick="cambiarPagina(${pagina_actual + 1})">Siguiente</a>
                 </li>`;
    }
    
    listaPaginacion.innerHTML = html || '<li class="page-item disabled"><span class="page-link">-</span></li>';
}

function cambiarPagina(pagina) {
    document.getElementById('pagina').value = pagina;
    ejecutarBusqueda();
}

function limpiarFiltros() {
    document.getElementById('dni').value = '';
    document.getElementById('nombres').value = '';
    document.getElementById('pagina').value = 1;
    
    const cuerpoTabla = document.getElementById('cuerpoTabla');
    cuerpoTabla.innerHTML = `
        <tr>
            <td colspan="6" class="text-center text-muted py-5">
                <i class="fas fa-search fa-3x mb-3"></i>
                <h5>Realice una búsqueda para ver los resultados</h5>
                <p class="text-muted">Los datos se consumen directamente de SIRE2</p>
            </td>
        </tr>
    `;
    
    document.getElementById('contadorResultados').textContent = 'Esperando búsqueda...';
    document.getElementById('texto_paginacion_tabla').innerHTML = 'Ingrese criterios de búsqueda';
    document.getElementById('lista_paginacion_tabla').innerHTML = '<li class="page-item disabled"><span class="page-link">-</span></li>';
    document.getElementById('controlesResultados').style.display = 'none';
}

// Funciones de exportación (opcionales)
function exportarJSON() {
    console.log('Exportar JSON desde TOKEN');
}

function mostrarJSON() {
    console.log('Mostrar JSON desde TOKEN');
}