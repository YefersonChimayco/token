// functions_token.js - Gestión del token API

let tokenOriginal = '';

document.addEventListener('DOMContentLoaded', function() {
    cargarTokenActual();
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
            mostrarMensaje('Token cargado correctamente', 'success');
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