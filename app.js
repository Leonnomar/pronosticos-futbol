async function cargarDatos() {
    const res = await fetch("data.json");
    const datos = await res.json();

    const container = document.getElementById("partidos-container");

    datos.partidos.forEach((partidos) => {
        const div = document.createElement("div");
        div.className = "partido";
        div.innerHTML = `<strong>${partidos.local}</strong> vs <strong>${partido.visitante}</strong><br />
        Resultado real: ${partido.resultado}`; 
        container.appendChild(div);
    });
}
cargarDatos();