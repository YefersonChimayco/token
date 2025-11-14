// functions_token.js - Gestión del token API

let tokenOriginal = '';

document.addEventListener('DOMContentLoaded', function() {
    cargarTokenActual();
    verificarTokenAlmacenado();
});

function cargarTokenActual() {
    mostrarMensaje('Cargando token...', 'info');
    
    let formData = new FormData();
    formData.append('sesion', session_session);
    formData.append('token_sesion', token_token);
    
    let url = base_url + 'src/control/TokenController.php?tipo=obtener';
    
    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(response => response.text().then(text => {
        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error('Respuesta no es JSON válido');
        }
    }))
    .then(data => {
        if (data.status) {
            document.getElementById('tokenInput').value = data.token;
            tokenOriginal = data.token;
            
            // ========== NUEVO: Almacenar token automáticamente ==========
            almacenarTokenAutomatico(data.token);
            mostrarMensaje('Token cargado y almacenado automáticamente', 'success');
        } else {
            mostrarMensaje('Error: ' + data.msg, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarMensaje('Error al cargar el token', 'danger');
    });
}

function habilitarEdicion() {
    const tokenInput = document.getElementById('tokenInput');
    tokenInput.readOnly = false;
    tokenInput.focus();
    document.getElementById('botonesGuardar').style.display = 'block';
    mostrarMensaje('Puedes editar el token.', 'info');
    tokenInput.select();
}

function cancelarEdicion() {
    const tokenInput = document.getElementById('tokenInput');
    tokenInput.readOnly = true;
    tokenInput.value = tokenOriginal;
    document.getElementById('botonesGuardar').style.display = 'none';
    mostrarMensaje('Edición cancelada.', 'info');
}

function guardarToken() {
    const nuevoToken = document.getElementById('tokenInput').value.trim();

    if (!nuevoToken) {
        mostrarMensaje('El token no puede estar vacío', 'warning');
        return;
    }

    let formData = new FormData();
    formData.append('token_api', nuevoToken);
    formData.append('sesion', session_session);
    formData.append('token_sesion', token_token);

    mostrarMensaje('Guardando...', 'info');

    let url = base_url + 'src/control/TokenController.php?tipo=actualizar';

    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(response => response.text().then(text => {
        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error('Respuesta no es JSON válido');
        }
    }))
    .then(data => {
        if (data.status) {
            mostrarMensaje(data.mensaje, 'success');
            tokenOriginal = nuevoToken;
            document.getElementById('tokenInput').readOnly = true;
            document.getElementById('botonesGuardar').style.display = 'none';
            
            // ========== NUEVO: Almacenar nuevo token automáticamente ==========
            almacenarTokenAutomatico(nuevoToken);
        } else {
            mostrarMensaje(data.mensaje, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarMensaje('Error al guardar', 'danger');
    });
}

function mostrarMensaje(mensaje, tipo) {
    const divMensaje = document.getElementById('mensaje');
    if (mensaje) {
        divMensaje.innerHTML = `<div class="alert alert-${tipo}">${mensaje}</div>`;
    } else {
        divMensaje.innerHTML = '';
    }
}

function copiarToken() {
    const tokenInput = document.getElementById('tokenInput');
    tokenInput.select();
    document.execCommand('copy');
    mostrarMensaje('Token copiado al portapapeles', 'success');
}

// ========== NUEVAS FUNCIONES PARA SISTEMA AUTOMÁTICO ==========

// Función para almacenar token automáticamente
function almacenarTokenAutomatico(token) {
    if (token && token.trim() !== '') {
        // Almacenar en localStorage (persistente)
        localStorage.setItem('api_token_sire2', token.trim());
        console.log('✅ Token almacenado automáticamente:', token.trim());
        
        // Actualizar indicador visual
        actualizarIndicadorToken();
    }
}

// Función para verificar token almacenado
function verificarTokenAlmacenado() {
    const tokenAlmacenado = localStorage.getItem('api_token_sire2');
    if (tokenAlmacenado) {
        console.log('🔐 Token almacenado encontrado:', tokenAlmacenado);
        actualizarIndicadorToken();
    }
}

// Función para actualizar indicador visual
function actualizarIndicadorToken() {
    const tokenAlmacenado = localStorage.getItem('api_token_sire2');
    let indicador = document.getElementById('indicadorToken');
    
    if (!indicador) {
        indicador = document.createElement('div');
        indicador.id = 'indicadorToken';
        indicador.className = 'alert alert-info mt-3';
        document.querySelector('.card-body').appendChild(indicador);
    }
    
    if (tokenAlmacenado) {
        indicador.innerHTML = `
            <i class="fas fa-key mr-2"></i>
            <strong>Token Activo:</strong> Almacenado para uso automático en API
            <button class="btn btn-outline-primary btn-sm ml-2" onclick="irAlAPI()">
                <i class="fas fa-external-link-alt mr-1"></i> Ir al API
            </button>
            <button class="btn btn-outline-danger btn-sm ml-1" onclick="eliminarTokenAlmacenado()">
                <i class="fas fa-trash mr-1"></i> Eliminar
            </button>
        `;
    } else {
        indicador.innerHTML = `
            <i class="fas fa-key mr-2"></i>
            <strong>Token No Almacenado:</strong> El token no está disponible para uso automático
        `;
    }
}

// Función para ir al API
function irAlAPI() {
    window.open(base_url + 'src/view/apiestudiante.php', '_blank');
}

// Función para eliminar token almacenado
function eliminarTokenAlmacenado() {
    localStorage.removeItem('api_token_sire2');
    mostrarMensaje('Token eliminado del almacenamiento automático', 'warning');
    actualizarIndicadorToken();
}