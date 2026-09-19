/* ==========================================================================
   RefSim — Menú Principal (hub.js)
   ========================================================================== */

(function () {
    "use strict";

    function pintarResumen() {
        const st = window.RefSim.estado;
        const precision = st.totalJugadas > 0 ? Math.round((st.aciertos / st.totalJugadas) * 100) : 0;

        const elPuntos = document.getElementById("resumen-puntos");
        const elPrecision = document.getElementById("resumen-precision");
        const elRacha = document.getElementById("resumen-racha");
        if (elPuntos) elPuntos.textContent = st.puntos;
        if (elPrecision) elPrecision.textContent = `${precision}%`;
        if (elRacha) elRacha.textContent = st.racha;

        const avisoInvitado = document.getElementById("aviso-invitado");
        if (avisoInvitado) avisoInvitado.classList.toggle("oculto", !!window.RefSim.usuario);
    }

    document.addEventListener("DOMContentLoaded", () => {
        pintarResumen();
        document.addEventListener("refsim:progreso-cargado", pintarResumen);
        document.addEventListener("refsim:idioma-cambiado", pintarResumen);
    });
})();
