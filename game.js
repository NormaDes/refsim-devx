/* ==========================================================================
   RefSim — Motor de juego (game.js)
   --------------------------------------------------------------------------
   Compartido por modo-practica.html y modo-examen.html. Requiere que la
   página haya cargado, en este orden:
     1. common.js        (estado, i18n, tema, cabecera)
     2. game-data.js      (situacionesDB)
     3. una etiqueta <script> inline que fije window.REFSIM_MODO a
        "practica" o "examen" ANTES de este archivo.
   ========================================================================== */

(function () {
    "use strict";

    const MODO = window.REFSIM_MODO === "examen" ? "examen" : "practica";
    const CAMPO_REF = { ancho: 760, alto: 450 };

    let situacionActual = null;
    let marcadorActual = null;
    let indicesDisponibles = [];

    // Estado específico del Modo Examen
    let preguntasExamen = [];
    let indiceExamenActual = 0;
    let historialExamenActual = [];
    let tiempoExamenSegundos = 0;
    let timerInterval = null;
    let examenEnCurso = false;

    function t() { return window.RefSim.t(); }
    function estado() { return window.RefSim.estado; }

    // ----------------------------------------------------------------------
    // SELECCIÓN Y RENDER DE JUGADAS
    // ----------------------------------------------------------------------
    function cargarNuevaSituacion() {
        if (marcadorActual) {
            marcadorActual.remove();
            marcadorActual = null;
        }

        const panelFeedback = document.getElementById("panel-feedback");
        if (panelFeedback) {
            panelFeedback.classList.add("oculto");
            panelFeedback.classList.remove("acierto", "fallo");
        }

        const botonesOpcion = document.querySelectorAll(".btn-opcion");
        botonesOpcion.forEach((btn) => {
            btn.disabled = false;
            btn.classList.remove("es-correcta", "es-elegida-fallo");
        });

        if (MODO === "examen") {
            if (indiceExamenActual >= preguntasExamen.length) {
                finalizarExamenOficial();
                return;
            }
            situacionActual = preguntasExamen[indiceExamenActual];
        } else {
            if (indicesDisponibles.length === 0) {
                indicesDisponibles = Array.from({ length: situacionesDB.length }, (_, i) => i);
                for (let i = indicesDisponibles.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [indicesDisponibles[i], indicesDisponibles[j]] = [indicesDisponibles[j], indicesDisponibles[i]];
                }
            }
            const indiceAleatorio = indicesDisponibles.pop();
            situacionActual = situacionesDB[indiceAleatorio];
        }

        const idSituacion = document.getElementById("situacion-id");
        const idSituacionPanel = document.getElementById("situacion-id-panel");
        const tituloSituacion = document.getElementById("situacion-titulo");
        const descripcionSituacion = document.getElementById("situacion-descripcion");

        const prefixNum = MODO === "examen"
            ? `${t().examenProgreso} ${indiceExamenActual + 1}/${preguntasExamen.length}`
            : `${t().jugada} #${situacionActual.id}`;
        if (idSituacion) idSituacion.textContent = prefixNum;
        if (idSituacionPanel) idSituacionPanel.textContent = prefixNum;

        const idioma = window.RefSim.idioma;
        if (tituloSituacion) {
            tituloSituacion.textContent = (idioma === "eu" && situacionActual.tipoEu) ? situacionActual.tipoEu : situacionActual.tipo;
        }
        if (descripcionSituacion) {
            descripcionSituacion.textContent = (idioma === "eu" && situacionActual.descripcionEu) ? situacionActual.descripcionEu : situacionActual.descripcion;
        }

        colocarMarcador(situacionActual.posX, situacionActual.posY);
        actualizarMetaJugada(situacionActual);

        if (MODO === "examen") actualizarProgresoExamenUI();
    }

    function calcularZonaJugada(x, y) {
        const cercaPorteria = x < 90 || x > (CAMPO_REF.ancho - 90);
        const cercaCentroVertical = y > CAMPO_REF.alto * 0.18 && y < CAMPO_REF.alto * 0.82;
        if (cercaPorteria && cercaCentroVertical) return "zonaArea";
        if (x < CAMPO_REF.ancho * 0.38) return "zonaDefensiva";
        if (x > CAMPO_REF.ancho * 0.62) return "zonaOfensiva";
        return "zonaMedio";
    }

    function calcularContextoJugada(situacion) {
        const decision = situacion.decisionCorrecta;
        if (decision === "Fuera de juego") return "ctxOffside";
        if (decision.includes("Penalti")) return "ctxArea";
        if (decision === "Gol") return "ctxGol";
        return "ctxDisputa";
    }

    function actualizarMetaJugada(situacion) {
        const txt = t();
        const elMinuto = document.getElementById("meta-minuto");
        const elZona = document.getElementById("meta-zona");
        const elContexto = document.getElementById("meta-contexto");

        const minuto = ((situacion.id * 17) % 90) + 1;
        if (elMinuto) elMinuto.textContent = `${minuto}'`;

        const claveZona = calcularZonaJugada(situacion.posX, situacion.posY);
        if (elZona) { elZona.textContent = txt[claveZona]; elZona.dataset.clave = claveZona; }

        const claveContexto = calcularContextoJugada(situacion);
        if (elContexto) { elContexto.textContent = txt[claveContexto]; elContexto.dataset.clave = claveContexto; }
    }

    function colocarMarcador(x, y) {
        const campo = document.getElementById("campo");
        if (!campo) return;
        marcadorActual = document.createElement("div");
        marcadorActual.classList.add("marcador-accion");
        marcadorActual.style.left = `${(x / CAMPO_REF.ancho) * 100}%`;
        marcadorActual.style.top = `${(y / CAMPO_REF.alto) * 100}%`;
        campo.appendChild(marcadorActual);
    }

    // ----------------------------------------------------------------------
    // EVALUACIÓN DE DECISIONES
    // ----------------------------------------------------------------------
    function evaluarDecision(event) {
        if (!situacionActual) return;

        const decisionElegida = event.currentTarget.getAttribute("data-decision");
        const txt = t();
        const botonesOpcion = document.querySelectorAll(".btn-opcion");
        const esAcierto = (decisionElegida.trim() === situacionActual.decisionCorrecta.trim());
        const idioma = window.RefSim.idioma;

        if (MODO === "examen") {
            historialExamenActual.push({
                id: situacionActual.id,
                enunciado: (idioma === "eu" && situacionActual.tipoEu) ? situacionActual.tipoEu : situacionActual.tipo,
                tuRespuesta: decisionElegida,
                respuestaCorrecta: situacionActual.decisionCorrecta,
                explicacion: (idioma === "eu" && situacionActual.explicacionEu) ? situacionActual.explicacionEu : situacionActual.explicacion,
                acertado: esAcierto
            });
            indiceExamenActual++;
            cargarNuevaSituacion();
            return;
        }

        botonesOpcion.forEach((btn) => {
            btn.disabled = true;
            if (btn.getAttribute("data-decision") === situacionActual.decisionCorrecta) {
                btn.classList.add("es-correcta");
            }
        });

        const panelFeedback = document.getElementById("panel-feedback");
        const resultadoFeedback = document.getElementById("feedback-resultado");
        const explicacionFeedback = document.getElementById("feedback-explicacion");

        if (panelFeedback) panelFeedback.classList.remove("oculto", "acierto", "fallo");

        const st = estado();
        st.totalJugadas++;

        if (esAcierto) {
            st.aciertos++;
            st.racha++;
            if (st.racha > st.maxRacha) st.maxRacha = st.racha;
            const puntosGanados = 100 + (st.racha > 1 ? (st.racha - 1) * 20 : 0);
            st.puntos += puntosGanados;

            if (panelFeedback) panelFeedback.classList.add("acierto");
            if (resultadoFeedback) resultadoFeedback.textContent = `${txt.aciertoMsg} (+${puntosGanados} pts)`;
        } else {
            st.racha = 0;
            event.currentTarget.classList.add("es-elegida-fallo");
            if (panelFeedback) panelFeedback.classList.add("fallo");
            const nombreOficial = txt.nombreDecision[situacionActual.decisionCorrecta] || situacionActual.decisionCorrecta;
            if (resultadoFeedback) resultadoFeedback.textContent = `${txt.falloMsg} (${txt.decisionOficial} ${nombreOficial})`;
        }

        const explicacionFinal = (idioma === "eu" && situacionActual.explicacionEu) ? situacionActual.explicacionEu : situacionActual.explicacion;
        if (explicacionFeedback) explicacionFeedback.textContent = explicacionFinal;

        window.RefSim.actualizarMarcadorInterfaz();
        window.RefSim.guardarProgresoNubeAuto();
    }

    // ----------------------------------------------------------------------
    // MODO EXAMEN: cronómetro, progreso, acta final
    // ----------------------------------------------------------------------
    function actualizarProgresoExamenUI() {
        const relojEl = document.getElementById("reloj-examen");
        if (relojEl) relojEl.style.display = "inline-flex";
    }

    function actualizarRelojUI() {
        const relojEl = document.getElementById("reloj-examen");
        if (!relojEl) return;
        const mins = Math.floor(tiempoExamenSegundos / 60).toString().padStart(2, "0");
        const secs = (tiempoExamenSegundos % 60).toString().padStart(2, "0");
        relojEl.textContent = `⏱️ ${mins}:${secs}`;
    }

    function iniciarModoExamenOficial() {
        examenEnCurso = true;
        indiceExamenActual = 0;
        historialExamenActual = [];
        tiempoExamenSegundos = 0;
        preguntasExamen = [...situacionesDB].sort(() => Math.random() - 0.5).slice(0, 25);

        const intro = document.getElementById("examen-intro");
        if (intro) intro.classList.add("oculto");
        const juego = document.getElementById("examen-juego");
        if (juego) juego.classList.remove("oculto");
        const resultados = document.getElementById("panel-resultados-examen");
        if (resultados) resultados.remove();

        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            tiempoExamenSegundos++;
            actualizarRelojUI();
        }, 1000);

        cargarNuevaSituacion();
    }

    async function guardarExamenEnNube(aciertos, total, porcentaje, segundos, detalle) {
        const usuario = window.RefSim.usuario;
        if (!usuario || !window.refSimFirebase) return;
        const { db, doc, setDoc, getDoc, updateDoc, arrayUnion } = window.refSimFirebase;
        try {
            const docRef = doc(db, "usuarios", usuario.uid);
            const docSnap = await getDoc(docRef);
            const nuevoExamen = {
                fecha: new Date().toISOString(),
                aciertos: Number(aciertos),
                total: Number(total),
                porcentaje: Number(porcentaje),
                tiempoSegundos: Number(segundos),
                detalle: Array.isArray(detalle) ? detalle : []
            };
            if (!docSnap.exists()) {
                await setDoc(docRef, { historialExamenes: [nuevoExamen] }, { merge: true });
            } else {
                await updateDoc(docRef, { historialExamenes: arrayUnion(nuevoExamen) });
            }
        } catch (e) {
            console.error("Error al guardar historial en Firebase:", e);
        }
    }

    function finalizarExamenOficial() {
        if (timerInterval) clearInterval(timerInterval);
        examenEnCurso = false;

        const txt = t();
        const total = historialExamenActual.length;
        const aciertos = historialExamenActual.filter((h) => h.acertado).length;
        const porcentaje = total > 0 ? Math.round((aciertos / total) * 100) : 0;

        const juego = document.getElementById("examen-juego");
        if (juego) juego.classList.add("oculto");

        const contenedor = document.getElementById("examen-resultados-host");
        if (!contenedor) return;

        guardarExamenEnNube(aciertos, total, porcentaje, tiempoExamenSegundos, historialExamenActual);

        const mins = Math.floor(tiempoExamenSegundos / 60);
        const secs = tiempoExamenSegundos % 60;

        let htmlRevision = `
            <div id="panel-resultados-examen" class="acta">
                <h2 class="acta__titulo">${txt.examenActaTitulo}</h2>
                <p class="acta__linea">${txt.examenPuntuacion}: <strong>${aciertos} / ${total}</strong> ${txt.examenAciertos} (<strong>${porcentaje}%</strong>)</p>
                <p class="acta__linea acta__linea--tenue">${txt.examenTiempo}: ${mins}m ${secs}s</p>
                <h3 class="acta__subtitulo">${txt.examenRevisionTitulo}</h3>
                <div class="acta__lista">
        `;

        historialExamenActual.forEach((item, index) => {
            const clase = item.acertado ? "acta__item--ok" : "acta__item--fail";
            const icono = item.acertado ? "✅" : "❌";
            htmlRevision += `
                <div class="acta__item ${clase}">
                    <p class="acta__item-titulo"><strong>#${index + 1} — ${item.enunciado}</strong> ${icono}</p>
                    <p class="acta__item-detalle">${txt.examenTuEleccion}: <em>${item.tuRespuesta}</em> · ${txt.examenOficialIfab}: <strong>${item.respuestaCorrecta}</strong></p>
                    <p class="acta__item-explicacion">📖 ${item.explicacion}</p>
                </div>
            `;
        });

        htmlRevision += `
                </div>
                <div class="acta__acciones">
                    <button type="button" id="btn-repetir-examen" class="btn-siguiente">${txt.btnRepetirExamen}</button>
                    <a href="estadisticas.html" class="btn-auth btn-auth--secundario acta__link-historial">${txt.btnVerHistorial}</a>
                </div>
            </div>
        `;

        contenedor.innerHTML = htmlRevision;
        contenedor.classList.remove("oculto");

        document.getElementById("btn-repetir-examen").addEventListener("click", () => {
            contenedor.classList.add("oculto");
            const juego2 = document.getElementById("examen-juego");
            if (juego2) juego2.classList.remove("oculto");
            iniciarModoExamenOficial();
        });
    }

    // ----------------------------------------------------------------------
    // TRADUCCIÓN DE LOS BOTONES DE DECISIÓN Y CONTENIDO DE JUGADA
    // ----------------------------------------------------------------------
    function aplicarTraduccionesJuego() {
        const txt = t();
        const botonesOpcion = document.querySelectorAll(".btn-opcion");
        if (botonesOpcion.length >= 8) {
            const contenidoDecision = (glyphHtml, titulo, desc, tecla) => `
                ${glyphHtml}
                <span class="decision__texto">
                    <span class="decision__titulo">${titulo}</span>
                    <span class="decision__desc">${desc}</span>
                </span>
                <span class="decision__tecla" aria-hidden="true">${tecla}</span>
            `;
            botonesOpcion[0].innerHTML = contenidoDecision('<span class="decision__glyph" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12.5L10 17.5L19 6.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>', txt.btnNoFalta, txt.btnNoFaltaDesc, 1);
            botonesOpcion[1].innerHTML = contenidoDecision('<span class="decision__glyph" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.2"/><path d="M12 7v6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="16.3" r="1.15" fill="currentColor"/></svg></span>', txt.btnFalta, txt.btnFaltaDesc, 2);
            botonesOpcion[2].innerHTML = contenidoDecision('<span class="decision__card" aria-hidden="true"></span>', txt.btnAmarilla, txt.btnAmarillaDesc, 3);
            botonesOpcion[3].innerHTML = contenidoDecision('<span class="decision__card" aria-hidden="true"></span>', txt.btnRoja, txt.btnRojaDesc, 4);
            botonesOpcion[4].innerHTML = contenidoDecision('<span class="decision__card" aria-hidden="true" style="background:var(--papel)"></span>', txt.btnPenalti, txt.btnPenaltiDesc, 5);
            botonesOpcion[5].innerHTML = contenidoDecision('<span class="decision__card" aria-hidden="true" style="background:var(--amarilla)"></span>', txt.btnPenaltiAmarilla, txt.btnPenaltiAmarillaDesc, 6);
            botonesOpcion[6].innerHTML = contenidoDecision('<span class="decision__glyph" aria-hidden="true">⚽</span>', txt.btnGol, txt.btnGolDesc, 7);
            botonesOpcion[7].innerHTML = contenidoDecision('<span class="decision__glyph" aria-hidden="true">🚩</span>', txt.btnFueraDeJuego, txt.btnFueraDeJuegoDesc, 8);
        }

        const btnSig = document.getElementById("btn-nueva-situacion");
        if (btnSig) btnSig.textContent = txt.btnSiguiente;

        const varText = document.querySelector(".monitor__bar span:last-child");
        if (varText) varText.textContent = txt.varRepeticion;

        if (situacionActual) {
            const idioma = window.RefSim.idioma;
            const tituloSituacion = document.getElementById("situacion-titulo");
            const descripcionSituacion = document.getElementById("situacion-descripcion");
            if (tituloSituacion) tituloSituacion.textContent = (idioma === "eu" && situacionActual.tipoEu) ? situacionActual.tipoEu : situacionActual.tipo;
            if (descripcionSituacion) descripcionSituacion.textContent = (idioma === "eu" && situacionActual.descripcionEu) ? situacionActual.descripcionEu : situacionActual.descripcion;

            const nuevoPrefix = MODO === "examen"
                ? `${txt.examenProgreso} ${indiceExamenActual + 1}/${preguntasExamen.length}`
                : `${txt.jugada} #${situacionActual.id}`;
            const idSituacion = document.getElementById("situacion-id");
            const idSituacionPanel = document.getElementById("situacion-id-panel");
            if (idSituacion) idSituacion.textContent = nuevoPrefix;
            if (idSituacionPanel) idSituacionPanel.textContent = nuevoPrefix;

            actualizarMetaJugada(situacionActual);
        }
    }

    // ----------------------------------------------------------------------
    // INICIALIZACIÓN DE LA PÁGINA DE JUEGO
    // ----------------------------------------------------------------------
    document.addEventListener("DOMContentLoaded", () => {
        const botonesOpcion = document.querySelectorAll(".btn-opcion");
        botonesOpcion.forEach((boton) => boton.addEventListener("click", evaluarDecision));

        document.addEventListener("keydown", (e) => {
            const enCampoDeTexto = document.activeElement && ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);
            if (enCampoDeTexto) return;
            const indice = parseInt(e.key, 10) - 1;
            if (Number.isNaN(indice) || indice < 0 || indice >= botonesOpcion.length) return;
            const boton = botonesOpcion[indice];
            if (boton && !boton.disabled && boton.offsetParent !== null) boton.click();
        });

        document.addEventListener("refsim:idioma-cambiado", aplicarTraduccionesJuego);

        if (MODO === "practica") {
            cargarNuevaSituacion();
            const botonNuevaSituacion = document.getElementById("btn-nueva-situacion");
            if (botonNuevaSituacion) botonNuevaSituacion.addEventListener("click", cargarNuevaSituacion);
        } else {
            const btnComenzar = document.getElementById("btn-comenzar-examen");
            if (btnComenzar) btnComenzar.addEventListener("click", iniciarModoExamenOficial);
        }

        const btnJugadaSiguiente = document.getElementById("btn-jugada-siguiente");
        if (btnJugadaSiguiente) btnJugadaSiguiente.addEventListener("click", () => cargarNuevaSituacion());

        const btnFullscreen = document.getElementById("btn-fullscreen-monitor");
        if (btnFullscreen) {
            btnFullscreen.addEventListener("click", () => {
                const monitorEl = document.querySelector(".monitor");
                if (!monitorEl) return;
                if (!document.fullscreenElement) monitorEl.requestFullscreen?.();
                else document.exitFullscreen?.();
            });
        }

        window.addEventListener("beforeunload", (e) => {
            if (MODO === "examen" && examenEnCurso) {
                e.preventDefault();
                e.returnValue = "";
            }
        });

        // Aplica los textos de decisión / meta en el idioma ya activo al cargar.
        setTimeout(aplicarTraduccionesJuego, 0);
    });
})();
