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


