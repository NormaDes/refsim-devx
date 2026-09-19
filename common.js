/* ==========================================================================
   RefSim — Núcleo compartido (common.js)
   --------------------------------------------------------------------------
   Cargado en TODAS las páginas. Se encarga de:
   - Estado global de progreso (puntos, precisión, racha) con persistencia
     local (invitado) y en la nube (Firebase, si hay sesión).
   - Selector de idioma (Castellano / Euskera) y diccionario i18n.
   - Selector de tema visual (white-label).
   - Cabecera: navegación activa, modal de acceso/autenticación.
   Expone `window.RefSim` con lo necesario para que game.js / hub.js /
   estadisticas.js construyan sobre esta base sin duplicar lógica.
   ========================================================================== */

(function () {
    "use strict";

    // ----------------------------------------------------------------------
    // 0. ESTADO GLOBAL
    // ----------------------------------------------------------------------
    let idiomaActual = localStorage.getItem("refsim_idioma") || "es";
    let temaActual = localStorage.getItem("refsim_tema") || "clasico";
    let usuarioFirebaseActual = null;
    let usuarioState = { puntos: 0, aciertos: 0, totalJugadas: 0, racha: 0, maxRacha: 0 };

    const TEMAS_VALIDOS = ["clasico", "atlantico", "granate"];

    // ----------------------------------------------------------------------
    // 1. DICCIONARIO DE IDIOMAS
    // ----------------------------------------------------------------------
    const traducciones = {
        es: {
            tagSimulador: "Simulador arbitral · Reglas del Juego IFAB",
            lblPuntos: "Puntos",
            lblPrecision: "Precisión",
            lblRacha: "Racha",
            btnAcceso: "Acceso",
            authCerrarSesion: "Cerrar sesión",

            navInicio: "Inicio",
            navPractica: "Práctica",
            navExamen: "Examen",
            navEstadisticas: "Estadísticas",

            temaLabel: "Tema",
            temaClasico: "Clásico",
            temaAtlantico: "Atlántico",
            temaGranate: "Granate",

            authTitulo: "Acceso a RefSim",
            authIntro: "Entra para guardar tus puntos y tu racha en cualquier dispositivo.",
            authEmail: "Correo electrónico",
            authPassword: "Contraseña",
            authLogin: "Iniciar sesión",
            authRegister: "Crear cuenta",
            authOk: "Sesión iniciada",
            authCreada: "Cuenta creada",
            authError: "No se ha podido completar:",
            authFederado: "Acceso federado / marca blanca disponible para escuelas de árbitros. Contacta con soporte para integrarlo con tu propio dominio.",

            heroKicker: "Plataforma de formación arbitral",
            heroTitulo: "Entrena tus decisiones como en la sala VAR",
            heroSubtitulo: "Casos reales basados en las Reglas del Juego de la IFAB, en Castellano y Euskera, listos para tu escuela de árbitros.",
            heroCtaPrincipal: "Empezar práctica rápida",
            heroCtaSecundaria: "Ver Examen Oficial",

            resumenTitulo: "Tu progreso",
            resumenPuntos: "Puntos totales",
            resumenPrecision: "Precisión global",
            resumenRacha: "Racha actual",
            resumenInvitado: "Estás jugando como invitado. Inicia sesión para guardar tu progreso en la nube.",

            modoPracticaTitulo: "Práctica Rápida",
            modoPracticaDesc: "Jugadas aleatorias, feedback inmediato y explicación reglamentaria tras cada decisión.",
            modoExamenTitulo: "Examen Oficial (25)",
            modoExamenDesc: "Simulacro cronometrado de 25 jugadas sin repetición, con acta final descargable en pantalla.",
            modoEstadisticasTitulo: "Mis Partidos",
            modoEstadisticasDesc: "Consulta tu historial de exámenes, tu precisión y tu evolución como árbitro.",
            modoEmpezar: "Empezar",
            modoVer: "Ver",

            breadcrumbInicio: "Inicio",
            volverInicio: "← Volver al inicio",

            jugada: "Jugada",
            varRepeticion: "VAR · Repetición de la jugada",

            btnNoFalta: "No hay falta",
            btnFalta: "Falta",
            btnAmarilla: "Falta + Amarilla",
            btnRoja: "Falta + Roja",
            btnPenalti: "Penalti",
            btnPenaltiAmarilla: "Penalti + Amarilla",
            btnGol: "Gol",
            btnFueraDeJuego: "Fuera de juego",
            btnSiguiente: "Siguiente jugada",

            btnNoFaltaDesc: "El contacto es legal, no es motivo de sanción.",
            btnFaltaDesc: "Infracción sancionable con tiro libre directo.",
            btnAmarillaDesc: "Es una falta imprudente o táctica.",
            btnRojaDesc: "Juego brusco grave o fuerza excesiva.",
            btnPenaltiDesc: "Infracción dentro del área que impide el juego.",
            btnPenaltiAmarillaDesc: "Infracción imprudente cometida en el área.",
            btnGolDesc: "El balón cruzó la línea de meta reglamentariamente.",
            btnFueraDeJuegoDesc: "Posición antirreglamentaria al recibir el balón.",

            aciertoMsg: "Decisión correcta",
            falloMsg: "Decisión incorrecta",
            decisionOficial: "Decisión oficial:",

            nombreDecision: {
                "No hay falta": "No hay falta",
                "Falta": "Falta",
                "Falta + Tarjeta Amarilla": "Falta + tarjeta amarilla",
                "Falta + Tarjeta Roja": "Falta + tarjeta roja",
                "Penalti": "Penalti",
                "Penalti + Tarjeta Amarilla": "Penalti + tarjeta amarilla",
                "Gol": "Gol",
                "Fuera de juego": "Fuera de juego"
            },

            metaMinuto: "Minuto",
            metaZona: "Zona de la jugada",
            metaContexto: "Contexto",

            zonaDefensiva: "Zona defensiva",
            zonaMedio: "Medio campo",
            zonaOfensiva: "Zona ofensiva",
            zonaArea: "Área de penalti",

            ctxOffside: "Ataque en posición adelantada",
            ctxArea: "Disputa dentro del área",
            ctxGol: "Finalización a portería",
            ctxDisputa: "Disputa del balón",

            tickerMsg: "Sigue entrenando. Cada decisión cuenta.",

            examenIntroTitulo: "Examen Oficial · 25 jugadas",
            examenIntroDesc: "Un simulacro de examen real: 25 jugadas aleatorias sin repetición, cronómetro en marcha y sin pistas intermedias. Al terminar recibirás tu acta con la revisión completa.",
            examenRegla1: "25 jugadas seleccionadas al azar del banco IFAB, sin repetir.",
            examenRegla2: "No hay feedback tras cada jugada: lo verás todo en el acta final.",
            examenRegla3: "El cronómetro corre durante todo el examen.",
            examenRegla4: "Tu resultado se guarda en «Mis Partidos» si has iniciado sesión.",
            btnComenzarExamen: "Comenzar examen",
            examenProgreso: "Jugada",
            examenActaTitulo: "📋 Acta Oficial de Examen",
            examenPuntuacion: "Puntuación",
            examenAciertos: "aciertos",
            examenTiempo: "Tiempo empleado",
            examenRevisionTitulo: "Revisión detallada de tus respuestas",
            examenTuEleccion: "Tu elección",
            examenOficialIfab: "Oficial IFAB",
            btnRepetirExamen: "Hacer nuevo examen",
            btnVerHistorial: "Ver historial completo",

            statsTitulo: "Mis Partidos",
            statsSubtitulo: "Tu evolución como árbitro, jugada a jugada.",
            statsPuntosTotales: "Puntos totales",
            statsPrecisionGlobal: "Precisión global",
            statsRachaActual: "Racha actual",
            statsMejorRacha: "Mejor racha",
            statsJugadasTotales: "Jugadas resueltas",
            statsExamenesRealizados: "Exámenes realizados",
            statsHistorialTitulo: "Historial de exámenes",
            statsSinExamenes: "Todavía no has completado ningún Examen Oficial. Cuando lo hagas, aparecerá aquí con su acta completa.",
            statsLoginCtaTitulo: "Inicia sesión para no perder tu progreso",
            statsLoginCtaDesc: "Como invitado tus estadísticas solo se guardan en este dispositivo. Crea una cuenta gratuita para sincronizarlas en la nube.",
            statsLoginCtaBtn: "Iniciar sesión / Crear cuenta",
            statsExamenNum: "Examen",
            statsFecha: "Fecha",
            statsTiempo: "Tiempo",
            statsCargando: "Cargando tus exámenes…",

            footer: "© 2026 RefSim — Basado en las Reglas del Juego de la IFAB.",
            footerPrivacidad: "Política de Privacidad",
            footerContacto: "Contacto",
            adLabel: "Publicidad"
        },

        eu: {
            tagSimulador: "Arbitraje simulagailua · IFAB Jokoaren Arauak",
            lblPuntos: "Puntuak",
            lblPrecision: "Zehaztasuna",
            lblRacha: "Bolada",
            btnAcceso: "Sartu",
            authCerrarSesion: "Saioa itxi",

            navInicio: "Hasiera",
            navPractica: "Praktika",
            navExamen: "Azterketa",
            navEstadisticas: "Estatistikak",

            temaLabel: "Gaia",
            temaClasico: "Klasikoa",
            temaAtlantico: "Atlantikoa",
            temaGranate: "Granatea",

            authTitulo: "RefSim-erako sarbidea",
            authIntro: "Sartu zure puntuak eta bolada edozein gailutan gordetzeko.",
            authEmail: "Helbide elektronikoa",
            authPassword: "Pasahitza",
            authLogin: "Saioa hasi",
            authRegister: "Kontua sortu",
            authOk: "Saioa hasita",
            authCreada: "Kontua sortuta",
            authError: "Ezin izan da osatu:",
            authFederado: "Sarbide federatua / marka zuria eskuragarri arbitro eskoletarako. Jarri harremanetan laguntza-zerbitzuarekin zure domeinuarekin integratzeko.",

            heroKicker: "Arbitraje-prestakuntzarako plataforma",
            heroTitulo: "Trebatu zure erabakiak VAR gelan bezala",
            heroSubtitulo: "IFABen Jokoaren Arauetan oinarritutako benetako kasuak, Gaztelaniaz eta Euskaraz, zure arbitro-eskolarentzat prest.",
            heroCtaPrincipal: "Hasi praktika azkarra",
            heroCtaSecundaria: "Ikusi Azterketa Ofiziala",

            resumenTitulo: "Zure aurrerapena",
            resumenPuntos: "Puntu guztiak",
            resumenPrecision: "Zehaztasun orokorra",
            resumenRacha: "Uneko bolada",
            resumenInvitado: "Gonbidatu gisa ari zara jokatzen. Hasi saioa zure aurrerapena hodeian gordetzeko.",

            modoPracticaTitulo: "Praktika Azkarra",
            modoPracticaDesc: "Ausazko jokaldiak, berehalako feedbacka eta erabaki bakoitzaren araudi-azalpena.",
            modoExamenTitulo: "Azterketa Ofiziala (25)",
            modoExamenDesc: "25 jokaldiko simulazio kronometratua, errepikapenik gabe, azken agiriarekin.",
            modoEstadisticasTitulo: "Nire Partidak",
            modoEstadisticasDesc: "Kontsultatu zure azterketen historiala, zehaztasuna eta arbitro gisa duzun bilakaera.",
            modoEmpezar: "Hasi",
            modoVer: "Ikusi",

            breadcrumbInicio: "Hasiera",
            volverInicio: "← Hasierara itzuli",

            jugada: "Jokaldia",
            varRepeticion: "VAR · Jokaldiaren errepikapena",

            btnNoFalta: "Ez dago faltarik",
            btnFalta: "Falta",
            btnAmarilla: "Falta + Horia",
            btnRoja: "Falta + Gorria",
            btnPenalti: "Penaltia",
            btnPenaltiAmarilla: "Penaltia + Horia",
            btnGol: "Gola",
            btnFueraDeJuego: "Jokoz kanpo",
            btnSiguiente: "Hurrengo jokaldia",

            btnNoFaltaDesc: "Ukipena legezkoa da, ez du zigorrik behar.",
            btnFaltaDesc: "Jaurtiketa libre zuzenarekin zigortu beharreko arau-haustea.",
            btnAmarillaDesc: "Falta inprudentea edo taktikoa da.",
            btnRojaDesc: "Joko zakar larria edo gehiegizko indarra.",
            btnPenaltiDesc: "Árean jokoa eragozten duen arau-haustea.",
            btnPenaltiAmarillaDesc: "Árean egindako falta inprudentea.",
            btnGolDesc: "Baloiak ate-lerroa arauz gaindu du.",
            btnFueraDeJuegoDesc: "Baloia jaso duenean posizio ilegalean zegoen.",

            aciertoMsg: "Erabaki zuzena",
            falloMsg: "Erabaki okerra",
            decisionOficial: "Erabaki ofiziala:",

            nombreDecision: {
                "No hay falta": "Ez dago faltarik",
                "Falta": "Falta",
                "Falta + Tarjeta Amarilla": "Falta + txartel horia",
                "Falta + Tarjeta Roja": "Falta + txartel gorria",
                "Penalti": "Penaltia",
                "Penalti + Tarjeta Amarilla": "Penaltia + txartel horia",
                "Gol": "Gola",
                "Fuera de juego": "Jokoz kanpo"
            },

            metaMinuto: "Minutua",
            metaZona: "Jokaldiaren eremua",
            metaContexto: "Testuingurua",

            zonaDefensiva: "Defentsa eremua",
            zonaMedio: "Erdi zelaia",
            zonaOfensiva: "Eraso eremua",
            zonaArea: "Penalti eremua",

            ctxOffside: "Eraso jokoz kanpoko posizioan",
            ctxArea: "Eremuko lehia",
            ctxGol: "Ate aurreko amaiera",
            ctxDisputa: "Baloiaren lehia",

            tickerMsg: "Jarraitu trebatzen. Erabaki bakoitzak balio du.",

            examenIntroTitulo: "Azterketa Ofiziala · 25 jokaldi",
            examenIntroDesc: "Benetako azterketa baten simulazioa: 25 ausazko jokaldi errepikapenik gabe, kronometroa martxan eta bitarteko laguntzarik gabe. Amaitzean, berrikuspen osoarekin agiria jasoko duzu.",
            examenRegla1: "IFAB bankuko 25 jokaldi ausaz hautatuak, errepikatu gabe.",
            examenRegla2: "Ez dago feedbackik jokaldi bakoitzaren ondoren: guztia azken agirian ikusiko duzu.",
            examenRegla3: "Kronometroa azterketa osoan zehar dabil.",
            examenRegla4: "Zure emaitza «Nire Partidak» atalean gordeko da saioa hasi baduzu.",
            btnComenzarExamen: "Hasi azterketa",
            examenProgreso: "Jokaldia",
            examenActaTitulo: "📋 Azterketaren Agiri Ofiziala",
            examenPuntuacion: "Puntuazioa",
            examenAciertos: "asmatuak",
            examenTiempo: "Erabilitako denbora",
            examenRevisionTitulo: "Zure erantzunen berrikuspen zehatza",
            examenTuEleccion: "Zure aukera",
            examenOficialIfab: "IFAB Ofiziala",
            btnRepetirExamen: "Azterketa berria egin",
            btnVerHistorial: "Ikusi historial osoa",

            statsTitulo: "Nire Partidak",
            statsSubtitulo: "Zure bilakaera arbitro gisa, jokaldiz jokaldi.",
            statsPuntosTotales: "Puntu guztiak",
            statsPrecisionGlobal: "Zehaztasun orokorra",
            statsRachaActual: "Uneko bolada",
            statsMejorRacha: "Bolada onena",
            statsJugadasTotales: "Ebatzitako jokaldiak",
            statsExamenesRealizados: "Egindako azterketak",
            statsHistorialTitulo: "Azterketen historiala",
            statsSinExamenes: "Oraindik ez duzu Azterketa Ofizialik osatu. Egiten duzunean, hemen agertuko da bere agiri osoarekin.",
            statsLoginCtaTitulo: "Hasi saioa zure aurrerapena ez galtzeko",
            statsLoginCtaDesc: "Gonbidatu gisa, zure estatistikak gailu honetan bakarrik gordetzen dira. Sortu doako kontu bat hodeian sinkronizatzeko.",
            statsLoginCtaBtn: "Saioa hasi / Kontua sortu",
            statsExamenNum: "Azterketa",
            statsFecha: "Data",
            statsTiempo: "Denbora",
            statsCargando: "Zure azterketak kargatzen…",

            footer: "© 2026 RefSim — IFABen Jokoaren Arauetan oinarritua.",
            footerPrivacidad: "Pribatutasun Politika",
            footerContacto: "Kontaktua",
            adLabel: "Publizitatea"
        }
    };

    function t() {
        return traducciones[idiomaActual] || traducciones.es;
    }

    // ----------------------------------------------------------------------
    // 2. TEMA VISUAL (white-label)
    // ----------------------------------------------------------------------
    function aplicarTema(nombre) {
        if (!TEMAS_VALIDOS.includes(nombre)) nombre = "clasico";
        temaActual = nombre;
        localStorage.setItem("refsim_tema", nombre);
        if (nombre === "clasico") {
            document.documentElement.removeAttribute("data-tema");
        } else {
            document.documentElement.setAttribute("data-tema", nombre);
        }
        document.querySelectorAll("#selector-tema button").forEach((b) => {
            const activo = b.getAttribute("data-tema") === nombre;
            b.classList.toggle("is-activo", activo);
            b.setAttribute("aria-pressed", activo ? "true" : "false");
        });
    }

    // ----------------------------------------------------------------------
    // 3. PERSISTENCIA DE PROGRESO (local + nube)
    // ----------------------------------------------------------------------
    function guardarProgresoLocal() {
        try {
            localStorage.setItem("refsim_estado", JSON.stringify(usuarioState));
        } catch (e) { /* almacenamiento no disponible: seguimos solo en memoria */ }
    }

    function cargarProgresoLocal() {
        try {
            const crudo = localStorage.getItem("refsim_estado");
            if (crudo) {
                const datos = JSON.parse(crudo);
                usuarioState = Object.assign(usuarioState, datos);
            }
        } catch (e) { /* ignorar datos corruptos */ }
    }

    async function guardarProgresoNubeAuto() {
        guardarProgresoLocal();
        if (usuarioFirebaseActual && window.refSimFirebase) {
            const { db, doc, setDoc } = window.refSimFirebase;
            try {
                await setDoc(doc(db, "usuarios", usuarioFirebaseActual.uid), {
                    email: usuarioFirebaseActual.email,
                    puntos: usuarioState.puntos,
                    aciertos: usuarioState.aciertos,
                    totalJugadas: usuarioState.totalJugadas,
                    racha: usuarioState.racha,
                    maxRacha: usuarioState.maxRacha,
                    idioma: idiomaActual,
                    ultimaActualizacion: new Date()
                }, { merge: true });
            } catch (e) {
                console.error("Error al guardar en Firestore:", e);
            }
        }
    }

    async function cargarProgresoNube(uid) {
        if (!window.refSimFirebase) return;
        const { db, doc, getDoc } = window.refSimFirebase;
        try {
            const docRef = doc(db, "usuarios", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const datosCloud = docSnap.data();
                usuarioState.puntos = datosCloud.puntos || 0;
                usuarioState.aciertos = datosCloud.aciertos || 0;
                usuarioState.totalJugadas = datosCloud.totalJugadas || 0;
                usuarioState.racha = datosCloud.racha || 0;
                usuarioState.maxRacha = datosCloud.maxRacha || 0;
                if (datosCloud.idioma && datosCloud.idioma !== idiomaActual) {
                    idiomaActual = datosCloud.idioma;
                    localStorage.setItem("refsim_idioma", idiomaActual);
                    aplicarTraducciones();
                }
            } else {
                await guardarProgresoNubeAuto();
            }
            guardarProgresoLocal();
            actualizarMarcadorInterfaz();
            document.dispatchEvent(new CustomEvent("refsim:progreso-cargado"));
        } catch (e) {
            console.error("Error al cargar de Firestore:", e);
        }
    }

    function actualizarMarcadorInterfaz() {
        const statPuntos = document.getElementById("stat-puntos");
        const statPrecision = document.getElementById("stat-precision");
        const statRacha = document.getElementById("stat-racha");

        const precisionCalculada = usuarioState.totalJugadas > 0
            ? Math.round((usuarioState.aciertos / usuarioState.totalJugadas) * 100)
            : 0;

        if (statPuntos) statPuntos.textContent = usuarioState.puntos;
        if (statPrecision) {
            statPrecision.textContent = `${precisionCalculada}%`;
            const statCard = statPrecision.closest(".stat");
            if (statCard) statCard.style.setProperty("--valor-precision", `${precisionCalculada}%`);
        }
        if (statRacha) statRacha.textContent = usuarioState.racha;

        document.querySelectorAll("[data-stat='puntos']").forEach((el) => { el.textContent = usuarioState.puntos; });
        document.querySelectorAll("[data-stat='precision']").forEach((el) => { el.textContent = `${precisionCalculada}%`; });
        document.querySelectorAll("[data-stat='racha']").forEach((el) => { el.textContent = usuarioState.racha; });
        document.querySelectorAll("[data-stat='maxRacha']").forEach((el) => { el.textContent = usuarioState.maxRacha; });
        document.querySelectorAll("[data-stat='totalJugadas']").forEach((el) => { el.textContent = usuarioState.totalJugadas; });
    }

    // ----------------------------------------------------------------------
    // 4. TRADUCCIONES GENÉRICAS (cabecera, footer, data-i18n)
    // ----------------------------------------------------------------------
    function aplicarTraducciones() {
        const txt = t();

        document.querySelectorAll("[data-i18n]").forEach((el) => {
            const clave = el.getAttribute("data-i18n");
            if (txt[clave] !== undefined) el.textContent = txt[clave];
        });

        document.querySelectorAll("[data-i18n-html]").forEach((el) => {
            const clave = el.getAttribute("data-i18n-html");
            if (txt[clave] !== undefined) el.innerHTML = txt[clave];
        });

        document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
            const clave = el.getAttribute("data-i18n-placeholder");
            if (txt[clave] !== undefined) el.setAttribute("placeholder", txt[clave]);
        });

        const btnAcceso = document.getElementById("btn-abrir-auth");
        if (btnAcceso && !usuarioFirebaseActual) {
            const span = btnAcceso.querySelector("span");
            if (span) span.textContent = txt.btnAcceso; else btnAcceso.textContent = txt.btnAcceso;
        }

        document.querySelectorAll("#selector-idioma button").forEach((b) => {
            const activo = b.getAttribute("data-lang") === idiomaActual;
            b.classList.toggle("is-activo", activo);
            b.setAttribute("aria-pressed", activo ? "true" : "false");
        });

        const cerrarSesionBtn = document.getElementById("btn-cerrar-sesion");
        if (cerrarSesionBtn) cerrarSesionBtn.textContent = txt.authCerrarSesion;

        document.documentElement.lang = idiomaActual;
        document.dispatchEvent(new CustomEvent("refsim:idioma-cambiado"));
    }

    // ----------------------------------------------------------------------
    // 5. CABECERA: navegación activa, idioma, tema, modales
    // ----------------------------------------------------------------------
    function marcarNavActiva() {
        const pagina = document.body.getAttribute("data-pagina");
        if (!pagina) return;
        document.querySelectorAll(".navlink").forEach((link) => {
            link.classList.toggle("is-activo", link.getAttribute("data-nav") === pagina);
        });
    }

    function inicializarCabecera() {
        marcarNavActiva();

        const selectorIdioma = document.getElementById("selector-idioma");
        if (selectorIdioma) {
            selectorIdioma.addEventListener("click", (e) => {
                const boton = e.target.closest("button");
                if (!boton) return;
                idiomaActual = boton.getAttribute("data-lang");
                localStorage.setItem("refsim_idioma", idiomaActual);
                aplicarTraducciones();
                guardarProgresoNubeAuto();
            });
        }

        const selectorTema = document.getElementById("selector-tema");
        if (selectorTema) {
            selectorTema.addEventListener("click", (e) => {
                const boton = e.target.closest("button");
                if (!boton) return;
                aplicarTema(boton.getAttribute("data-tema"));
            });
        }

        const modalAuth = document.getElementById("auth-modal");
        const btnAbrirAuth = document.getElementById("btn-abrir-auth");
        const btnCerrarAuth = document.getElementById("btn-cerrar-auth");

        if (btnAbrirAuth && modalAuth) {
            btnAbrirAuth.addEventListener("click", () => { modalAuth.style.display = "flex"; });
        }
        if (btnCerrarAuth && modalAuth) {
            btnCerrarAuth.addEventListener("click", () => { modalAuth.style.display = "none"; });
        }
        window.addEventListener("click", (e) => {
            if (modalAuth && e.target === modalAuth) modalAuth.style.display = "none";
        });

        const verificarFirebaseInterval = setInterval(() => {
            if (window.refSimFirebase) {
                clearInterval(verificarFirebaseInterval);
                configurarAuthFirebase(modalAuth, btnAbrirAuth);
            }
        }, 200);
    }

    function configurarAuthFirebase(modalAuth, btnAbrirAuth) {
        const { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } = window.refSimFirebase;
        if (!auth) return;

        const emailInput = document.getElementById("user-email");
        const passwordInput = document.getElementById("user-password");
        const statusText = document.getElementById("auth-status");
        const btnLogin = document.getElementById("btn-login");
        const btnRegister = document.getElementById("btn-register");

        onAuthStateChanged(auth, async (user) => {
            let authContainer = document.getElementById("auth-container-ui");
            if (!authContainer && btnAbrirAuth) {
                authContainer = document.createElement("div");
                authContainer.id = "auth-container-ui";
                btnAbrirAuth.parentNode.appendChild(authContainer);
            }

            if (user) {
                usuarioFirebaseActual = user;
                if (btnAbrirAuth) btnAbrirAuth.style.display = "none";
                await cargarProgresoNube(user.uid);

                if (authContainer) {
                    const nombreCorto = user.email.split("@")[0];
                    authContainer.classList.add("cuenta-pill");
                    authContainer.innerHTML = `
                        <span class="cuenta-pill__avatar" aria-hidden="true">👤</span>
                        <span class="cuenta-pill__nombre">${nombreCorto}</span>
                        <button id="btn-cerrar-sesion" class="cuenta-pill__salir">${t().authCerrarSesion}</button>
                    `;
                    document.getElementById("btn-cerrar-sesion").addEventListener("click", async () => {
                        await signOut(auth);
                        location.reload();
                    });
                }
            } else {
                usuarioFirebaseActual = null;
                if (btnAbrirAuth) btnAbrirAuth.style.display = "inline-flex";
                if (authContainer) { authContainer.innerHTML = ""; authContainer.classList.remove("cuenta-pill"); }
                cargarProgresoLocal();
                actualizarMarcadorInterfaz();
                document.dispatchEvent(new CustomEvent("refsim:progreso-cargado"));
            }
        });

        if (btnLogin && btnRegister && emailInput && passwordInput && statusText) {
            btnLogin.addEventListener("click", async () => {
                try {
                    await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
                    statusText.style.color = "var(--verde-claro)";
                    statusText.innerText = t().authOk;
                    setTimeout(() => { if (modalAuth) modalAuth.style.display = "none"; }, 1000);
                } catch (error) {
                    statusText.style.color = "var(--roja)";
                    statusText.innerText = t().authError + " " + error.message;
                }
            });

            btnRegister.addEventListener("click", async () => {
                try {
                    await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
                    statusText.style.color = "var(--verde-claro)";
                    statusText.innerText = t().authCreada;
                    setTimeout(() => { if (modalAuth) modalAuth.style.display = "none"; }, 1000);
                } catch (error) {
                    statusText.style.color = "var(--roja)";
                    statusText.innerText = t().authError + " " + error.message;
                }
            });
        }
    }

    // ----------------------------------------------------------------------
    // 6. INICIALIZACIÓN
    // ----------------------------------------------------------------------
    document.addEventListener("DOMContentLoaded", () => {
        cargarProgresoLocal();
        aplicarTema(temaActual);
        inicializarCabecera();
        aplicarTraducciones();
        actualizarMarcadorInterfaz();
    });

    // ----------------------------------------------------------------------
    // 7. API PÚBLICA
    // ----------------------------------------------------------------------
    window.RefSim = {
        t,
        aplicarTraducciones,
        aplicarTema,
        guardarProgresoLocal,
        guardarProgresoNubeAuto,
        cargarProgresoNube,
        actualizarMarcadorInterfaz,
        get idioma() { return idiomaActual; },
        get tema() { return temaActual; },
        get usuario() { return usuarioFirebaseActual; },
        get estado() { return usuarioState; },
        set estado(nuevo) { usuarioState = nuevo; }
    };
})();
