const FASES_ELIMINACION = {
    GRUPOS: 1,
    DIECISEISAVOS: 2,
    OCTAVOS: 3,
    CUARTOS: 4,
    SEMIFINAL: 5,
    TERCERLUGAR: 6,
    FINAL: 7
}

const partidosSimulados = [
    {
        liga: "Liga MX",
        tipoTorneo: "liga",
        fase: "Jornada 6",
        ordenFase: 6,
        fecha: "2025-07-19T19:00:00",
        equipo1: "América",
        equipo2: "Guadalajara",
        instancia: "unica",
        resultado: "2-1"
    },
    {
        liga: "Liga MX",
        tipoTorneo: "liga",
        fase: "Jornada 7",
        ordenFase: 7,
        fecha: "2026-02-20T13:00:00",
        equipo1: "Tigres",
        equipo2: "Monterrey",
        instancia: "unica",
        liveData: {
            minuto: 67,
            marcador: "2 - 1",
            tiempo: "2T"
        }
    },
    {
        idSerie: "RM-MCI-CUARTOS-2025",
        liga: "Champions League",
        tipoTorneo: "eliminacion",
        fase: "cuartos",
        ordenFase: FASES_ELIMINACION.CUARTOS,
        instancia: "ida",
        fecha: "2026-07-18T14:00:00",
        equipo1: "Real Madrid",
        equipo2: "Manchester City",
        resultado: {
            marcador: "1-1",
            ganador: "empate"
        }
    },
    {
        idSerie: "RM-MCI-CUARTOS-2025",
        liga: "Champions League",
        tipoTorneo: "eliminacion",
        fase: "cuartos",
        ordenFase: FASES_ELIMINACION.CUARTOS,
        instancia: "vuelta",
        fecha: "2026-07-21T16:00:00",
        equipo1: "Manchester City",
        equipo2: "Real Madrid",
        resultado: {
            marcador: "3-1",
            ganador: "empate"
        }
    },
    {
        liga: "Champions League",
        tipoTorneo: "eliminacion",
        fase: "cuartos",
        ordenFase: FASES_ELIMINACION.CUARTOS,
        instancia: "vuelta",
        fecha: "2026-07-21T16:00:00",
        equipo1: "Barcelona",
        equipo2: "PSG",
        desbloqueado: false
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

            const clave = partido.idSerie
                ? `${partido.idSerie}_${partido.instancia}`
                : `${partido.liga}_${partido.equipo1}_vs_${partido.equipo2}_${partido.instancia}`;

            let estado = obtenerEstado(partido);
            
            // ===== TITULO =====
            const titulo = document.createElement("p");
            titulo.className = "font-semibold";
            titulo.textContent = `${partido.equipo1} vs ${partido.equipo2}`;

            // ===== BADGES =====
            const badges = document.createElement("div");
            badges.className = "flex gap-2 text-xs text-gray-600";

            if (partido.instancia !== "unica") {
                badges.appendChild(crearBadge(`${partido.fase.toUpperCase()} · ${partido.instancia.toUpperCase()}`));
            } 

            badges.appendChild(crearBadge(
                estado === "finalizado" ? "Finalizado" :
                estado === "en-juego" ? "En juego" : "Pendiente"
            ));
            
            info.append(titulo, badges);

            // ===== FECHA =====
            const fechaTxt = document.createElement("p");
            fechaTxt.className = "text-sm text-gray-500";
            fechaTxt.textContent = formatearFecha(partido.fecha)
            info.appendChild(fechaTxt);

            // ===== INPUTS =====
            const pronostico = crearInputsPronostico(clave, partido, estado);
            div.append(info, pronostico);

            const badgePronostico = obtenerBadgePronostico(partido, estado, partidosSimulados);
            badges.appendChild(crearBadge(badgePronostico.texto, badgePronostico.color));

            if (estado === "en-juego") {
                if (partido.liveData) {
                    badges.appendChild(crearBadge(
                        `🟢 EN VIVO · ${partido.liveData.minuto}'`
                    ));

                    const liveTxt = document.createElement("p");
                    liveTxt.className = "text-sm font-semibold text-red-600";
                    liveTxt.textContent = `${partido.equipo1} ${partido.liveData.marcador} ${partido.equipo2}`;
                    info.appendChild(liveTxt);
                }
            }

            // ===== PENALES (solo en vuelta) =====
            if (esVuelta(partido)) {
                const claveIda = `${partido.idSerie}_ida`;
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

                const textoAvanza = obtenerTextoAvanza(partido);

                if (textoAvanza) {
                    const avance = document.createElement("p");
                    avance.className = "text-sm font-semibold text-blue-600 mt-1";
                    avance.textContent = `🏆 ${textoAvanza}`;
                    info.appendChild(avance);
                }
            }
            
            seccion.appendChild(div);
        
        });

        main.appendChild(seccion);
    }
}

