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
        seccion.className = "bg-white rounded-xl shadow p-5 space-y-3";

        const titulo = document.createElement("h2");
        titulo.textContent = nombreLiga;
        titulo.className = "text-xl font-bold mb-2";
        seccion.appendChild(titulo);

        ligasMap[nombreLiga].forEach(partido => {
            const div = document.createElement("div");
            div.className = "flex items-center justify-between gap-4 p-3 border rounded-lg";

            const info = document.createElement("div");
            info.className = "flex-1";

            const equipos = `${partido.equipo1} vs ${partido.equipo2}`;
            const clave = `${partido.liga}_${partido.equipo1}_vs_${partido.equipo2}`;

            const fechaPartido = new Date(partido.fecha);
            const ahora = new Date();

            const fecha = new Date(partido.fecha).toLocaleString("es-MX", {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit"
            });

            // ===== BADGE =====
            const badge = document.createElement("span");
            let estadoPartido = "pendiente";

            if (ahora >=  fechaPartido) {
                estadoPartido = "en-juego";
                badge.textContent = "En juego";
                badge.className = "text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold";
            } else {
                badge.textContent = "Pendiente";
                badge.className = "text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-semibold";
            }

            // ===== TÍTULO =====
            const tituloPartido = document.createElement("div");
            tituloPartido.className = "flex items-center gap-2";

            const textoEquipos = document.createElement("p");
            textoEquipos.className = "font-semibold";
            textoEquipos.textContent = equipos;

            tituloPartido.append(textoEquipos, badge);
            info.append(tituloPartido);

            // ===== FECHA =====
            const fechaTexto = document.createElement("p");
            fechaTexto.className = "text-sm text-gray-500";
            fechaTexto.textContent = fecha;
            info.appendChild(fechaTexto);

            // ===== PRONÓSTTICO =====
            const pronostico = document.createElement("div");
            pronostico.className = "flex items-center gap-2";

            const inputLocal = document.createElement("input");
            inputLocal.type = "number";
            inputLocal.min = 0;
            inputLocal.className = "w-12 text-center border rounded";

            const separador = document.createElement("span");
            separador.textContent = "-";
            separador.className = "font-bold";

            const inputVisitante = document.createElement("input");
            inputVisitante.type = "number";
            inputVisitante.min = 0;
            inputVisitante.className = "w-12 text-center border rounded";

            // Bloqueo por fecha
            if (estadoPartido === "en-juego") {
                inputLocal.disabled = true;
                inputVisitante.disabled = true;
                inputLocal.classList.add("bg-gray-200", "cursor-not-allowed");
                inputVisitante.classList.add("bg-gray-200", "cursor-not-allowed");
            }
            
            // Cargar pronóstico guardado
            const guardado = localStorage.getItem(clave);
            if (guardado) {
                const [gLocal, gVisitante] = guardado.split("-");
                inputLocal.value = gLocal;
                inputVisitante.value = gVisitante;
            }

            // Guardar automáticamente
            function guardarPronostico(){
                if (inputLocal.value === "" || inputVisitante.value === "") return;
                const valor = `${inputLocal.value}-${inputVisitante.value}`;
                localStorage.setItem(clave, valor);
            }

            inputLocal.addEventListener("input", guardarPronostico);
            inputVisitante.addEventListener("input", guardarPronostico);

            pronostico.append(inputLocal, separador, inputVisitante);
            div.append(info, pronostico);
            seccion.appendChild(div);
        });

        main.appendChild(seccion);
    }
}

// Ejecutar al cargar la pagina
document.addEventListener("DOMContentLoaded", renderizarPartidosSemana);