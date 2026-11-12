// ==================================================
// ABRIR MENÚ
// ==================================================

document.getElementById("menuButton").onclick = function () {

    document.getElementById("sideMenu").style.left = "0";

};


// ==================================================
// CERRAR MENÚ
// ==================================================

document.getElementById("closeMenu").onclick = function () {

    document.getElementById("sideMenu").style.left = "-300px";

};


// ==================================================
// CAMBIAR DE SECCIÓN
// ==================================================

function mostrarSeccion(seccion) {


    // Ocultar todas las secciones

    let secciones = document.querySelectorAll(".seccion");


    secciones.forEach(function (elemento) {

        elemento.classList.add("oculto");

    });


    // Mostrar la sección seleccionada

    document.getElementById(seccion).classList.remove("oculto");

    // Si salimos de Transmisión, detenemos el video para no gastar datos
    if (seccion !== "transmision") {
        desconectar();
    }

    // Cerrar el menú

    document.getElementById("sideMenu").style.left = "-300px";

}


// ==================================================
// TRANSMISIÓN: VISOR DE CÁMARA
// ==================================================

const monitor = document.getElementById("monitor");
const ipInput = document.getElementById("ipInput");
const video = document.getElementById("videoStream");
const btnConectar = document.getElementById("btnConectar");
const btnDesconectar = document.getElementById("btnDesconectar");
const btnRotar = document.getElementById("btnRotar");

const TIEMPO_MAXIMO = 12000;      // ms de espera antes de declarar error

let activo = false;               // ¿hay una conexión en curso o establecida?
let temporizadorEspera = null;
let temporizadorReloj = null;
let inicioConexion = 0;


// Textos de cada estado del monitor
const TEXTOS = {
    espera: {
        insignia: "SIN SENAL",
        conexion: "ESPERANDO",
        video: "ESPERANDO",
        mensaje: "SIN SENAL",
        ayuda: "Ingresa la direccion de la camara para comenzar."
    },
    conectando: {
        insignia: "CONECTANDO",
        conexion: "CONECTANDO...",
        video: "ESPERANDO",
        mensaje: "CONECTANDO",
        ayuda: "Buscando la camara en la direccion indicada."
    },
    recibiendo: {
        insignia: "EN LINEA",
        conexion: "CONECTADO",
        video: "RECIBIENDO",
        mensaje: "",
        ayuda: ""
    },
    error: {
        insignia: "ERROR",
        conexion: "SIN RESPUESTA",
        video: "SIN VIDEO",
        mensaje: "SIN CONEXION",
        ayuda: "Revisa la direccion y que la camara siga transmitiendo. " +
            "Si esta pagina esta en https y la camara en http, " +
            "el navegador puede bloquear el video."
    }
};


function construirURL(valor) {
    valor = valor.trim();
    if (!valor) return "";

    // Si no trae http(s), asumimos IP local (puerto 8080 por defecto)
    if (!/^https?:\/\//i.test(valor)) {
        if (!valor.includes(":")) valor += ":8080";
        valor = "http://" + valor;
    }

    valor = valor.replace(/\/+$/, "");
    if (!valor.endsWith("/video")) valor += "/video";
    return valor;
}


// Cambia el monitor a un estado: el CSS pinta el color según data-estado
function mostrarEstado(estado) {
    const t = TEXTOS[estado];

    monitor.dataset.estado = estado;
    document.getElementById("insignia").textContent = t.insignia;
    document.getElementById("estConexion").textContent = t.conexion;
    document.getElementById("estVideo").textContent = t.video;
    document.getElementById("mensajePantalla").textContent = t.mensaje;
    document.getElementById("ayudaPantalla").textContent = t.ayuda;

    btnDesconectar.disabled = (estado === "espera");
}


// Muestra la dirección final mientras se escribe
function actualizarVistaPrevia() {
    const url = construirURL(ipInput.value);
    document.getElementById("urlFinal").textContent =
        url || "escribe una direccion para ver la URL final";
}


