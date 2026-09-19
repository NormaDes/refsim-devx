/* ==========================================================================
   RefSim — Página "Mis Partidos" (estadisticas.js)
   ========================================================================== */

(function () {
    "use strict";

    function t() { return window.RefSim.t(); }

    function pintarResumen() {
        const st = window.RefSim.estado;
        const precision = st.totalJugadas > 0 ? Math.round((st.aciertos / st.totalJugadas) * 100) : 0;

        const map = {
            "resumen-puntos": st.puntos,
            "resumen-precision": `${precision}%`,
            "resumen-racha": st.racha,
            "resumen-max-racha": st.maxRacha,
            "resumen-jugadas": st.totalJugadas
        };
        Object.keys(map).forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.textContent = map[id];
        });

        const cajaInvitado = document.getElementById("caja-login-cta");
        if (cajaInvitado) {
            cajaInvitado.classList.toggle("oculto", !!window.RefSim.usuario);
        }
    }

    async function pintarHistorial() {
        const contenedor = document.getElementById("contenido-lista-historial");
        if (!contenedor) return;
        const txt = t();

        if (!window.RefSim.usuario || !window.refSimFirebase) {
            contenedor.innerHTML = `<p class="hist-vacio">${txt.statsSinExamenes}</p>`;
            const numExamenes = document.getElementById("resumen-examenes");
            if (numExamenes) numExamenes.textContent = "0";
            return;
        }

        contenedor.innerHTML = `<p class="hist-vacio">${txt.statsCargando}</p>`;

        const { db, doc, getDoc } = window.refSimFirebase;
        let listaExamenes = [];
        try {
            const snap = await getDoc(doc(db, "usuarios", window.RefSim.usuario.uid));
            if (snap.exists() && snap.data().historialExamenes) {
                listaExamenes = snap.data().historialExamenes;
            }
        } catch (e) {
            console.error("Error al leer historial:", e);
        }

        const numExamenes = document.getElementById("resumen-examenes");
        if (numExamenes) numExamenes.textContent = listaExamenes.length;

        if (listaExamenes.length === 0) {
            contenedor.innerHTML = `<p class="hist-vacio">${txt.statsSinExamenes}</p>`;
            return;
        }

        let html = "";
        [...listaExamenes].reverse().forEach((ex, idx) => {
            const fechaFormateada = new Date(ex.fecha).toLocaleDateString() + " " +
                new Date(ex.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const clase = ex.porcentaje >= 70 ? "hist-item--ok" : "hist-item--fail";
            html += `
                <div class="hist-item ${clase}">
                    <div class="hist-item__cabecera">
                        <strong>${txt.statsExamenNum} #${listaExamenes.length - idx}</strong>
                        <span class="hist-item__nota">${ex.porcentaje}% (${ex.aciertos}/${ex.total})</span>
                    </div>
                    <p class="hist-item__meta">${txt.statsFecha}: ${fechaFormateada} · ${txt.statsTiempo}: ${Math.floor(ex.tiempoSegundos / 60)}m ${ex.tiempoSegundos % 60}s</p>
                </div>
            `;
        });
        contenedor.innerHTML = html;
    }

    function refrescarTodo() {
        pintarResumen();
        pintarHistorial();
    }

    document.addEventListener("DOMContentLoaded", () => {
        refrescarTodo();
        document.addEventListener("refsim:progreso-cargado", refrescarTodo);
        document.addEventListener("refsim:idioma-cambiado", refrescarTodo);
    });
})();
