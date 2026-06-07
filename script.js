/**
 * SecureCam - Sistema de Monitoreo Inteligente
 * Lógica Principal con encapsulamiento IIFE
 * Desarrollado por: Yeison Albeiro Melo Cruz
 */
(function () {
    'use strict';

    // 1. SELECTORES DE ELEMENTOS DEL DOM
    const formulario = document.getElementById('form-cotizacion');
    const mensajeExito = document.getElementById('mensaje-exito');

    // 2. CONFIGURACIÓN DE NAMESPACES EN LOCALSTORAGE
    const STORAGE_KEY = 'securecam_form_data';
    const USER_STATE_KEY = 'securecam_user_converted';

    // 3. FUNCIÓN DE INICIALIZACIÓN
    function init() {
        console.log("🔒 SecureCam Core inicializado correctamente...");
        
        // Registro del Service Worker para convertir en PWA
        registrarServiceWorker();

        if (comprobarEstadoUsuarioConvertido()) {
            mostrarMensajeDeAgradecimientoDirecto();
        } else if (formulario) {
            configurarEventos();
            cargarDatosPrevios();
        }
    }

    // 4. MANEJADORES DE EVENTOS
    function configurarEventos() {
        formulario.addEventListener('input', guardarDatosEnTiempoReal);
        formulario.addEventListener('submit', manejarEnvioFormulario);
    }

    // 5. REGISTRO DEL SERVICE WORKER (Requisito de PWA - Rutas relativas para GitHub Pages)
    function registrarServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                // El './sw.js' es clave para que no busque en la raíz del host de GitHub
                navigator.serviceWorker.register('./sw.js')
                    .then(reg => {
                        console.log('✓ Service Worker registrado exitosamente en el scope:', reg.scope);
                    })
                    .catch(err => {
                        console.warn('✗ No se pudo registrar el Service Worker:', err);
                    });
            });
        }
    }

    // 6. LÓGICA DE PERSISTENCIA (AUTOGUARDADO)
    function guardarDatosEnTiempoReal() {
        const datosFormulario = {
            nombre: document.getElementById('nombre').value,
            telefono: document.getElementById('telefono').value,
            planInteres: document.getElementById('plan-interes').value
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(datosFormulario));
    }

    function cargarDatosPrevios() {
        const datosGuardados = localStorage.getItem(STORAGE_KEY);
        if (datosGuardados) {
            try {
                const datos = JSON.parse(datosGuardados);
                if (datos.nombre) document.getElementById('nombre').value = datos.nombre;
                if (datos.telefono) document.getElementById('telefono').value = datos.telefono;
                if (datos.planInteres) document.getElementById('plan-interes').value = datos.planInteres;
                console.log("⚡ Campos de cotización restaurados desde el caché.");
            } catch (error) {
                console.error("Error al cargar localStorage", error);
            }
        }
    }

    // 7. CONTROL DE ESTADO DE CONVERSIÓN
    function comprobarEstadoUsuarioConvertido() {
        return localStorage.getItem(USER_STATE_KEY) === 'true';
    }

    // Función para restablecer por completo el formulario y limpiar el caché de conversión
    function restablecerFormularioCompleto() {
        // Limpiamos los flags de almacenamiento para permitir una nueva conversión
        localStorage.removeItem(USER_STATE_KEY);
        localStorage.removeItem(STORAGE_KEY);
        
        if (formulario) {
            formulario.reset(); // Vaciado absoluto de los campos del formulario
            formulario.classList.remove('hidden'); // Volvemos a mostrar el formulario
            configurarEventos(); // Reasignación de listeners
        }
        
        if (mensajeExito) {
            mensajeExito.classList.add('hidden'); // Ocultamos el bloque de agradecimiento
            mensajeExito.innerHTML = '';
        }

        console.log("🔄 Formulario y caché restablecidos para un nuevo envío.");
        
        // Scroll animado suave al formulario de contacto para facilitar el llenado inmediato
        const contactoSec = document.getElementById('contacto');
        if (contactoSec) {
            contactoSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Muestra el mensaje de éxito una vez se ha convertido el lead
    function mostrarMensajeDeAgradecimientoDirecto() {
        if (formulario && mensajeExito) {
            formulario.classList.add('hidden');
            mensajeExito.classList.remove('hidden');
            
            const datosGuardados = localStorage.getItem(STORAGE_KEY);
            const nombreUsuario = datosGuardados ? JSON.parse(datosGuardados).nombre : "Cliente";

            // Mensaje de éxito optimizado con el nuevo botón interactivo para realizar otra cotización
            mensajeExito.innerHTML = `
                <div style="padding: 2.5rem; border: 2px dashed var(--color-accent); border-radius: var(--border-radius); background-color: rgba(57, 255, 20, 0.05); text-align: left; animation: slideIn 0.3s ease; box-shadow: 0 0 20px rgba(57, 255, 20, 0.1);">
                    <h3 style="color: var(--color-accent); margin-bottom: 0.75rem; font-size: 1.4rem; display: flex; align-items: center; gap: 0.5rem; font-weight: 800; text-shadow: 0 0 10px rgba(57, 255, 20, 0.3);">
                        <span>🔒</span> ¡Tienes una solicitud activa!
                    </h3>
                    <p style="color: #cbd5e1; line-height: 1.6; margin: 0; font-size: 1rem; margin-bottom: 1.5rem;">
                        Hola <strong>${nombreUsuario}</strong>, ya hemos recibido tus datos para la cotización de tus cámaras de seguridad. Un asesor técnico de SecureCam se comunicará contigo muy pronto.
                    </p>
                    <button id="btn-nuevo-envio" style="background-color: transparent; color: var(--color-secondary); border: 1.5px solid var(--color-secondary); padding: 0.75rem 1.5rem; border-radius: var(--border-radius); font-weight: bold; cursor: pointer; transition: var(--transition); text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.05em; display: inline-block;">
                        Realizar otra cotización
                    </button>
                </div>
            `;

            // Escucha activa al botón interactivo recién creado para restablecer el formulario
            const btnNuevoEnvio = document.getElementById('btn-nuevo-envio');
            if (btnNuevoEnvio) {
                btnNuevoEnvio.addEventListener('click', restablecerFormularioCompleto);
            }
        }
    }

    // Lógica para enviar los datos de forma asíncrona mediante un POST
    function manejarEnvioFormulario(event) {
        event.preventDefault();
        console.log("📡 Iniciando envío de datos asíncronos mediante POST...");

        const datosAEnviar = {
            nombre: document.getElementById('nombre').value,
            telefono: document.getElementById('telefono').value,
            plan: document.getElementById('plan-interes').value
        };

        // Simulación técnica de Fetch POST hacia servicio de leads (Formspree/Endpoint)
        fetch('https://formspree.io/f/tu_endpoint_simulado', {
            method: 'POST',
            body: JSON.stringify(datosAEnviar),
            headers: { 'Content-Type': 'application/json' }
        }).then(() => {
            console.log("🚀 Datos enviados con éxito a la API externa.");
            
            // ACCIONES REQUERIDAS DE PERSISTENCIA:
            localStorage.setItem(USER_STATE_KEY, 'true');
            localStorage.removeItem(STORAGE_KEY);
            mostrarMensajeDeAgradecimientoDirecto();

            // Limpieza estándar de campos físicos tras el envío
            formulario.reset();
        }).then(null, error => {
            console.error("Error simulado en la red, aplicando contingencia de éxito local:", error);
            // Contingencia para que funcione de manera local antes de configurar el backend real:
            localStorage.setItem(USER_STATE_KEY, 'true');
            mostrarMensajeDeAgradecimientoDirecto();
            
            // Limpieza estándar de campos físicos tras el envío (Contingencia)
            formulario.reset();
        });
    }

    // Función global externa expuesta para interactuar con las tarjetas de precios
    window.seleccionarPlan = function(idPlan) {
        // Si el usuario tenía un estado convertido activo, lo restablecemos para permitirle seleccionar un nuevo plan
        if (comprobarEstadoUsuarioConvertido()) {
            localStorage.removeItem(USER_STATE_KEY);
            if (formulario) formulario.classList.remove('hidden');
            if (mensajeExito) {
                mensajeExito.classList.add('hidden');
                mensajeExito.innerHTML = '';
            }
        }

        const select = document.getElementById('plan-interes');
        if (select) {
            select.value = idPlan;
            // Guardamos inmediatamente el cambio en el borrador en tiempo real
            guardarDatosEnTiempoReal();
            
            // Pequeño feedback visual de scroll hacia el formulario
            const contactoSec = document.getElementById('contacto');
            if (contactoSec) {
                contactoSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    document.addEventListener('DOMContentLoaded', init);

})();

// Efecto visual dinámico al hacer scroll en el Header (Sticky Navbar)
window.addEventListener('scroll', () => {
    const header = document.querySelector('.main-header');
    if (window.scrollY > 50) {
        header.style.padding = '0.6rem var(--space-lg)';
        header.style.backgroundColor = 'rgba(8, 12, 20, 0.95)';
        header.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.7)';
    } else {
        header.style.padding = 'var(--space-md) var(--space-lg)';
        header.style.backgroundColor = 'rgba(10, 15, 29, 0.9)';
        header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
    }
});