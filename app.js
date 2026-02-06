const partidosSimulados = [
    {
        liga: "Liga MX",
        fecha: "2025-07-19T19:00:00",
        equipo1: "América",
        equipo2: "Guadalajara",
        instancia: "unica",
        resultado: "2-1"
    },
    {
        liga: "Liga MX",
        fecha: "2025-07-20T21:00:00",
        equipo1: "Tigres",
        equipo2: "Monterrey",
        instancia: "unica"
    },
    {
        liga: "Champions League",
        fase: "cuartos",
        instancia: "ida",
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
        fase: "cuartos",
        instancia: "vuelta",
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
    partidosSimulados.forEach(p => {
        if (!ligasMap[p.liga]) {
            ligasMap[p.liga] = [];
        }
        ligasMap[p.liga].push(p);
    });

    for (const nombreLiga in ligasMap) {
        const seccion = document.createElement("section");
        seccion.className = "bg-white rounded-xl shadow p-5 space-y-3";

        const h2 = document.createElement("h2");
        h2.textContent = nombreLiga;
        h2.className = "text-xl font-bold";
        seccion.appendChild(h2);

        ligasMap[nombreLiga].forEach(partido => {
            const div = document.createElement("div");
            div.className = "flex justify-between gap-4 p-3 border rounded-lg";

            const info = document.createElement("div");
            info.className = "flex-1";

            const clave = `${partido.liga}_${partido.equipo1}_vs_${partido.equipo2}_${partido.instancia}`;
            const clavePenales = `${clave}_penales`;

            const fecha = new Date(partido.fecha);
            const ahora = new Date();

            let estado = "pendiente";
            if (partido.resultado) estado = "finalizado";
            else if (ahora >= fecha) estado = "en-juego";
            
            // ===== TITULO =====
            const titulo = document.createElement("p");
            titulo.className = "font-semibold";
            titulo.textContent = `${partido.equipo1} vs ${partido.equipo2}`;

            // ===== BADGES =====
            const badges = document.createElement("div");
            badges.className = "flex gap-2 text-xs text-gray-600";

            if (partido.instancia !== "unica") {
                badges.appendChild(crearBadge(`${partido.fase.toUpperCase()} · ${partido.instancia.toUpperCase()}`));
            } else if (partido.fase) {
                badges.appendChild(crearBadge(partido.fase.toUpperCase()));
            }

            badges.appendChild(crearBadge(
                estado === "finalizado" ? "Finalizado" :
                estado === "en-juego" ? "En juego" : "Pendiente"
            ));
            
            info.append(titulo, badges);

            // ===== FECHA =====
            const fechaTxt = document.createElement("p");
            fechaTxt.className = "text-sm text-gray-500";
            fechaTxt.textContent = fecha.toLocaleString("es-MX", {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit"
            });
            info.appendChild(fechaTxt);

            // ===== INPUTS =====
            const pronostico = crearInputsPronostico(clave, estado);
            div.append(info, pronostico);

            // ===== PENALES (solo en vuelta) =====
            if (esVuelta(partido)) {
                const claveIda = `${partido.liga}_${partido.equipo1}_vs_${partido.equipo2}_ida`;
                const claveVuelta = clave;

                if (necesitaPenales(partido, claveIda, claveVuelta) && estado === "pendiente") {
                    const penalesDiv = document.createElement("div");
                    penalesDiv.className = "flex items-center gap-2 mt-2";

                    const pLocal = document.createElement("input");
                    const pVisitante = document.createElement("input");

                    [pLocal, pVisitante].forEach(p => {
                        p.type = "number";
                        p.min = 0;
                        p.max = 30;
                        p.className = "w-12 text-center border rounded"
                    });

                    const txt = document.createElement("span");
                    txt.textContent = "Penales";

                    const clavePenales = `${clave}_penales`;

                    // Cargar guardado
                    const guardado = localStorage.getItem(clavePenales);
                    if (guardado) {
                        const [pl, pv] = guardado.split("-");
                        pLocal.value = pl;
                        pVisitante.value = pv;
                    }

                    function guardarPenales() {
                        if (pLocal.value === "" || pVisitante.value === "") return;
                        localStorage.setItem(clavePenales, `${pLocal.value}-${pVisitante.value}`);
                    }

                    pLocal.addEventListener("input", guardarPenales);
                    pVisitante.addEventListener("input", guardarPenales);

                    penalesDiv.append(pLocal, txt, pVisitante);
                    info.appendChild(penalesDiv);
                }
            }

            // ===== RESULTADO FINAL =====
            if (estado === "finalizado") {
                const res = document.createElement("p");
                res.className = "text-sm font-semibold mt-1";
                res.textContent = `Resultado: ${
                    typeof partido.resultado === "string"
                        ? partido.resultado
                        : partido.resultado.marcador
                }`;
                info.appendChild(res);

                const guardado = localStorage.getItem(clave);
                if (guardado) {
                    const puntos = calcularPuntos(guardado, partido);
                    const pts = document.createElement("p");
                    pts.textContent = `+${puntos} pts`;
                    pts.className = "font-bold text-green-600";
                    info.appendChild(pts);
                }

                const clavePenales = `${clave}_penales`;
                const penalesGuardados = localStorage.getItem(clavePenales);

                if (penalesGuardados) {
                    const penalesTxt = document.createElement("p");
                    penalesTxt.className = "text-sm text-gray-500";
                    penalesTxt.textContent = `Penales: ${penalesGuardados}`;
                    info.appendChild(penalesTxt);
                }
            }
            
            seccion.appendChild(div);
        
        });

        main.appendChild(seccion);
    }
}
// Crear inputs
function crearInputsPronostico(clave, estado) {
    const cont = document.createElement("div");
    cont.className = "flex items-center gap-2";

    const l = document.createElement("input");
    const v = document.createElement("input");

    [l, v].forEach(i => {
        i.type = "number";
        i.min = 0;
        i.max = 20;
        i.className = "w-12 text-center border rounded";
        if (estado !== "pendiente") {
            i.disabled = true;
            i.classList.add("bg-gray-200");
        }
    });

    const sep = document.createElement("span");
    sep.textContent = "-";

    const guardado = localStorage.getItem(clave);
    if (guardado) {
        const [gl, gv] = guardado.split("-");
        l.value = gl;
        v.value = gv;
    }

    function guardar() {
        if (l.value === "" || v.value === "") return;
        localStorage.setItem(clave, `${l.value}-${v.value}`);
    }

    l.addEventListener("input", guardar);
    v.addEventListener("input", guardar);

    cont.append(l, sep, v);
    return cont;
}

// Crear badges
function crearBadge(texto) {
    const span = document.createElement("span");
    span.textContent = texto;
    span.className = "px-2 py-1 bg-gray-100 rounded-full";
    return span;
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
    if (configuracionPuntos.penales.activo && esVuelta(partido) && partido.resultado?.ganador) {
        const clave = `${partido.liga}_${partido.equipo1}_vs_${partido.equipo2}_vuelta_penales`;
        const penales = localStorage.getItem(clave);
        
        if (penales) {
            const [pl, pv] = penales.split("-").map(Number);
            const ganadorPronosticado = pl > pv ? "local" : pl < pv ? "visitante" : "empate";

            if (ganadorPronosticado === partido.resultado.ganador) {
                puntos += configuracionPuntos.penales.puntos;
            }
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

function esIda(partido) {
    return partido.instancia === "ida";
}

function esVuelta(partido) {
    return partido.instancia === "vuelta";
}

function esUnica(partido) {
    return partido.instancia === "unica";
}
function necesitaPenales(partido, claveIda, claveVuelta) {
    if (!esVuelta(partido)) return false;
    if (!partido.fase) return false;

    const global = obtenerGlobalPronostico(claveIda, claveVuelta);
    if (!global) return false;

    return global.local === global.visitante;
}

// Ejecutar al cargar la pagina
document.addEventListener("DOMContentLoaded", renderizarPartidosSemana);