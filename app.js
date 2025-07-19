const ligas = [
    {
        nombre: "Liga MX",
        partidos: [
            { equipo1: "América", equipo2: "Guadalajarra" },
            { equipo1: "Tigres", equipo2: "Monterrey" }
        ]
    },
    {
        nombre: "Champions League",
        partidos: [
            { equipo1: "Real Madrid", equipo2: "Machester City" },
            { equipo1: "PSG", equipo2: "Barcelona" }
        ]
    },
    {
        nombre: "League Cup",
        partidos: [
            { equipo1: "Mazatlán", equipo2: "Inter Miami" }
        ]
    }
];

//Función para renderizar en el HTML
function renderizarLigas() {
    const main = document.querySelector("main");
    main.innerHTML = ""; // Limpiar contenido anterior

    ligas.forEach((liga) => {
        const seccion = document.createElement("section");
        seccion.classList.add("liga");

        const titulo = document.createElement("h2");
        titulo.textContent = liga.nombre;
        seccion.appendChild(titulo);

        liga.partidos.forEach((partido) => {
            const divPartido = document.createElement("div");
            divPartido.classList.add("partido");

            const texto = document.createElement("span");
            texto.textContent = `${partido.equipo1} vs ${partido.equipo2}`;

            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = "Tu pronostico";

            divPartido.appendChild(texto);
            divPartido.appendChild(input);
            seccion.appendChild(divPartido);
        });

        main.appendChild(seccion);
    });
}

// Ejecutar al cargar la pagina
document.addEventListener("DOMContentLoaded", renderizarLigas);