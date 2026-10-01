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


    // Cerrar el menú

    document.getElementById("sideMenu").style.left = "-300px";

}


// ==================================================
// TRANSMISIÓN: IP / URL CONFIGURABLE DESDE LA WEB
// ==================================================

const ipInput = document.getElementById("ipInput");
const video = document.getElementById("videoStream");
const btnConect = document.getElementById("btnConectar");
const btnRotar = document.getElementById("btnRotar");

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

function setEstado(sistema, conexion, vid, senal) {
    document.getElementById("estSistema").textContent = sistema;
    document.getElementById("estConexion").textContent = conexion;
    document.getElementById("estVideo").textContent = vid;
    document.getElementById("estSenal").textContent = senal;
}

function conectar() {
    const url = construirURL(ipInput.value);
    if (!url) return;

    localStorage.setItem("aeronetFuente", ipInput.value.trim());
    setEstado("ACTIVO", "CONECTANDO...", "ESPERANDO", "BUSCANDO");
    video.src = url + "?t=" + Date.now();   // evita caché
}

video.onload = function () {
    setEstado("ACTIVO", "CONECTADO", "RECIBIENDO", "DISPONIBLE");
};

video.onerror = function () {
    setEstado("ACTIVO", "ERROR", "SIN VIDEO", "NO DISPONIBLE");
};

btnConect.onclick = conectar;
ipInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") conectar();
});

btnRotar.onclick = function () {
    video.classList.toggle("rotado");
};

// Recordar la última fuente usada en este dispositivo
const guardada = localStorage.getItem("aeronetFuente");
if (guardada) ipInput.value = guardada;