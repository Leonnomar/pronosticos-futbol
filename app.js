const partidosSimulados = [
    {
        liga: "Liga MX",
        fecha: "2025-07-19T19:00:00",
        equipo1: "América",
        equipo2: "Guadalajara",
        resultado: "2-1"
    },
    {
        liga: "Liga MX",
        fecha: "2025-07-20T21:00:00",
        equipo1: "Tigres",
        equipo2: "Monterrey"
    },
    {
        liga: "Champions League",
        fase: "cuartos",
        idaVuelta: true,
        fecha: "2025-07-18T14:00:00",
        equipo1: "Real Madrid",
        equipo2: "Manchester City",
        resultado: {
            marcador: "1-1",
            ganador: "local"
        }
    },
    {
        liga: "Champions League",
        fecha: "2026-07-21T16:00:00",
        equipo1: "Barcelona",
        equipo2: "PSG"
    }
];

const configuracionPuntos = {
    exacto: 5,
    resultado: 3,

    penales: {
        activo: true,
        puntos: 2
    },

    fasesFinales: {
        activo: true,
        puntosPorFase: {
            dieciseisavos: 1,
            octavos: 1,
            cuartos: 2,
            semifinal: 3,
            final: 5
        }
    }
};

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

            if (partido.resultado) {
                estadoPartido = "finalizado";
            } else if (ahora >=  fechaPartido) {
                estadoPartido = "en-juego";
            }
            if (estadoPartido === "finalizado"){
                badge.textContent = "Finalizado";
                badge.className = "text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded-full font-semibold";
            } else if (estadoPartido === "en-juego") {
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
            inputLocal.max = 20;
            inputLocal.min = 0;
            inputLocal.className = "w-12 text-center border rounded";

            const separador = document.createElement("span");
            separador.textContent = "-";
            separador.className = "font-bold";

            const inputVisitante = document.createElement("input");
            inputVisitante.type = "number";
            inputVisitante.max = 20;
            inputVisitante.min = 0;
            inputVisitante.className = "w-12 text-center border rounded";

            // Bloqueo por fecha
            if (estadoPartido !== "pendiente") {
                inputLocal.disabled = true;
                inputVisitante.disabled = true;
                inputLocal.classList.add("bg-gray-200");
                inputVisitante.classList.add("bg-gray-200");
            }

            // Mostrar resultado real y puntos
            if (estadoPartido === "finalizado") {
                const resultadoTexto = document.createElement("p");
                resultadoTexto.className = "text-sm font-semibold mt-1";
                let textoResultado = "";

                if (typeof partido.resultado === "string") {
                    textoResultado = partido.resultado;
                } else if (typeof partido.resultado === "object") {
                    textoResultado = partido.resultado.marcador;
                }

                resultadoTexto.textContent = `Resultado: ${textoResultado}`;

                info.appendChild(resultadoTexto);

                if (partido.resultado?.penales) {
                    const penalesTexto = document.createElement("p");
                    penalesTexto.className = "text-sm text-gray-500";
                    penalesTexto.textContent = `Penales: ${partido.resultado.penales}`;
                    info.appendChild(penalesTexto);
                }
                const pronosticoGuardado = localStorage.getItem(clave);
                if (pronosticoGuardado) {
                    const puntos = calcularPuntos(pronosticoGuardado, partido);

                    const puntosTexto = document.createElement("p");
                    puntosTexto.className =
                        puntos === 5
                            ? "text-green-600 font-bold"
                            : puntos === 3
                            ? "text-yellow-600 font-bold"
                            : "text-red-600 font-bold";
                    
                    puntosTexto.textContent = `+${puntos} pts`;
                    info.appendChild(puntosTexto);
                }

                if (partido.fase) {
                    const bonusTexto = document.createElement("p");
                    bonusTexto.className = "text-blue-600 font-semibold text-sm";
                    bonusTexto.textContent = `Bonus fase ${partido.fase}`;
                    info.appendChild(bonusTexto);
                }
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

            if (partido.idaVuelta) {
                const claveIda = `${clave}_ida`;
                const claveVuelta = `${clave}_vuelta`;

                if (necesitaPenales(partido, claveIda, claveVuelta)) {
                    const penalesDiv = document.createElement("div");
                    penalesDiv.className = "flex items-center gap-2 mt-2";

                    const penalesLocal = document.createElement("input");
                    penalesLocal.type = "number";
                    penalesLocal.min = 0;
                    penalesLocal.max = 30;
                    penalesLocal.className = "w-12 text-center border rounded";

                    const textoPenales = document.createElement("span");
                    textoPenales.textContent = "Penales";

                    const penalesVisitante = document.createElement("input");
                    penalesVisitante.type = "number";
                    penalesVisitante.min = 0;
                    penalesVisitante.max = 30;
                    penalesVisitante.className = "w-12 text-center border rounded";

                    const clavePenales = `${clave}_penales`;

                    // Cargar guardado
                    const guardado = localStorage.getItem(clavePenales);
                    if (guardado) {
                        const [pl, pv] = guardado.split("-");
                        penalesLocal.value = pl;
                        penalesVisitante.value = pv;
                    }

                    // Guardar automático
                    function guardarPenales() {
                        if (penalesLocal.value === "" || penalesVisitante.value === "") return;
                        localStorage.setItem(clavePenales, `${penalesLocal.value}-${penalesVisitante.value}`);
                    }

                    penalesLocal.addEventListener("input", guardarPenales);
                    penalesVisitante.addEventListener("input", guardarPenales);

                    penalesDiv.append(penalesLocal, textoPenales, penalesVisitante);
                    info.appendChild(penalesDiv);
                }
            }
        });

        main.appendChild(seccion);
    }
}
// Calcular puntos
function calcularPuntos(pronostico, partido) {
    const [pL, pV] = pronostico.split("-").map(Number);
    let puntos = 0;

    // ===== RESULTADO REAL =====
    let marcadorReal = null;

    if (typeof partido.resultado === "string") {
        marcadorReal = partido.resultado;
    } else if (typeof partido.resultado === "object") {
        marcadorReal = partido.resultado.marcador;
    }

    if (marcadorReal){
        const [rL, rV] = marcadorReal.split("-").map(Number);

        // Exacto
        if (pL === rL && pV === rV) {
            puntos += configuracionPuntos.exacto
        } else {
            const signoPronostico = Math.sign(pL - pV);
            const signoResultado = Math.sign(rL - rV);

            if (signoPronostico === signoResultado) {
                puntos += configuracionPuntos.resultado;
            }
        }
    }

    // ===== PENALES =====
    if (configuracionPuntos.penales.activo && partido.penales && partido.resultado?.ganador) {
        const signoPronostico = Math.sign(pL - pV);
        const ganadorPronosticado = signoPronostico > 0 ? "local" : signoPronostico < 0 ? "visitante" : "empate";

        if (ganadorPronosticado === partido.resultado.ganador) {
            puntos += configuracionPuntos.penales.puntos;
        }
    }

    // ===== BONUS POR FASE =====
    if (configuracionPuntos.fasesFinales.activo && partido.fase && partido.resultado?.ganador) {
        const bonus = configuracionPuntos.fasesFinales.puntosPorFase[partido.fase] || 0;

        const signoPronostico = Math.sign(pL - pV);
        const ganadorPronosticado = signoPronostico > 0 ? "local" : signoPronostico < 0 ? "visitante" : "empate";

        if (ganadorPronosticado === partido.resultado?.ganador) {
            puntos += bonus;
        }
    }

    return puntos;
}

function obtenerGlobalPronostico(claveIda, claveVuelta) {
    const ida = localStorage.getItem(claveIda);
    const vuelta = localStorage.getItem(claveVuelta);

    if (!ida || !vuelta) return null;

    const [iL, iV] = ida.split("-").map(Number);
    const [vL, vV] = vuelta.split("-").map(Number);

    return {
        local: iL + vL,
        visitante: iV + vV
    };
}
function necesitaPenales(partido, claveIda, claveVuelta) {
    if (!partido.idaVuelta || !partido.fase) return false;

    const global = obtenerGlobalPronostico(claveIda, claveVuelta);
    if (!global) return false;

    return global.local === global.visitante;
}

// Ejecutar al cargar la pagina
document.addEventListener("DOMContentLoaded", renderizarPartidosSemana);