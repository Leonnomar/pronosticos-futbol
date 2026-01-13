const partidosSimulados = [
    {
        liga: "Liga MX",
        fecha: "2025-07-19T19:00:00",
        equipo1: "América",
        equipo2: "Guadalajara"
    },
    {
        liga: "Liga MX",
        fecha: "2025-07-20T21:00:00",
        equipo1: "Tigres",
        equipo2: "Monterrey"
    },
    {
        liga: "Champions League",
        fecha: "2025-07-18T14:00:00",
        equipo1: "Real Madrid",
        equipo2: "Manchester City"
    },
    {
        liga: "Champions League",
        fecha: "2025-07-21T16:00:00",
        equipo1: "Barcelona",
        equipo2: "PSG"
    }
];

//Función para renderizar en el HTML
function renderizarPartidosSemana() {
    const main = document.querySelector("main");
    main.innerHTML = ""; // Limpiar contenido anterior

    const ligasMap = {};

    // Agrupar partidos por liga
    partidosSimulados.forEach(partido => {
        if (!ligasMap[partido.liga]) {
            ligasMap[partido.liga] = [];
        }
        ligasMap[partido.liga].push(partido);
    });

    for (const nombreLiga in ligasMap) {
        const seccion = document.createElement("section");
        seccion.className = "bg-white rounded-xl shadow p-5";

        const titulo = document.createElement("h2");
        titulo.textContent = nombreLiga;
        seccion.appendChild(titulo);

        ligasMap[nombreLiga].forEach(partido => {
            const div = document.createElement("div");
            div.className = "flex items-center gap-4 p-3 border rounded-lg";

            const equipos = `${partido.equipo1} vs ${partido.equipo2}`;
            const clave = `${partido.liga}_${partido.equipo1}_vs_${partido.equipo2}`;

            const fecha = new Date(partido.fecha).toLocaleString("es-MX", {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit"
            });

            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = "Tu pronóstico";
            input.value = localStorage.getItem(clave) || "";
            input.className = "w-20 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500";

            // Guardar automáticamente en localStorage cuando se cambia
            input.addEventListener("input", () => {
                localStorage.setItem(clave, input.value);
            });

            div.innerHTML = `
                <div class="flex-1">
                    <p class="font-semibold">${equipos}</p>
                    <p class="text-sm text-gray-500">${fecha}</p>
                </div>
            `;
            div.appendChild(input)
            seccion.appendChild(div);
        });

        main.appendChild(seccion);
    }
}

// Ejecutar al cargar la pagina
document.addEventListener("DOMContentLoaded", renderizarPartidosSemana);