function obtenerEstado(partido) {
    const ahora = new Date();
    const fecha = new Date(partido.fecha);

    if (partido.resultado) return "finalizado";
    if (partido.liveData) return "en-juego";
    if (ahora >= fecha) return "en-juego";
    return "pendiente";
}

function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString("es-MX", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// Crear inputs
function crearInputsPronostico(clave, partido, estado) {
    const cont = document.createElement("div");
    cont.className = "flex items-center gap-2";

    const l = document.createElement("input");
    const v = document.createElement("input");

    const habilitado = estado === "pendiente" && puedePronosticar(partido, partidosSimulados);

    [l, v].forEach(i => {
        i.type = "number";
        i.min = 0;
        i.max = 20;
        i.className = "w-12 text-center border rounded";
        if (!habilitado) {
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
function crearBadge(texto, color = "bg-gray-100") {
    const span = document.createElement("span");
    span.textContent = texto;
    span.className = `px-2 py-1 ${color} rounded-full text-xs font-medium`;
    return span;
}

function obtenerBadgePronostico(partido, estado, partidosSimulados) {
    if (estado === "finalizado") {
        return { texto: "Pronóstico expirado", color: "bg-gray-200" };
    }

    if (estado === "en-juego") {
        return { texto: "Pronóstico cerrado", color: "bg-red-100" };
    }

    if (esVuelta(partido)) {
        if (partido.desbloqueado) {
            return { texto: "Desbloqueado por admin", color: "bg-blue-100" };
        }

        if (!idaFinalizada(partido, partidosSimulados)) {
            return { texto: "Esperando ida", color: "bg-yellow-100" };
        }
    }

    if (!faseAnteriorCerrada(partido)) {
        return { texto: "Fase anterior no finalizada", color: "bg-yellow-100" };
    }

    return { texto: "Pronóstico abierto", color: "bg-green-100" };
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
        const clave = `${partido.idSerie}_vuelta_penales`;
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

function obtenerGlobalPronostico(idSerie) {
    const ida = localStorage.getItem(`${idSerie}_ida`);
    const vuelta = localStorage.getItem(`${idSerie}_vuelta`);

    if (!ida || !vuelta) return null;

    const [iL, iV] = ida.split("-").map(Number);
    const [vL, vV] = vuelta.split("-").map(Number);

    return {
        local: iL + vL,
        visitante: iV + vV
    };
}

function obtenerGlobalReal(idSerie) {
    const partidosSerie = partidosSimulados.filter(p =>
        p.idSerie === idSerie && p.resultado
    );

    if (partidosSerie.length < 2) return null;

    let local = 0;
    let visitante = 0;

    partidosSerie.forEach(p => {
        const [gL, gV] = p.resultado.marcador.split("-").map(Number);
        local += gL;
        visitante += gV;
    });

    return { local, visitante };
}

function obtenerTextoAvanza(partido) {
    if (!esVuelta(partido) || !partido.idSerie || !partido.resultado) return null;

    const global = obtenerGlobalReal(partido.idSerie);
    if (!global) return null;

    let texto = "";

    if (global.local > global.visitante) {
        texto = `${partido.equipo1} avanzó`;
    } else if (global.visitante > global.local) {
        texto = `${partido.equipo2} avanzó`;
    } else if (partido.resultado.ganador) {
        const ganador = partido.resultado.ganador === "local"
            ? partido.equipo1
            : partido.equipo2;

        texto = `${ganador} avanzó en penales`;
    }

    return `${texto} · Global ${global.local} - ${global.visitante}`;
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
function necesitaPenales(partido) {
    if (!esVuelta(partido) || !partido.idSerie) return false;
    
    const global = obtenerGlobalPronostico(partido.idSerie);


    return global && global.local === global.visitante;
}

function idaFinalizada(partido, partidos) {
    if (!esVuelta(partido) || !partido.idSerie) return true;

    return partidos.some(p =>
        p.idSerie === partido.idSerie &&
        p.instancia === "ida" &&
        !!p.resultado
    );
}

function faseAnteriorCerrada(partido) {
    if (partido.ordenFase === 1) return true;

    const faseAnterior = partidosSimulados.filter(p =>
        p.liga === partido.liga &&
        p.ordenFase === partido.ordenFase - 1
    );

    if (faseAnterior.length === 0) return true;

    return faseAnterior.every(p => !!p.resultado);
}

function puedePronosticar(partido, partidosSimulados) {
    if (esUnica(partido)) return true;
    if (esIda(partido)) return faseAnteriorCerrada(partido);
    if (esVuelta(partido)) {
        if (partido.desbloqueado) return true;
        return idaFinalizada(partido, partidosSimulados) && faseAnteriorCerrada(partido);
    }

    return false;
}

// Ejecutar al cargar la pagina
document.addEventListener("DOMContentLoaded", renderizarPartidosSemana);