// ---------- Reloj "EN LÍNEA" ----------

function formatoTiempo(ms) {
    const total = Math.floor(ms / 1000);
    const min = String(Math.floor(total / 60)).padStart(2, "0");
    const seg = String(total % 60).padStart(2, "0");
    return min + ":" + seg;
}

function iniciarReloj() {
    if (temporizadorReloj) return;      // ya está corriendo

    inicioConexion = Date.now();
    document.getElementById("estTiempo").textContent = "00:00";

    temporizadorReloj = setInterval(function () {
        document.getElementById("estTiempo").textContent =
            formatoTiempo(Date.now() - inicioConexion);
    }, 1000);
}

function detenerReloj() {
    clearInterval(temporizadorReloj);
    temporizadorReloj = null;
}

function limpiarDatos() {
    document.getElementById("estResolucion").textContent = "—";
    document.getElementById("estTiempo").textContent = "—";
}


// ---------- Conectar y desconectar ----------

function conectar() {
    const url = construirURL(ipInput.value);
    if (!url) return;

    localStorage.setItem("aeronetFuente", ipInput.value.trim());

    detenerReloj();
    limpiarDatos();
    activo = true;
    mostrarEstado("conectando");

    // Si en 12 segundos no llega nada, avisamos en lugar de quedarnos esperando
    clearTimeout(temporizadorEspera);
    temporizadorEspera = setTimeout(function () {
        if (activo && monitor.dataset.estado === "conectando") {
            mostrarEstado("error");
        }
    }, TIEMPO_MAXIMO);

    video.src = url + "?t=" + Date.now();   // evita caché
}

function desconectar() {
    activo = false;
    clearTimeout(temporizadorEspera);
    detenerReloj();

    // Vaciar la imagen corta la conexión con la cámara
    video.src = "";
    video.removeAttribute("src");

    limpiarDatos();
    mostrarEstado("espera");
}


// ---------- Eventos del video ----------

video.onload = function () {
    if (!activo) return;

    clearTimeout(temporizadorEspera);
    mostrarEstado("recibiendo");
    document.getElementById("estResolucion").textContent =
        video.naturalWidth + " × " + video.naturalHeight;
    iniciarReloj();
};

video.onerror = function () {
    if (!activo) return;

    clearTimeout(temporizadorEspera);
    detenerReloj();
    mostrarEstado("error");
};


// ---------- Botones y teclado ----------

btnConectar.onclick = conectar;
btnDesconectar.onclick = desconectar;

ipInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") conectar();
});

ipInput.addEventListener("input", actualizarVistaPrevia);

btnRotar.onclick = function () {
    video.classList.toggle("rotado");
};


// ---------- Estado inicial ----------

// Recordar la última fuente usada en este dispositivo
const guardada = localStorage.getItem("aeronetFuente");
if (guardada) ipInput.value = guardada;

actualizarVistaPrevia();
mostrarEstado("espera");



// ==================================================
// MULTIMEDIA: FILTRO DE VIDEOS POR CATEGORÍA
// ==================================================

const botonesFiltro = document.querySelectorAll(".mmIndiceItem");
const tarjetasVideo = document.querySelectorAll(".videoYoutube");

botonesFiltro.forEach(function (boton) {

    boton.addEventListener("click", function () {

        const filtro = boton.dataset.filtro;

        // Marcar solo el botón elegido
        botonesFiltro.forEach(function (b) {
            b.classList.remove("activo");
        });
        boton.classList.add("activo");

        // Mostrar los videos de esa categoría y ocultar el resto
        tarjetasVideo.forEach(function (tarjeta) {
            const coincide = (filtro === "todo" ||
                tarjeta.dataset.categoria === filtro);
            tarjeta.classList.toggle("oculto", !coincide);
        });
    });
});