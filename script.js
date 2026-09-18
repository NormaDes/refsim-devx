// ==========================================
// 0. ESTADO GLOBAL E IDIOMAS
// ==========================================
let idiomaActual = localStorage.getItem("refsim_idioma") || "es";
let situacionActual = null;
let marcadorActual = null;
let usuarioFirebaseActual = null;
let usuarioState = { puntos: 0, aciertos: 0, totalJugadas: 0, racha: 0, maxRacha: 0 };

// Variables para el control de Modos (Práctica vs Examen Oficial)
let tipoModoJuego = "practica"; // "practica" o "examen"
let indicesDisponibles = []; 

// Variables específicas del Modo Examen
let preguntasExamen = [];
let indiceExamenActual = 0;
let historialExamenActual = [];
let tiempoExamenSegundos = 0;
let timerInterval = null;

// Lienzo de referencia de las coordenadas posX / posY de la base de datos.
const CAMPO_REF = { ancho: 760, alto: 450 };

const traducciones = {
    es: {
        tagSimulador: "Simulador arbitral · Reglas del Juego IFAB",
        lblPuntos: "Puntos",
        lblPrecision: "Precisión",
        lblRacha: "Racha",
        btnAcceso: "Acceso",
        varRepeticion: "VAR · Repetición de la jugada",
        jugada: "Jugada",

        btnNoFalta: "No hay falta",
        btnFalta: "Falta",
        btnAmarilla: "Falta + Amarilla",
        btnRoja: "Falta + Roja",
        btnPenalti: "Penalti",
        btnPenaltiAmarilla: "Penalti + Amarilla",
        btnGol: "Gol",
        btnFueraDeJuego: "Fuera de juego",
        btnSiguiente: "Siguiente jugada",

        aciertoMsg: "Decisión correcta",
        falloMsg: "Decisión incorrecta",
        decisionOficial: "Decisión oficial:",

        authTitulo: "Acceso a RefSim",
        authIntro: "Entra para guardar tus puntos y tu racha en cualquier dispositivo.",
        authEmail: "Correo electrónico",
        authPassword: "Contraseña",
        authLogin: "Iniciar sesión",
        authRegister: "Crear cuenta",
        authCerrarSesion: "Cerrar sesión",
        authOk: "Sesión iniciada",
        authCreada: "Cuenta creada",
        authError: "No se ha podido completar:",

        adLabel: "Publicidad",
        footer: "© 2026 RefSim — Basado en las Reglas del Juego de la IFAB.",

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

        btnNoFaltaDesc: "El contacto es legal, no es motivo de sanción.",
        btnFaltaDesc: "Infracción sancionable con tiro libre directo.",
        btnAmarillaDesc: "Es una falta imprudente o táctica.",
        btnRojaDesc: "Juego brusco grave o fuerza excesiva.",
        btnPenaltiDesc: "Infracción dentro del área que impide el juego.",
        btnPenaltiAmarillaDesc: "Infracción imprudente cometida en el área.",
        btnGolDesc: "El balón cruzó la línea de meta reglamentariamente.",
        btnFueraDeJuegoDesc: "Posición antirreglamentaria al recibir el balón.",

        navInicio: "Inicio",
        navPractica: "Práctica",
        navExamen: "Examen",
        navEstadisticas: "Estadísticas",
        navAjustes: "Ajustes",

        modoPracticaTitulo: "Práctica",
        modoPracticaDesc: "Entrena a tu ritmo",
        modoExamenTitulo: "Examen Oficial (25)",
        modoExamenDesc: "Simula el examen real",
        modoPartidosTitulo: "Mis Partidos",
        modoPartidosDesc: "Tus estadísticas y progreso",

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
        ajustesTitulo: "Ajustes",
        ajustesIntro: "Más opciones de personalización, próximamente."
    },

    eu: {
        tagSimulador: "Arbitraje simulagailua · IFAB Jokoaren Arauak",
        lblPuntos: "Puntuak",
        lblPrecision: "Zehaztasuna",
        lblRacha: "Bolada",
        btnAcceso: "Sartu",
        varRepeticion: "VAR · Jokaldiaren errepikapena",
        jugada: "Jokaldia",

        btnNoFalta: "Ez dago faltarik",
        btnFalta: "Falta",
        btnAmarilla: "Falta + Horia",
        btnRoja: "Falta + Gorria",
        btnPenalti: "Penaltia",
        btnPenaltiAmarilla: "Penaltia + Horia",
        btnGol: "Gola",
        btnFueraDeJuego: "Jokoz kanpo",
        btnSiguiente: "Hurrengo jokaldia",

        aciertoMsg: "Erabaki zuzena",
        falloMsg: "Erabaki okerra",
        decisionOficial: "Erabaki ofiziala:",

        authTitulo: "RefSim-erako sarbidea",
        authIntro: "Sartu zure puntuak eta bolada edozein gailutan gordetzeko.",
        authEmail: "Helbide elektronikoa",
        authPassword: "Pasahitza",
        authLogin: "Saioa hasi",
        authRegister: "Kontua sortu",
        authCerrarSesion: "Saioa itxi",
        authOk: "Saioa hasita",
        authCreada: "Kontua sortuta",
        authError: "Ezin izan da osatu:",

        adLabel: "Publizitatea",
        footer: "© 2026 RefSim — IFABen Jokoaren Arauetan oinarritua.",

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

        btnNoFaltaDesc: "Ukipena legezkoa da, ez du zigorrik behar.",
        btnFaltaDesc: "Jaurtiketa libre zuzenarekin zigortu beharreko arau-haustea.",
        btnAmarillaDesc: "Falta inprudentea edo taktikoa da.",
        btnRojaDesc: "Joko zakar larria edo gehiegizko indarra.",
        btnPenaltiDesc: "Árean jokoa eragozten duen arau-haustea.",
        btnPenaltiAmarillaDesc: "Árean egindako falta inprudentea.",
        btnGolDesc: "Baloiak ate-lerroa arauz gaindu du.",
        btnFueraDeJuegoDesc: "Baloia jaso duenean posizio ilegalean zegoen.",

        navInicio: "Hasiera",
        navPractica: "Praktika",
        navExamen: "Azterketa",
        navEstadisticas: "Estatistikak",
        navAjustes: "Ezarpenak",

        modoPracticaTitulo: "Praktika",
        modoPracticaDesc: "Trebatu zure erritmoan",
        modoExamenTitulo: "Azterketa Ofiziala (25)",
        modoExamenDesc: "Benetako azterketa simulatu",
        modoPartidosTitulo: "Nire Partidak",
        modoPartidosDesc: "Zure estatistikak eta aurrerapena",

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
        ajustesTitulo: "Ezarpenak",
        ajustesIntro: "Pertsonalizazio aukera gehiago, laster."
    }
};

function t() {
    return traducciones[idiomaActual] || traducciones.es;
}

// ==========================================
// 1. BASE DE DATOS DE SITUACIONES (IFAB - 50 Jugadas)
// ==========================================
const situacionesDB = [
    {
        id: 1,
        tipo: "Entrada imprudente en el centro del campo",
        tipoEu: "Sarrera imprudentea zelai erdian",
        descripcion: "Un defensor llega tarde a un balón dividido y golpea la pierna del atacante de manera imprudente.",
        descripcionEu: "Defentsa bat berandu iritsi da baloi banatu batera eta erasotzailearen hanka modu imprudentean kolpatu du.",
        posX: 180,
        posY: 140,
        decisionCorrecta: "Falta",
        explicacion: "Regla 12: una entrada imprudente que implique contacto físico se sanciona con tiro libre directo. La acción imprudente no requiere tarjeta amarilla.",
        explicacionEu: "12. Araua: Ukipen fisikoa dakarren sarrera imprudente bat jaurtiketa libre zuzenarekin zigortzen da. Ekintza imprudenteak ez du txartel horirik eskatzen."
    },
    {
        id: 2,
        tipo: "Entrada temeraria",
        tipoEu: "Sarrera ausarta (temeraria)",
        descripcion: "Un jugador entra con fuerza considerable y sin tener suficientemente en cuenta el riesgo para el adversario.",
        descripcionEu: "Jokalari batek indar handiarekin eta aurkariarentzako arriskua nahikoa kontuan hartu gabe sartzen da.",
        posX: 300,
        posY: 180,
        decisionCorrecta: "Falta + Tarjeta Amarilla",
        explicacion: "Regla 12: una acción temeraria muestra desprecio por el peligro o las consecuencias para el adversario y debe sancionarse con tarjeta amarilla.",
        explicacionEu: "12. Araua: Ekintza ausart batek arriskuarekiko edo aurkariaren ondoriokiko mespretxua erakusten du eta txartel horiarekin zigortu behar da."
    },
    {
        id: 3,
        tipo: "Entrada con fuerza excesiva",
        tipoEu: "Sarrera gehiegizko indarrarekin",
        descripcion: "Un defensor realiza una entrada con fuerza excesiva poniendo en peligro la integridad física del rival.",
        descripcionEu: "Defentsa batek gehiegizko indarrarekin egindako sarrera bat burutzen du, aurkariaren osotasun fisikoa arriskuan jarriz.",
        posX: 420,
        posY: 200,
        decisionCorrecta: "Falta + Tarjeta Roja",
        explicacion: "Regla 12: utilizar fuerza excesiva o poner en peligro la seguridad del adversario constituye juego brusco grave y requiere expulsión.",
        explicacionEu: "12. Araua: Gehiegizko indarra erabiltzea edo aurkariaren segurtasuna arriskuan jartzea joko zakar larria da eta kanporaketa eskatzen du."
    },
    {
        id: 4,
        tipo: "Empujón sin disputa de balón",
        tipoEu: "Baloiaren lehiarik gabeko bultzada",
        descripcion: "Un jugador empuja deliberadamente a un rival mientras el balón está en juego.",
        descripcionEu: "Jokalari batek nahita bultzatzen du aurkari bat baloia jokoan dagoen bitartean.",
        posX: 250,
        posY: 300,
        decisionCorrecta: "Falta",
        explicacion: "Regla 12: empujar a un adversario constituye una infracción sancionable con tiro libre directo cuando el balón está en juego.",
        explicacionEu: "12. Araua: Aurkari bat bultzatzea jaurtiketa libre zuzenarekin zigortu beharreko arau-haustea da baloia jokoan dagoenean."
    },
    {
        id: 5,
        tipo: "Empujón temerario",
        tipoEu: "Bultzada ausarta",
        descripcion: "Un jugador empuja a un rival de forma temeraria durante una disputa.",
        descripcionEu: "Jokalari batek aurkari bat modu ausartean bultzatzen du lehia batean.",
        posX: 340,
        posY: 320,
        decisionCorrecta: "Falta + Tarjeta Amarilla",
        explicacion: "Regla 12: el contacto realizado de manera temeraria debe sancionarse con tiro libre directo y tarjeta amarilla.",
        explicacionEu: "12. Araua: Modu ausartean egindako ukipena jaurtiketa libre zuzenarekin eta txartel horiarekin zigortu behar da."
    },
    {
        id: 6,
        tipo: "Sujeción de camiseta",
        tipoEu: "Kamiseta heltzea",
        descripcion: "Un defensor agarra claramente la camiseta del atacante para impedir que avance.",
        descripcionEu: "Defentsa batek garbi heltzen dio erasotzailearen kamisetari aurrera egitea eragozteko.",
        posX: 520,
        posY: 250,
        decisionCorrecta: "Falta",
        explicacion: "Regla 12: sujetar a un adversario constituye una infracción de tiro libre directo.",
        explicacionEu: "12. Araua: Aurkari bati heltzea jaurtiketa libre zuzeneko arau-haustea da."
    },
    {
        id: 7,
        tipo: "Sujeción para detener ataque prometedor",
        tipoEu: "Eraso promesgarri bat eteteko helduketa",
        descripcion: "Un defensor agarra al atacante cuando este inicia una acción prometedora.",
        descripcionEu: "Defentsa batek erasotzaileari heltzen dio honek ekintza promesgarri bati ekiten dionean.",
        posX: 550,
        posY: 310,
        decisionCorrecta: "Falta + Tarjeta Amarilla",
        explicacion: "Regla 12: detener una acción prometedora mediante una infracción sancionable con tiro libre directo puede requerir amonestación por conducta antideportiva.",
        explicacionEu: "12. Araua: Jaurtiketa libre zuzenarekin zigortu daitekeen arau-hauste baten bidez eraso promesgarri bat eteteak kirol-kontrako jokabideagatik ohartarazpena eska dezake."
    },
    {
        id: 8,
        tipo: "Zancadilla fuera del área",
        tipoEu: "Zango-trabea áreatik kanpo",
        descripcion: "Un defensor intenta disputar el balón pero hace tropezar al atacante fuera del área penal.",
        descripcionEu: "Defentsa bat baloia lehiatzen saiatzen da baina erasotzailea trabatzen du área penaletik kanpo.",
        posX: 400,
        posY: 350,
        decisionCorrecta: "Falta",
        explicacion: "Regla 12: poner la zancadilla o intentar ponerla constituye infracción de tiro libre directo.",
        explicacionEu: "12. Araua: Zango-trabea jartzea edo jartzen saiatzea jaurtiketa libre zuzeneko arau-haustea da."
    },
    {
        id: 9,
        tipo: "Zancadilla dentro del área",
        tipoEu: "Zango-trabea área barruan",
        descripcion: "Un defensor hace tropezar a un atacante dentro de su propia área penal.",
        descripcionEu: "Defentsa batek erasotzaile bat trabatzen du bere área penalaren barruan.",
        posX: 650,
        posY: 300,
        decisionCorrecta: "Penalti",
        explicacion: "Reglas 12 y 14: una infracción sancionable con tiro libre directo cometida dentro del área penal del defensor se sanciona con penalti.",
        explicacionEu: "12. eta 14. Arauak: Defentsaren área penaltiaren barruan egindako jaurtiketa libre zuzenezko arau-haustea penaltiarekin zigortzen da."
    },
    {
        id: 10,
        tipo: "Entrada legal al balón",
        tipoEu: "Baloiarekiko sarrera legezkoa",
        descripcion: "El defensor toca claramente el balón primero y el contacto posterior con el atacante es consecuencia normal de la disputa.",
        descripcionEu: "Defentsak garbi ukitzen du baloia lehenengo eta ondorengo ukipena lehiaren ohiko ondorioa da.",
        posX: 430,
        posY: 250,
        decisionCorrecta: "No hay falta",
        explicacion: "No toda disputa con contacto constituye infracción. Si la acción es legal y el contacto es consecuencia normal de la disputa, se permite continuar.",
        explicacionEu: "Ukipena duen lehia oro ez da arau-haustea. Ekintza legezkotzat jotzen bada eta ukipena lehiaren ohiko ondorioa bada, jokatzen utzi behar da."
    },
    {
        id: 11,
        tipo: "Mano deliberada",
        tipoEu: "Nahita egindako eskua",
        descripcion: "Un jugador mueve deliberadamente el brazo hacia el balón y lo toca.",
        descripcionEu: "Jokalari batek nahita mugitzen du besoa baloiaren aldera eta ukitu egiten du.",
        posX: 350,
        posY: 210,
        decisionCorrecta: "Falta",
        explicacion: "Regla 12: tocar deliberadamente el balón con la mano o el brazo constituye infracción sancionable con tiro libre directo.",
        explicacionEu: "12. Araua: Baloia eskuz edo besoaz nahita ukitzea jaurtiketa libre zuzenarekin zigortzeko moduko arau-haustea da."
    },
    {
        id: 12,
        tipo: "Mano accidental sin consecuencia",
        tipoEu: "Ondorioik gabeko eskua nahigabe",
        descripcion: "El balón golpea accidentalmente el brazo de un jugador y este no obtiene una ventaja inmediata relevante.",
        descripcionEu: "Baloiak nahigabe jotzen du jokalari baten besoa eta honek ez du berehalako abantaila garrantzitsurik lortzen.",
        posX: 280,
        posY: 230,
        decisionCorrecta: "No hay falta",
        explicacion: "Regla 12: no todo contacto del balón con la mano o brazo constituye infracción. Deben cumplirse los criterios establecidos para sancionar mano.",
        explicacionEu: "12. Araua: Baloia eskuz edo besoaz ukitze oro ez da arau-haustea. Eskua zigortzeko ezarritako irizpideak bete behar dira."
    },
    {
        id: 13,
        tipo: "Mano que corta un pase",
        tipoEu: "Pase bat mozten duen eskua",
        descripcion: "Un defensor coloca el brazo de manera antinatural y el balón impacta claramente en él, impidiendo un pase.",
        descripcionEu: "Defentsa batek besoa modu ez-naturalean jartzen du eta baloiak garbi jotzen du, pase bat eragotziz.",
        posX: 500,
        posY: 280,
        decisionCorrecta: "Falta",
        explicacion: "Regla 12: una posición del brazo que no sea consecuencia de un movimiento corporal justificable puede constituir una infracción por mano.",
        explicacionEu: "12. Araua: Gorputzaren mugimendu justifikagarri baten ondorio ez den besoaren posizio batek eskuko arau-haustea ekar dezake."
    },
    {
        id: 14,
        tipo: "Mano dentro del área",
        tipoEu: "Eskua área barruan",
        descripcion: "El balón golpea el brazo de un defensor dentro de su área y la posición del brazo hace que el cuerpo ocupe un espacio mayor de forma no justificable.",
        descripcionEu: "Baloiak defentsa baten besoa jotzen du bere árearen barruan eta besoaren posizioak gorputzak espazio handiagoa okupatzea eragiten du.",
        posX: 650,
        posY: 250,
        decisionCorrecta: "Penalti",
        explicacion: "Regla 12: una infracción por mano cometida por un defensor dentro de su propia área se sanciona con penalti.",
        explicacionEu: "12. Araua: Defentsa batek bere árearen barruan egindako eskuko arau-haustea penaltiarekin zigortzen da."
    },
    {
        id: 15,
        tipo: "Mano que evita ocasión manifiesta",
        tipoEu: "Aukera garbia eragozten duen eskua",
        descripcion: "Un defensor detiene deliberadamente con la mano un balón que se dirigía hacia una portería sin guardameta.",
        descripcionEu: "Defentsa batek nahita eskuz geldiarazten du atezainik gabeko ate baterantz zihoan baloi bat.",
        posX: 700,
        posY: 200,
        decisionCorrecta: "Falta + Tarjeta Roja",
        explicacion: "Regla 12: una mano deliberada que evita un gol o una ocasión manifiesta de gol constituye infracción de expulsión.",
        explicacionEu: "12. Araua: Gol bat edo gol aukera garbi bat eragozten duen nahita egindako eskua kanporatzeko arau-haustea da."
    },
    {
        id: 16,
        tipo: "Mano DOGSO dentro del área",
        tipoEu: "DOGSO eskua área barruan",
        descripcion: "Un defensor comete una mano no deliberada dentro de su área y con ella evita una ocasión manifiesta de gol.",
        descripcionEu: "Defentsa batek nahita gabeko eskua egiten du bere árearen barruan eta horrekin gol aukera garbi bat eragozten du.",
        posX: 680,
        posY: 280,
        decisionCorrecta: "Penalti + Tarjeta Amarilla",
        explicacion: "Regla 12: cuando una mano no deliberada provoca un DOGSO y se concede penalti, corresponde tarjeta amarilla.",
        explicacionEu: "12. Araua: Nahita gabeko eskuko batek DOGSO bat eragiten duenean eta penaltia adierazten denean, txartel horia dagokio."
    },
    {
        id: 17,
        tipo: "DOGSO con posibilidad de jugar balón",
        tipoEu: "DOGSO baloia jokatzeko aukerarekin",
        descripcion: "Un defensor derriba dentro del área a un atacante que tenía una ocasión manifiesta de gol intentando disputar el balón.",
        descripcionEu: "Defentsa batek árean eraisten du gol aukera garbia zuen erasotzaile bat, baloia lehiatzen saiatzen zen bitartean.",
        posX: 620,
        posY: 340,
        decisionCorrecta: "Penalti + Tarjeta Amarilla",
        explicacion: "Regla 12: si la infracción dentro del área es un intento de jugar el balón y evita una ocasión manifiesta de gol, se sanciona con penalti y amarilla.",
        explicacionEu: "12. Araua: Árearen barruko arau-haustea baloia jokatzeko saiakera bat bada eta gol aukera garbi bat eragozten badu, penaltiarekin eta horiarekin zigortzen da."
    },
    {
        id: 18,
        tipo: "DOGSO sin posibilidad de disputar balón",
        tipoEu: "DOGSO baloia lehiatzeko aukerarik gabe",
        descripcion: "Un defensor agarra deliberadamente al atacante dentro del área para impedir una ocasión manifiesta de gol, sin posibilidad real de jugar el balón.",
        descripcionEu: "Defentsak nahita heltzen dio erasotzaileari árean gol aukera garbi bat eragozteko, baloia jokatzeko aukerarik gabe.",
        posX: 600,
        posY: 230,
        decisionCorrecta: "Penalti + Tarjeta Roja",
        explicacion: "Regla 12: un DOGSO mediante una infracción distinta de intentar jugar el balón, como una sujeción, normalmente requiere expulsión.",
        explicacionEu: "12. Araua: Baloia jokatzen saiatzea ez den beste arau-hauste baten bidezko DOGSO batek, helduketa batek kasu, normalean kanporaketa eskatzen du."
    },
    {
        id: 19,
        tipo: "Juego brusco grave",
        tipoEu: "Joko zakar larria",
        descripcion: "Un jugador entra violentamente a un rival mientras disputa el balón y pone en peligro su integridad física.",
        descripcionEu: "Jokalari batek bortizki sartzen du aurkariaren kontra baloia lehiatzen duen bitartean eta bere osotasun fisikoa arriskuan jartzen du.",
        posX: 360,
        posY: 360,
        decisionCorrecta: "Falta + Tarjeta Roja",
        explicacion: "Regla 12: una entrada o disputa que ponga en peligro la seguridad del adversario mediante fuerza excesiva constituye juego brusco grave.",
        explicacionEu: "12. Araua: Gehiegizko indarrez aurkariaren segurtasuna arriskuan jartzen duen sarrera edo lehia joko zakar larria da."
    },
    {
        id: 20,
        tipo: "Conducta violenta sin balón",
        tipoEu: "Jokabide bortitza baloirik gabe",
        descripcion: "Un jugador golpea deliberadamente a un adversario cuando ambos no están disputando el balón.",
        descripcionEu: "Jokalari batek nahita kolpatzen du aurkari bat biak baloia lehiatzen ari ez direnean.",
        posX: 450,
        posY: 400,
        decisionCorrecta: "Falta + Tarjeta Roja",
        explicacion: "Regla 12: emplear o intentar emplear fuerza excesiva o brutalidad contra un adversario cuando no se disputa el balón constituye conducta violenta.",
        explicacionEu: "12. Araua: Baloia lehiatzen ari ez direnean aurkari baten aurka gehiegizko indarra edo basakeria erabiltzea edo erabiltzen saiatzea jokabide bortitza da."
    },
    {
        id: 21,
        tipo: "Insulto a un adversario",
        tipoEu: "Irainak aurkari bati",
        descripcion: "Un jugador utiliza lenguaje ofensivo, insultante o humillante contra un adversario.",
        descripcionEu: "Jokalari batek hizkuntza erasokorra, irainduzkoa edo umiliagarria erabiltzen du aurkariaren kontra.",
        posX: 300,
        posY: 400,
        decisionCorrecta: "Falta + Tarjeta Amarilla",
        explicacion: "Regla 12: utilizar lenguaje o comportarse de forma ofensiva, insultante o humillante es una infracción sancionable con tiro libre indirecto y puede requerir tarjeta.",
        explicacionEu: "12. Araua: Hizkuntza erasokorra, irainduzkoa edo umiliagarria erabiltzea edo horrela jokatzea jaurtiketa libre zeharkakoarekin zigortzeko moduko arau-haustea da eta txartel horia eska dezake."
    },
    {
        id: 22,
        tipo: "Juego peligroso sin contacto",
        tipoEu: "Joko arriskutsua ukipenik gabe",
        descripcion: "Un jugador levanta la pierna peligrosamente cerca de la cabeza de un rival, sin llegar a producir contacto.",
        descripcionEu: "Jokalari batek hanka arriskuki altxatzen du aurkariaren burutik gertu, inolako ukipenik sortu gabe.",
        posX: 420,
        posY: 310,
        decisionCorrecta: "Falta",
        explicacion: "Regla 12: jugar de forma peligrosa sin contacto físico se sanciona con tiro libre indirecto.",
        explicacionEu: "12. Araua: Ukipen fisikorik gabe modu arriskutsuan jokatzea jaurtiketa libre zeharkakoarekin zigortzen da."
    },
    {
        id: 23,
        tipo: "Carga legal",
        tipoEu: "Karga legezkoa",
        descripcion: "Un jugador carga contra un rival hombro contra hombro de forma legal mientras ambos disputan el balón.",
        descripcionEu: "Jokalari batek aurkaria kargatzen du sorbalda sorbaldaz modu legezko batean biak baloia lehiatzen ari diren bitartean.",
        posX: 350,
        posY: 170,
        decisionCorrecta: "No hay falta",
        explicacion: "Una carga puede ser legal cuando se realiza respetando las condiciones establecidas por las Reglas de Juego.",
        explicacionEu: "Karga bat legezkoa izan daiteke Joko Arauek ezarritako baldintzak errespetatuz burutzen denean."
    },
    {
        id: 24,
        tipo: "Obstrucción sin contacto",
        tipoEu: "Obstrukzioa ukipenik gabe",
        descripcion: "Un jugador se coloca deliberadamente en la trayectoria de un rival sin realizar contacto físico.",
        descripcionEu: "Jokalari bat nahita jartzen da aurkariaren ibilbidean ukipen fisikorik egin gabe.",
        posX: 270,
        posY: 350,
        decisionCorrecta: "Falta",
        explicacion: "Regla 12: obstaculizar el avance de un adversario sin contacto físico se sanciona con tiro libre indirecto.",
        explicacionEu: "12. Araua: Ukipen fisikorik gabe aurkari baten aurrerapena oztopatzea jaurtiketa libre zeharkakoarekin zigortzen da."
    },
    {
        id: 25,
        tipo: "Fuera de juego claro",
        tipoEu: "Jokoz kanpo garbia",
        descripcion: "Un atacante está más cerca de la línea de meta que el balón y el penúltimo defensor cuando su compañero juega el balón. Después participa directamente en la jugada.",
        descripcionEu: "Erasotzaile bat ate-lerroaresekoago dago baloia eta azken-aurreko defentsa baino bere kideak baloia jokatzen duenean. Gondoren zuzenean parte hartzen du jokoan.",
        posX: 650,
        posY: 150,
        decisionCorrecta: "Fuera de juego",
        explicacion: "Regla 11: estar en posición de fuera de juego no es suficiente; debe existir participación activa en el juego.",
        explicacionEu: "11. Araua: Jokoz kanpoko posizioan egotea ez da nahikoa; jokoan parte-hartze aktiboa egon behar da."
    },
    {
        id: 26,
        tipo: "Atacante en línea",
        tipoEu: "Erasotzailea lerro berean",
        descripcion: "El atacante está exactamente a la misma altura que el penúltimo defensor cuando su compañero juega el balón.",
        descripcionEu: "Erasotzailea zehatz-mehatz azken-aurreko defentsaren altuera berean dago bere kideak baloia jokatzen duenean.",
        posX: 580,
        posY: 160,
        decisionCorrecta: "No hay falta",
        explicacion: "Regla 11: un jugador que está a la misma altura que el penúltimo adversario no se encuentra en posición de fuera de juego.",
        explicacionEu: "11. Araua: Azken-aurreko aurkariaren altuera berean dagoen jokalari bat ez dago jokoz kanpoko posizioan."
    },
    {
        id: 27,
        tipo: "Fuera de juego por interferir al portero",
        tipoEu: "Jokoz kanpo atezaina oztopatzeagatik",
        descripcion: "Un atacante en posición de fuera de juego bloquea claramente la línea de visión del guardameta cuando otro compañero dispara.",
        descripcionEu: "Jokoz kanpoko posizioan dagoen erasotzaile batek atezainaren ikusmen-lerroa garbi blokeatzen du beste kide batek jaurtitzen duenean.",
        posX: 670,
        posY: 190,
        decisionCorrecta: "Fuera de juego",
        explicacion: "Regla 11: un jugador en posición de fuera de juego comete infracción si interfiere con un adversario, por ejemplo bloqueando claramente su línea de visión.",
        explicacionEu: "11. Araua: Jokoz kanpoko posizioan dagoen jokalari batek arau-haustea egiten du aurkari batekin oztopatzen badu, adibidez bere ikusmen-lerroa garbi blokeatuz."
    },
    {
        id: 28,
        tipo: "Fuera de juego tras rechace del portero",
        tipoEu: "Jokoz kanpo atezainaren aldaratzearen ondoren",
        descripcion: "Un atacante estaba en fuera de juego cuando su compañero disparó. El portero rechaza el balón y el atacante marca.",
        descripcionEu: "Erasotzaile bat jokoz kanpo zegoen bere kideak jaurti zuenean. Atezainak baloia aldaratzen du eta erasotzaileak gola sartzen du.",
        posX: 700,
        posY: 220,
        decisionCorrecta: "Fuera de juego",
        explicacion: "Regla 11: sacar ventaja de una posición de fuera de juego jugando un balón que ha sido rechazado por el adversario puede constituir infracción.",
        explicacionEu: "11. Araua: Aurkariak aldaratutako baloi bat jokatuz jokoz kanpoko posizio batetik abantaila ateratzea arau-haustea izan daiteke."
    },
    {
        id: 29,
        tipo: "Fuera de juego tras córner",
        tipoEu: "Jokoz kanpo korner baten ostean",
        descripcion: "Un atacante recibe directamente el balón procedente de un saque de esquina aunque estaba inicialmente en posición adelantada.",
        descripcionEu: "Erasotzaile batek zuzenean jasotzen du baloi bat korner batetik, hasieran posizio aurreratuan zegoen arren.",
        posX: 680,
        posY: 100,
        decisionCorrecta: "No hay falta",
        explicacion: "Regla 11: no existe infracción de fuera de juego cuando un jugador recibe directamente el balón de un saque de esquina.",
        explicacionEu: "11. Araua: Ez dago jokoz kanpoko arau-hausterik jokalari batek zuzenean korner batetik baloia jasotzen duenean."
    },
    {
        id: 30,
        tipo: "Fuera de juego tras saque de meta",
        tipoEu: "Jokoz kanpo ateko sakearen ostean",
        descripcion: "Un atacante recibe directamente el balón de un saque de meta y posteriormente avanza hacia la portería.",
        descripcionEu: "Erasotzaile batek ateko sake batetik zuzenean jasotzen du baloia eta ondoren atearantz aurrera egiten du.",
        posX: 550,
        posY: 120,
        decisionCorrecta: "No hay falta",
        explicacion: "Regla 11: no existe infracción de fuera de juego cuando el jugador recibe directamente el balón de un saque de meta.",
        explicacionEu: "11. Araua: Ez dago jokoz kanpoko arau-hausterik jokalariak ateko sake batetik zuzenean baloia jasotzen duenean."
    },
    {
        id: 31,
        tipo: "Fuera de juego tras saque de banda",
        tipoEu: "Jokoz kanpo alboko sakearen ostean",
        descripcion: "Un atacante recibe directamente el balón de un saque de banda aunque se encontraba adelantado.",
        descripcionEu: "Erasotzaile batek alboko sake batetik zuzenean jasotzen du baloia aurreratuta zegoen arren.",
        posX: 500,
        posY: 100,
        decisionCorrecta: "No hay falta",
        explicacion: "Regla 11: un jugador no puede ser sancionado por fuera de juego al recibir directamente el balón de un saque de banda.",
        explicacionEu: "11. Araua: Jokalari bat ezin da jokoz kanpo zigortu alboko sake batetik zuzenean baloia jasotzean."
    },
    {
        id: 32,
        tipo: "Atacante en posición de fuera de juego sin participar",
        tipoEu: "Erasotzailea jokoz kanpoko posizioan parte hartu gabe",
        descripcion: "Un delantero está adelantado pero no toca el balón ni interfiere con ningún adversario. Otro compañero recibe el pase.",
        descripcionEu: "Aurrelari bat aurreratuta dago baina ez du baloia ukitzen ezik inongo aurkaririk oztopatzen. Beste kide batek jasotzen du pasea.",
        posX: 600,
        posY: 120,
        decisionCorrecta: "No hay falta",
        explicacion: "Regla 11: estar en posición de fuera de juego por sí mismo no constituye infracción. Es necesaria participación activa.",
        explicacionEu: "11. Araua: Berez jokoz kanpoko posizioan egotea ez da arau-haustea. Parte-hartze aktiboa beharrezkoa da."
    },
    {
        id: 33,
        tipo: "Gol legal",
        tipoEu: "Gol legitimoa",
        descripcion: "El delantero recibe un pase estando habilitado y marca sin cometer ninguna infracción.",
        descripcionEu: "Erasotzaileak pase bat jasotzen du posizio egokian egonik eta inolako arau-hausterik egin gabe gola sartzen du.",
        posX: 720,
        posY: 170,
        decisionCorrecta: "Gol",
        explicacion: "Reglas 10 y 11: si el balón entra completamente en la portería y no existe una infracción previa, el gol debe concederse.",
        explicacionEu: "10. eta 11. Arauak: Baloia erabat sartzen bada atean eta aurretiazko arau-hausterik ez badago, gola eman egin behar da."
    },
    {
        id: 34,
        tipo: "Gol anulado por mano atacante",
        tipoEu: "Erasotzailearen eskuagatik baliogabetutako gola",
        descripcion: "Un delantero controla deliberadamente el balón con la mano y posteriormente marca.",
        descripcionEu: "Erasotzaile batek nahita kontrolatzen du baloia eskuz eta ondoren gola sartzen du.",
        posX: 700,
        posY: 300,
        decisionCorrecta: "Falta",
        explicacion: "Regla 12: tocar deliberadamente el balón con la mano constituye infracción. El gol no puede concederse.",
        explicacionEu: "12. Araua: Baloia eskuz nahita ukitzea arau-haustea da. Gola ezin da eman."
    },
    {
        id: 35,
        tipo: "Falta dentro del área con ventaja",
        tipoEu: "Falta área barruan abantailarekin",
        descripcion: "Un defensor comete una falta sobre un atacante, pero el balón queda en posesión clara del atacante y existe una ocasión evidente para continuar.",
        descripcionEu: "Defentsa batek falta egiten dio erasotzaile bati, baina baloia erasotzailearen jabetza garbian geratzen da eta aukera garbia dago jarraitzeko.",
        posX: 590,
        posY: 280,
        decisionCorrecta: "Falta",
        explicacion: "Regla 5: el árbitro puede aplicar ventaja cuando el equipo no infractor se beneficia de continuar la acción. La infracción disciplinaria se valorará posteriormente cuando corresponda.",
        explicacionEu: "5. Araua: Epaileak abantaila aplika dezake arau-hauste egin ez duen taldeari ekintza jarraitzeak mesede egiten dionean. Diziplina-zehapena aurrerago baloratuko da dagokionean."
    },
    {
        id: 36,
        tipo: "Ventaja y gol",
        tipoEu: "Abantaila eta gola",
        descripcion: "Un defensor comete una falta que detiene un ataque prometedor, pero el atacante continúa, entra en el área y marca.",
        descripcionEu: "Defentsa batek eraso promesgarri bat eteten duen falta egiten du, baina erasotzaileak jarraitu, árean sartu eta gola sartzen du.",
        posX: 700,
        posY: 250,
        decisionCorrecta: "Gol",
        explicacion: "Regla 12: si se aplica ventaja y como consecuencia se marca un gol, no se muestra tarjeta amarilla por una infracción destinada únicamente a detener una acción prometedora.",
        explicacionEu: "12. Araua: Abantaila aplikatzen bada eta ondorioz gola sartzen bada, ez da txartel horirik erakusten eraso promesgarri bat eteteko soilik pentsatutako arau-hausteagatik."
    },
    {
        id: 37,
        tipo: "Falta táctica en contraataque",
        tipoEu: "Falta taktikoa kontraerasoan",
        descripcion: "Un jugador agarra a un rival para detener un contraataque prometedor.",
        descripcionEu: "Jokalari batek aurkari bati heltzen dio kontraeraso promesgarri bat eteteko.",
        posX: 330,
        posY: 250,
        decisionCorrecta: "Falta + Tarjeta Amarilla",
        explicacion: "Regla 12: detener una acción prometedora mediante una infracción sancionable puede constituir conducta antideportiva y requerir amonestación.",
        explicacionEu: "12. Araua: Eraso promesgarri bat arau-hauste zigorgarri baten bidez etetea kirol-kontrako jokabidea izan daiteke eta oharpena eskatu dezake."
    },
    {
        id: 38,
        tipo: "Balón golpeado con objeto",
        tipoEu: "Objektu batekin kolpatutako baloia",
        descripcion: "Un defensor se quita una bota y la utiliza para golpear el balón dentro de su área.",
        descripcionEu: "Defentsa batek botak erantzi eta baloia kolpatzeko erabiltzen du bere árearen barruan.",
        posX: 640,
        posY: 350,
        decisionCorrecta: "Penalti",
        explicacion: "Regla 12: si un jugador toca el balón con un objeto que lleva en la mano, se sanciona con tiro libre directo o penalti si ocurre dentro de su propia área.",
        explicacionEu: "12. Araua: Jokalari batek eskuan daraman objektu batekin baloia ukitzen badu, jaurtiketa libre zuzenarekin edo penaltiarekin zigortzen da bere árearen barruan gertatzen bada."
    },
    {
        id: 39,
        tipo: "Lanzamiento de objeto al balón",
        tipoEu: "Baloiaren aurka objektu bat jaurtitzea",
        descripcion: "Un jugador lanza deliberadamente un objeto contra el balón para evitar que llegue a un atacante.",
        descripcionEu: "Jokalari batek nahita objektu bat jaurtitzen du baloiaren kontra erasotzaile batengana iristea ekiditeko.",
        posX: 520,
        posY: 330,
        decisionCorrecta: "Falta + Tarjeta Amarilla",
        explicacion: "Regla 12: utilizar un objeto para interferir con el balón constituye una infracción y la sanción disciplinaria dependerá de las circunstancias.",
        explicacionEu: "12. Araua: Baloiarekin interferitzeko objektu bat erabiltzea arau-haustea da eta diziplina-zehapena egoeraren arabera egongo da."
    },
    {
        id: 40,
        tipo: "Guardameta retiene demasiado el balón",
        tipoEu: "Atezainak baloia gehiegi atxikitzen du",
        descripcion: "El guardameta mantiene el balón controlado con las manos durante un periodo superior al permitido por las Reglas de Juego.",
        descripcionEu: "Atezainak baloia eskuekin kontrolatuta mantentzen du Joko Arauek baimendutako denbora baino gehiago.",
        posX: 730,
        posY: 250,
        decisionCorrecta: "Falta",
        explicacion: "Regla 12: el guardameta no puede controlar el balón con las manos más allá del tiempo permitido. La infracción se sanciona con tiro libre indirecto.",
        explicacionEu: "12. Araua: Atezainak ezin du baloia eskuekin kontrolatu Joko Arauek baimendutako denbora baino gehiago. Arau-haustea jaurtiketa libre zeharkakoarekin zigortzen da."
    },
    {
        id: 41,
        tipo: "Portero recoge pase deliberado con pie",
        tipoEu: "Atezainak oinez emandako nahitaezko pasea hartzen du",
        descripcion: "Un defensor juega deliberadamente el balón con el pie hacia su guardameta y este lo recoge con las manos.",
        descripcionEu: "Defentsa batek nahita oinez pasatzen dio bere atezainari eta honek eskuekin hartzen du.",
        posX: 670,
        posY: 350,
        decisionCorrecta: "Falta",
        explicacion: "Regla 12: el guardameta no puede tocar con las manos un balón que un compañero le haya cedido deliberadamente con el pie.",
        explicacionEu: "12. Araua: Atezainak ezin ditu eskuekin ukitu kide batek oinez nahita utzi dion baloia."
    },
    {
        id: 42,
        tipo: "Portero recoge balón de cabeza",
        tipoEu: "Atezainak buruzko baloia jasotzen du",
        descripcion: "Un defensor cabecea deliberadamente el balón hacia su guardameta y este lo recoge con las manos.",
        descripcionEu: "Defentsa batek nahita buruz pasatzen dio baloia bere atezainari eta honek eskuekin hartzen du.",
        posX: 600,
        posY: 350,
        decisionCorrecta: "No hay falta",
        explicacion: "Un guardameta puede recibir con las manos un balón cedido mediante una acción legal de cabeza, siempre que no exista un intento deliberado de eludir la Regla.",
        explicacionEu: "Atezain batek eskuz jaso dezake buruzko ekintza legal baten bidez utzitako baloi bat, Araua saihesteko nahitaezko asmorik ez dagoen bitartean."
    },
    {
        id: 43,
        tipo: "Simulación dentro del área",
        tipoEu: "Simulazioa área barruan",
        descripcion: "Un atacante entra en el área y se deja caer deliberadamente sin haber recibido contacto que justifique la caída.",
        descripcionEu: "Erasotzaile bat área barruan sartu eta nahita botatzen da erorketa justifikatzen duen inolako ukipenik jaso gabe.",
        posX: 650,
        posY: 330,
        decisionCorrecta: "Falta + Tarjeta Amarilla",
        explicacion: "Regla 12: intentar engañar al árbitro simulando haber sufrido una infracción constituye conducta antideportiva y debe sancionarse con tarjeta amarilla.",
        explicacionEu: "12. Araua: Epailea iruzurtzen saiatzea arau-hauste bat jasan duela simulatuz kirol-kontrako jokabidea da eta txartel horiarekin zigortu behar da."
    },
    {
        id: 44,
        tipo: "Celebración provocadora",
        tipoEu: "Ospakizun probokatzailea",
        descripcion: "Después de marcar, un jugador realiza una celebración provocadora dirigida claramente hacia los aficionados rivales.",
        descripcionEu: "Gola sartu ondoren, jokalari batek ospakizun probokatzailea egiten du aurkariaren zaleei argi zuzenduta.",
        posX: 700,
        posY: 100,
        decisionCorrecta: "Falta + Tarjeta Amarilla",
        explicacion: "Regla 12: determinadas celebraciones provocadoras o que generen una situación de confrontación pueden constituir conducta antideportiva y ser sancionables.",
        explicacionEu: "12. Araua: Ospakizun probokatzaile jakin batzuek edo konfrontazio egoera bat sortzen dutenek kirol-kontrako jokabidea ekar dezakete eta zigorgarriak izan daitezke."
    },
    {
        id: 45,
        tipo: "Protesta reiterada",
        tipoEu: "Protesta errepikatua",
        descripcion: "Un jugador protesta repetidamente las decisiones arbitrales de manera que incurre en una conducta sancionable.",
        descripcionEu: "Jokalari batek behin eta berriz protestatzen ditu epailearen erabakiak jokabide zigorgarri bat eginez.",
        posX: 300,
        posY: 100,
        decisionCorrecta: "Falta + Tarjeta Amarilla",
        explicacion: "Regla 12: mostrar desaprobación mediante palabras o acciones puede ser sancionado disciplinariamente.",
        explicacionEu: "12. Araua: Hitz edo ekintzen bidez desadostasuna erakustea diziplina-neurriz zigortu daiteke."
    },
    {
        id: 46,
        tipo: "Retrasar un saque",
        tipoEu: "Sake bat atzeratzea",
        descripcion: "Un jugador recoge deliberadamente el balón y se aleja con él para impedir que el rival realice rápidamente un saque.",
        descripcionEu: "Jokalari batek nahita hartzen du baloia eta urrundu egiten da aurkariak azkar sake bat egitea eragozteko.",
        posX: 200,
        posY: 250,
        decisionCorrecta: "Falta + Tarjeta Amarilla",
        explicacion: "Regla 12: retrasar la reanudación del juego es una infracción sancionable con tarjeta amarilla.",
        explicacionEu: "12. Araua: Jokoari berrekin ezinezko atzerapena egitea txartel horiarekin zigortzeko moduko arau-haustea da."
    },
    {
        id: 47,
        tipo: "Portero adelanta un pie en penalti",
        tipoEu: "Atezainak oin bat aurreratzen du penaltian",
        descripcion: "Durante un penalti, el guardameta tiene parte de un pie tocando o alineado con la línea de meta en el momento del golpeo.",
        descripcionEu: "Penalti batean, atezainak oin baten zati bat marraztuta edo ate-lerroarekin lerrokatuta dauka kolpearen unean.",
        posX: 730,
        posY: 200,
        decisionCorrecta: "No hay falta",
        explicacion: "Regla 14: en el momento del golpeo, el guardameta debe tener al menos parte de un pie tocando, en línea con o detrás de la línea de meta.",
        explicacionEu: "14. Araua: Kolpearen unean, atezainak oin baten zati bat ukitzen, lerroan edo atzealdean izan behar du ate-lerroarekiko."
    },
    {
        id: 48,
        tipo: "Portero completamente adelantado en penalti",
        tipoEu: "Atezaina guztiz aurreratuta penaltian",
        descripcion: "El guardameta abandona completamente la línea de meta antes del golpeo y su posición ilegal influye claramente en el resultado del lanzamiento.",
        descripcionEu: "Atezainak erabat uzten du ate-lerroa kolpea eman baino lehen eta bere posizio ilegalean argi eta garbi eragiten du jaurtiketaren emaitzan.",
        posX: 710,
        posY: 220,
        decisionCorrecta: "Penalti",
        explicacion: "Regla 14: el guardameta debe cumplir los requisitos de posición hasta el golpeo. Si infringe la regla y afecta al resultado, el lanzamiento puede repetirse.",
        explicacionEu: "14. Araua: Atezainak posizio-eskakizunak bete behar ditu kolpea eman arte. Araua urratzen badu eta emaitzan eragiten badu, jaurtiketa errepikatu egin daiteke."
    },
    {
        id: 49,
        tipo: "Penalti cometido por el portero",
        tipoEu: "Atezainak egindako penaltia",
        descripcion: "El guardameta sale de su portería, derriba de manera imprudente al atacante dentro del área y evita una ocasión manifiesta de gol.",
        descripcionEu: "Atezainak bere atera uzten du, erasotzailea modu inprudentean eraisten du área barruan eta gol aukera garbi bat eragozten du.",
        posX: 690,
        posY: 300,
        decisionCorrecta: "Penalti + Tarjeta Amarilla",
        explicacion: "Reglas 12 y 14: una entrada imprudente del guardameta que frustra una ocasión manifiesta de gol en el área se sanciona con penalti y tarjeta amarilla.",
        explicacionEu: "12. eta 14. Arauak: Árean gol aukera garbi bat hondatzen duen atezainaren sarrera inprudentea penaltiarekin eta txartel horiarekin zigortzen da."
    },
    {
        id: 50,
        tipo: "Entrada por detrás sin opción de balón",
        tipoEu: "Atzetik egindako sarrera baloia jokatzeko aukerarik gabe",
        descripcion: "Un defensor arremete por la espalda contra un adversario en carrera sin ninguna posibilidad de disputar el esférico.",
        descripcionEu: "Defentsa batek atzetik jotzen du lasterketan dabilen aurkari bat, esferikoa lehiatzeko inongo aukerarik gabe.",
        posX: 380,
        posY: 220,
        decisionCorrecta: "Falta + Tarjeta Roja",
        explicacion: "Regla 12: una entrada por detrás que no disputa el balón y pone en peligro la integridad física del adversario se sanciona con falta y tarjeta roja directa.",
        explicacionEu: "12. Araua: Baloia lehiatzen ez duen eta aurkariaren osotasun fisikoa arriskuan jartzen duen atzetik egindako sarrera falta eta txartel gorri zuzenarekin zigortzen da."
    }
];

// ==========================================
// 2. LÓGICA DE SELECCIÓN DE JUGADA
// ==========================================
function cargarNuevaSituacion() {
    if (marcadorActual) {
        marcadorActual.remove();
        marcadorActual = null;
    }
    
    const panelFeedback = document.getElementById('panel-feedback');
    if (panelFeedback) {
        panelFeedback.classList.add('oculto');
        panelFeedback.classList.remove('acierto', 'fallo');
    }

    const botonesOpcion = document.querySelectorAll('.btn-opcion');
    botonesOpcion.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('es-correcta', 'es-elegida-fallo');
    });

    if (tipoModoJuego === "examen") {
        // --- MODO EXAMEN OFICIAL ---
        if (indiceExamenActual >= preguntasExamen.length) {
            finalizarExamenOficial();
            return;
        }
        situacionActual = preguntasExamen[indiceExamenActual];
    } else {
        // --- MODO PRÁCTICA LIBRE ---
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

    const idSituacion = document.getElementById('situacion-id');
    const idSituacionPanel = document.getElementById('situacion-id-panel');
    const tituloSituacion = document.getElementById('situacion-titulo');
    const descripcionSituacion = document.getElementById('situacion-descripcion');

    const prefixNum = tipoModoJuego === "examen" ? `Examen Oficial [${indiceExamenActual + 1}/${preguntasExamen.length}]` : `${t().jugada} #${situacionActual.id}`;
    if (idSituacion) idSituacion.textContent = prefixNum;
    if (idSituacionPanel) idSituacionPanel.textContent = prefixNum;

    if (tituloSituacion) {
        tituloSituacion.textContent = (idiomaActual === 'eu' && situacionActual.tipoEu) ? situacionActual.tipoEu : situacionActual.tipo;
    }
    if (descripcionSituacion) {
        descripcionSituacion.textContent = (idiomaActual === 'eu' && situacionActual.descripcionEu) ? situacionActual.descripcionEu : situacionActual.descripcion;
    }

    colocarMarcador(situacionActual.posX, situacionActual.posY);
    actualizarMetaJugada(situacionActual);
}

// ==========================================
// 1b. INFORMACIÓN CONTEXTUAL DE LA JUGADA (minuto / zona / contexto)
// ==========================================
function calcularZonaJugada(x, y) {
    const cercaPorteria = x < 90 || x > (CAMPO_REF.ancho - 90);
    const cercaCentroVertical = y > CAMPO_REF.alto * 0.18 && y < CAMPO_REF.alto * 0.82;
    if (cercaPorteria && cercaCentroVertical) return 'zonaArea';
    if (x < CAMPO_REF.ancho * 0.38) return 'zonaDefensiva';
    if (x > CAMPO_REF.ancho * 0.62) return 'zonaOfensiva';
    return 'zonaMedio';
}

function calcularContextoJugada(situacion) {
    const decision = situacion.decisionCorrecta;
    if (decision === 'Fuera de juego') return 'ctxOffside';
    if (decision.includes('Penalti')) return 'ctxArea';
    if (decision === 'Gol') return 'ctxGol';
    return 'ctxDisputa';
}

function actualizarMetaJugada(situacion) {
    const txt = t();
    const elMinuto = document.getElementById('meta-minuto');
    const elZona = document.getElementById('meta-zona');
    const elContexto = document.getElementById('meta-contexto');

    const minuto = ((situacion.id * 17) % 90) + 1;
    if (elMinuto) elMinuto.textContent = `${minuto}'`;

    const claveZona = calcularZonaJugada(situacion.posX, situacion.posY);
    if (elZona) {
        elZona.textContent = txt[claveZona];
        elZona.dataset.clave = claveZona;
    }

    const claveContexto = calcularContextoJugada(situacion);
    if (elContexto) {
        elContexto.textContent = txt[claveContexto];
        elContexto.dataset.clave = claveContexto;
    }
}

function colocarMarcador(x, y) {
    const campo = document.getElementById('campo');
    if (!campo) return;
    
    marcadorActual = document.createElement('div');
    marcadorActual.classList.add('marcador-accion');
    marcadorActual.style.left = `${(x / CAMPO_REF.ancho) * 100}%`;
    marcadorActual.style.top = `${(y / CAMPO_REF.alto) * 100}%`;
    campo.appendChild(marcadorActual);
}

function evaluarDecision(event) {
    if (!situacionActual) return;

    const decisionElegida = event.currentTarget.getAttribute('data-decision');
    const txt = t();
    const botonesOpcion = document.querySelectorAll('.btn-opcion');
    const esAcierto = (decisionElegida.trim() === situacionActual.decisionCorrecta.trim());

    if (tipoModoJuego === "examen") {
        // --- EN MODO EXAMEN: No mostramos feedback inmediato, guardamos y avanzamos ---
        historialExamenActual.push({
            id: situacionActual.id,
            enunciado: (idiomaActual === 'eu' && situacionActual.tipoEu) ? situacionActual.tipoEu : situacionActual.tipo,
            tuRespuesta: decisionElegida,
            respuestaCorrecta: situacionActual.decisionCorrecta,
            explicacion: (idiomaActual === 'eu' && situacionActual.explicacionEu) ? situacionActual.explicacionEu : situacionActual.explicacion,
            acertado: esAcierto
        });

        indiceExamenActual++;
        cargarNuevaSituacion();
        return;
    }

    // --- EN MODO PRÁCTICA: Sí mostramos acierto/fallo y explicación inmediata ---
    botonesOpcion.forEach(btn => {
        btn.disabled = true;
        if (btn.getAttribute('data-decision') === situacionActual.decisionCorrecta) {
            btn.classList.add('es-correcta');
        }
    });
    
    const panelFeedback = document.getElementById('panel-feedback');
    const resultadoFeedback = document.getElementById('feedback-resultado');
    const explicacionFeedback = document.getElementById('feedback-explicacion');

    if (panelFeedback) {
        panelFeedback.classList.remove('oculto', 'acierto', 'fallo');
    }

    usuarioState.totalJugadas++;

    if (esAcierto) {
        usuarioState.aciertos++;
        usuarioState.racha++;
        if (usuarioState.racha > usuarioState.maxRacha) {
            usuarioState.maxRacha = usuarioState.racha;
        }

        const puntosGanados = 100 + (usuarioState.racha > 1 ? (usuarioState.racha - 1) * 20 : 0);
        usuarioState.puntos += puntosGanados;

        if (panelFeedback) panelFeedback.classList.add('acierto');
        if (resultadoFeedback) resultadoFeedback.textContent = `${txt.aciertoMsg} (+${puntosGanados} pts)`;
    } else {
        usuarioState.racha = 0;
        event.currentTarget.classList.add('es-elegida-fallo');
        if (panelFeedback) panelFeedback.classList.add('fallo');
        const nombreOficial = txt.nombreDecision[situacionActual.decisionCorrecta] || situacionActual.decisionCorrecta;
        if (resultadoFeedback) resultadoFeedback.textContent = `${txt.falloMsg} (${txt.decisionOficial} ${nombreOficial})`;
    }

    const explicacionFinal = (idiomaActual === 'eu' && situacionActual.explicacionEu) ? situacionActual.explicacionEu : situacionActual.explicacion;
    if (explicacionFeedback) {
        explicacionFeedback.textContent = explicacionFinal;
    }

    actualizarMarcadorInterfaz();
    guardarProgresoNubeAuto();
}

// ==========================================
// 3. CONTROL DE MODO EXAMEN Y CRONÓMETRO
// ==========================================
function iniciarModoExamenOficial() {
    tipoModoJuego = "examen";
    indiceExamenActual = 0;
    historialExamenActual = [];
    tiempoExamenSegundos = 0;

    // Seleccionar 25 preguntas aleatorias del total de 50 sin repetir
    preguntasExamen = [...situacionesDB].sort(() => Math.random() - 0.5).slice(0, 25);

    // Ocultar paneles anteriores de resultados si los hubiera
    const anterior = document.getElementById('panel-resultados-examen');
    if (anterior) anterior.remove();

    const panelDecisiones = document.querySelector('.decisions');
    if (panelDecisiones) panelDecisiones.style.display = 'grid';

    // Iniciar Cronómetro
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        tiempoExamenSegundos++;
        actualizarRelojUI();
    }, 1000);

    crearBarraModoUI();
    cargarNuevaSituacion();
}

function iniciarModoPractica() {
    tipoModoJuego = "practica";
    if (timerInterval) clearInterval(timerInterval);

    const anterior = document.getElementById('panel-resultados-examen');
    if (anterior) anterior.remove();

    const panelDecisiones = document.querySelector('.decisions');
    if (panelDecisiones) panelDecisiones.style.display = 'grid';

    crearBarraModoUI();
    cargarNuevaSituacion();
}

function actualizarRelojUI() {
    const relojEl = document.getElementById('reloj-examen');
    if (!relojEl) return;
    const mins = Math.floor(tiempoExamenSegundos / 60).toString().padStart(2, '0');
    const secs = (tiempoExamenSegundos % 60).toString().padStart(2, '0');
    relojEl.textContent = `⏱️ ${mins}:${secs}`;
}

async function guardarExamenEnNube(aciertos, total, porcentaje, segundos, detalle) {
    if (!usuarioFirebaseActual || !window.refSimFirebase) return;
    const { db, doc, setDoc, getDoc } = window.refSimFirebase;
    try {
        const docRef = doc(db, "usuarios", usuarioFirebaseActual.uid);
        const docSnap = await getDoc(docRef);
        
        let historialExistente = [];
        if (docSnap.exists() && docSnap.data().historialExamenes) {
            historialExistente = docSnap.data().historialExamenes;
        }

        const nuevoExamen = {
            fecha: new Date().toISOString(),
            aciertos: Number(aciertos),
            total: Number(total),
            porcentaje: Number(porcentaje),
            tiempoSegundos: Number(segundos),
            detalle: Array.isArray(detalle) ? detalle : []
        };

        historialExistente.push(nuevoExamen);

        await setDoc(docRef, { 
            historialExamenes: historialExistente 
        }, { merge: true });

        console.log("¡Examen guardado correctamente en la nube!");
    } catch (e) {
        console.error("Error al guardar historial en Firebase:", e);
    }
}

function finalizarExamenOficial() {
    if (timerInterval) clearInterval(timerInterval);
    tipoModoJuego = "practica"; // Volvemos a estado libre

    const total = historialExamenActual.length;
    const aciertos = historialExamenActual.filter(h => h.acertado).length;
    const porcentaje = total > 0 ? Math.round((aciertos / total) * 100) : 0;

    const panelDecisiones = document.querySelector('.decisions');
    if (panelDecisiones) panelDecisiones.style.display = 'none';

    const panelSituacion = document.querySelector('.panel');
    if (!panelSituacion) return;

    // Guardar en Firestore el resultado del examen
    guardarExamenEnNube(aciertos, total, porcentaje, tiempoExamenSegundos, historialExamenActual);

    let mins = Math.floor(tiempoExamenSegundos / 60);
    let secs = tiempoExamenSegundos % 60;

    let htmlRevision = `
        <div id="panel-resultados-examen" style="margin-top: 15px; padding: 20px; background: rgba(10, 21, 18, 0.95); border: 1px solid var(--amarilla); border-radius: var(--radio-m);">
            <h2 style="font-family: var(--fuente-display); font-size: 1.6rem; color: var(--amarilla); margin-bottom: 6px;">📋 Acta Oficial de Examen</h2>
            <p style="font-size: 1rem; margin-bottom: 4px;">Puntuación: <strong>${aciertos} / ${total}</strong> aciertos (<strong>${porcentaje}%</strong>)</p>
            <p style="font-size: 0.85rem; color: var(--tenue); margin-bottom: 12px;">Tiempo empleado: ${mins}m ${secs}s</p>
            
            <h3 style="font-size: 0.95rem; margin-bottom: 8px; color: var(--amarilla-clara);">Revisión detallada de tus respuestas:</h3>
            <div style="max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px;">
    `;

    historialExamenActual.forEach((item, index) => {
        const colorBorde = item.acertado ? 'var(--verde-claro)' : 'var(--roja)';
        const icono = item.acertado ? '✅' : '❌';
        htmlRevision += `
            <div style="padding: 9px; background: rgba(255,255,255,0.03); border-left: 4px solid ${colorBorde}; border-radius: 4px; font-size: 0.82rem;">
                <p><strong>#${index + 1} - ${item.enunciado}</strong> ${icono}</p>
                <p style="color: var(--tenue); font-size: 0.78rem;">Tu elección: <em>${item.tuRespuesta}</em> | Oficial IFAB: <strong>${item.respuestaCorrecta}</strong></p>
                <p style="color: var(--tenue-oscuro); font-size: 0.75rem; margin-top: 3px;">📖 ${item.explicacion}</p>
            </div>
        `;
    });

    htmlRevision += `
            </div>
            <div style="display: flex; gap: 10px; margin-top: 14px;">
                <button type="button" id="btn-repetir-examen" class="btn-siguiente" style="flex: 1;">Hacer Nuevo Examen</button>
                <button type="button" id="btn-ver-historial" class="btn-auth btn-auth--secundario" style="flex: 1; padding: 11px;">Ver Historial</button>
            </div>
        </div>
    `;

    const existente = document.getElementById('panel-resultados-examen');
    if (existente) existente.remove();
    panelSituacion.insertAdjacentHTML('beforeend', htmlRevision);

    document.getElementById('btn-repetir-examen').addEventListener('click', () => {
        iniciarModoExamenOficial();
    });

    document.getElementById('btn-ver-historial').addEventListener('click', () => {
        mostrarModalHistorial();
    });
}

// ==========================================
// 4. INTERFAZ DE SELECTOR DE MODO E HISTORIAL
// ==========================================
function crearBarraModoUI() {
    actualizarActivoModoUI();
}

// Sincroniza el estado visual (tarjetas de modo + navegación) con tipoModoJuego,
// sin recrear nodos: solo alterna clases y visibilidad.
function actualizarActivoModoUI() {
    const cardPractica = document.getElementById('modecard-practica');
    const cardExamen = document.getElementById('modecard-examen');
    const navPractica = document.getElementById('nav-practica');
    const navExamen = document.getElementById('nav-examen');
    const navInicio = document.getElementById('nav-inicio');
    const relojEl = document.getElementById('reloj-examen');

    const enExamen = tipoModoJuego === 'examen';

    if (cardPractica) cardPractica.classList.toggle('is-activo', !enExamen);
    if (cardExamen) cardExamen.classList.toggle('is-activo', enExamen);
    if (navPractica) navPractica.classList.toggle('is-activo', !enExamen);
    if (navExamen) navExamen.classList.toggle('is-activo', enExamen);
    if (navInicio) navInicio.classList.toggle('is-activo', false);
    if (relojEl) relojEl.style.display = enExamen ? 'inline-flex' : 'none';
}

async function guardarExamenEnNube(aciertos, total, porcentaje, segundos, detalle) {
    if (!usuarioFirebaseActual || !window.refSimFirebase) return;
    const { db, doc, setDoc, getDoc, updateDoc, arrayUnion } = window.refSimFirebase;
    try {
        const docRef = doc(db, "usuarios", usuarioFirebaseActual.uid);
        const docSnap = await getDoc(docRef);
        
        const nuevoExamen = {
            fecha: new Date().toISOString(),
            aciertos,
            total,
            porcentaje,
            tiempoSegundos: segundos,
            detalle
        };

        if (!docSnap.exists()) {
            await setDoc(docRef, { historialExamenes: [nuevoExamen] }, { merge: true });
        } else {
            await updateDoc(docRef, {
                historialExamenes: arrayUnion(nuevoExamen)
            });
        }
    } catch (e) {
        console.error("Error al guardar historial en Firebase:", e);
    }
}

async function mostrarModalHistorial() {
    let modal = document.getElementById('modal-historial-examenes');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-historial-examenes';
        modal.style.cssText = "position: fixed; inset: 0; z-index: 2000; background: rgba(3,8,6,0.8); display: flex; justify-content: center; align-items: center; padding: 20px;";
        document.body.appendChild(modal);
    }

    modal.style.display = 'flex';
    modal.innerHTML = `
        <div style="background: var(--panel); border: 1px solid var(--amarilla); border-radius: var(--radio-l); width: 100%; max-width: 480px; padding: 24px; position: relative; max-height: 80vh; display: flex; flexDirection: column;">
            <button type="button" id="cerrar-modal-hist" style="position: absolute; top: 12px; right: 14px; background: none; border: none; font-size: 1.4rem; color: var(--tenue); cursor: pointer;">&times;</button>
            <h3 style="font-family: var(--fuente-display); font-size: 1.4rem; color: var(--amarilla); margin-bottom: 12px;">📂 Historial de Exámenes</h3>
            <div id="contenido-lista-historial" style="overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 10px; padding-right: 4px;">
                <p style="color: var(--tenue); text-align: center; padding: 20px;">Cargando tus exámenes...</p>
            </div>
        </div>
    `;

    document.getElementById('cerrar-modal-hist').addEventListener('click', () => { modal.style.display = 'none'; });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    // Cargar desde Firebase o Local
    let listaExamenes = [];
    if (usuarioFirebaseActual && window.refSimFirebase) {
        const { db, doc, getDoc } = window.refSimFirebase;
        try {
            const snap = await getDoc(doc(db, "usuarios", usuarioFirebaseActual.uid));
            if (snap.exists() && snap.data().historialExamenes) {
                listaExamenes = snap.data().historialExamenes;
            }
        } catch (e) {
            console.error("Error al leer historial:", e);
        }
    }

    const contenedorLista = document.getElementById('contenido-lista-historial');
    if (listaExamenes.length === 0) {
        contenedorLista.innerHTML = `<p style="color: var(--tenue); text-align: center; font-size: 0.9rem; padding: 20px;">No tienes exámenes registrados todavía. ¡Completa tu primer Examen Oficial de 25 preguntas!</p>`;
        return;
    }

    let htmlExamenes = '';
    listaExamenes.reverse().forEach((ex, idx) => {
        let fechaFormateada = new Date(ex.fecha).toLocaleDateString() + ' ' + new Date(ex.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        let colorNota = ex.porcentaje >= 70 ? 'var(--verde-claro)' : 'var(--roja)';
        htmlExamenes += `
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--linea); border-radius: var(--radio-s); padding: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="font-size: 0.9rem;">Examen #${listaExamenes.length - idx}</strong>
                    <span style="color: ${colorNota}; font-weight: 700; font-size: 0.95rem;">${ex.porcentaje}% (${ex.aciertos}/${ex.total})</span>
                </div>
                <p style="color: var(--tenue); font-size: 0.78rem;">Fecha: ${fechaFormateada} | Tiempo: ${Math.floor(ex.tiempoSegundos/60)}m ${ex.tiempoSegundos%60}s</p>
            </div>
        `;
    });
    contenedorLista.innerHTML = htmlExamenes;
}

// ==========================================
// 5. INTERFAZ Y TRADUCCIONES
// ==========================================
function actualizarMarcadorInterfaz() {
    const statPuntos = document.getElementById('stat-puntos');
    const statPrecision = document.getElementById('stat-precision');
    const statRacha = document.getElementById('stat-racha');

    const precisionCalculada = usuarioState.totalJugadas > 0 
        ? Math.round((usuarioState.aciertos / usuarioState.totalJugadas) * 100) 
        : 0;

    if (statPuntos) statPuntos.textContent = usuarioState.puntos;
    if (statPrecision) {
        statPrecision.textContent = `${precisionCalculada}%`;
        const statCard = statPrecision.closest('.stat');
        if (statCard) statCard.style.setProperty('--valor-precision', `${precisionCalculada}%`);
    }
    if (statRacha) statRacha.textContent = usuarioState.racha;
}

function aplicarTraducciones() {
    const t = traducciones[idiomaActual] || traducciones.es;

    // Traducciones genéricas por atributo data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const clave = el.getAttribute('data-i18n');
        if (t[clave] !== undefined) el.textContent = t[clave];
    });

    const tag = document.querySelector('.scorebug__tag');
    if (tag) tag.textContent = t.tagSimulador;

    const lblP = document.getElementById('label-puntos');
    const lblPrec = document.getElementById('label-precision');
    const lblR = document.getElementById('label-racha');
    if (lblP) lblP.textContent = t.lblPuntos;
    if (lblPrec) lblPrec.textContent = t.lblPrecision;
    if (lblR) lblR.textContent = t.lblRacha;

    const btnAcceso = document.getElementById('btn-abrir-auth');
    if (btnAcceso && !usuarioFirebaseActual) btnAcceso.textContent = t.btnAcceso;

    const varText = document.querySelector('.monitor__bar span:last-child');
    if (varText) varText.textContent = t.varRepeticion;

    // Traducir los botones de decisión del panel (icono + título + descripción + atajo)
    const botonesOpcion = document.querySelectorAll('.btn-opcion');
    if (botonesOpcion.length >= 8) {
        const contenidoDecision = (glyphHtml, titulo, desc, tecla) => `
            ${glyphHtml}
            <span class="decision__texto">
                <span class="decision__titulo">${titulo}</span>
                <span class="decision__desc">${desc}</span>
            </span>
            <span class="decision__tecla" aria-hidden="true">${tecla}</span>
        `;
        botonesOpcion[0].innerHTML = contenidoDecision('<span class="decision__glyph" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12.5L10 17.5L19 6.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>', t.btnNoFalta, t.btnNoFaltaDesc, 1);
        botonesOpcion[1].innerHTML = contenidoDecision('<span class="decision__glyph" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.2"/><path d="M12 7v6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="16.3" r="1.15" fill="currentColor"/></svg></span>', t.btnFalta, t.btnFaltaDesc, 2);
        botonesOpcion[2].innerHTML = contenidoDecision('<span class="decision__card" aria-hidden="true"></span>', t.btnAmarilla, t.btnAmarillaDesc, 3);
        botonesOpcion[3].innerHTML = contenidoDecision('<span class="decision__card" aria-hidden="true"></span>', t.btnRoja, t.btnRojaDesc, 4);
        botonesOpcion[4].innerHTML = contenidoDecision('<span class="decision__card" aria-hidden="true" style="background:var(--papel)"></span>', t.btnPenalti, t.btnPenaltiDesc, 5);
        botonesOpcion[5].innerHTML = contenidoDecision('<span class="decision__card" aria-hidden="true" style="background:var(--amarilla)"></span>', t.btnPenaltiAmarilla, t.btnPenaltiAmarillaDesc, 6);
        botonesOpcion[6].innerHTML = contenidoDecision('<span class="decision__glyph" aria-hidden="true">⚽</span>', t.btnGol, t.btnGolDesc, 7);
        botonesOpcion[7].innerHTML = contenidoDecision('<span class="decision__glyph" aria-hidden="true">🚩</span>', t.btnFueraDeJuego, t.btnFueraDeJuegoDesc, 8);
    }

    const btnSig = document.getElementById('btn-nueva-situacion');
    if (btnSig) btnSig.textContent = t.btnSiguiente;

    // Traducir la jugada que esté activa en pantalla en ese momento
    if (situacionActual) {
        const tituloSituacion = document.getElementById('situacion-titulo');
        const descripcionSituacion = document.getElementById('situacion-descripcion');
        if (tituloSituacion) {
            tituloSituacion.textContent = (idiomaActual === 'eu' && situacionActual.tipoEu) ? situacionActual.tipoEu : situacionActual.tipo;
        }
        if (descripcionSituacion) {
            descripcionSituacion.textContent = (idiomaActual === 'eu' && situacionActual.descripcionEu) ? situacionActual.descripcionEu : situacionActual.descripcion;
        }

        const nuevoPrefix = tipoModoJuego === "examen"
            ? (idiomaActual === 'eu' ? `Azterketa [${indiceExamenActual + 1}/${preguntasExamen.length}]` : `Examen [${indiceExamenActual + 1}/${preguntasExamen.length}]`)
            : `${t.jugada} #${situacionActual.id}`;
        const idSituacion = document.getElementById('situacion-id');
        const idSituacionPanel = document.getElementById('situacion-id-panel');
        if (idSituacion) idSituacion.textContent = nuevoPrefix;
        if (idSituacionPanel) idSituacionPanel.textContent = nuevoPrefix;

        actualizarMetaJugada(situacionActual);
    }

    // Marcar visualmente la bandera activa
    document.querySelectorAll('#selector-idioma button').forEach(b => {
        const activo = b.getAttribute('data-lang') === idiomaActual;
        b.classList.toggle('is-activo', activo);
        b.setAttribute('aria-pressed', activo ? 'true' : 'false');
    });

    document.documentElement.lang = idiomaActual;
}

// ==========================================
// 6. FIREBASE Y EVENTOS DOM
// ==========================================
async function guardarProgresoNubeAuto() {
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
            usuarioState = { puntos: 0, aciertos: 0, totalJugadas: 0, racha: 0, maxRacha: 0 };
            await guardarProgresoNubeAuto();
        }
        actualizarMarcadorInterfaz();
    } catch (e) {
        console.error("Error al cargar de Firestore:", e);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    actualizarMarcadorInterfaz();
    crearBarraModoUI();
    cargarNuevaSituacion();
    aplicarTraducciones();

    const botonNuevaSituacion = document.getElementById('btn-nueva-situacion');
    if (botonNuevaSituacion) {
        botonNuevaSituacion.addEventListener('click', cargarNuevaSituacion);
    }

    const botonesOpcion = document.querySelectorAll('.btn-opcion');
    botonesOpcion.forEach(boton => {
        boton.addEventListener('click', evaluarDecision);
    });

    document.addEventListener('keydown', (e) => {
        const enCampoDeTexto = document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
        if (enCampoDeTexto) return;
        const indice = parseInt(e.key, 10) - 1;
        if (Number.isNaN(indice) || indice < 0 || indice >= botonesOpcion.length) return;
        const boton = botonesOpcion[indice];
        if (boton && !boton.disabled) boton.click();
    });

    const contenedorBanderas = document.getElementById("selector-idioma");
    if (contenedorBanderas) {
        contenedorBanderas.addEventListener("click", (e) => {
            const boton = e.target.closest("button");
            if (!boton) return;
            idiomaActual = boton.getAttribute("data-lang");
            localStorage.setItem("refsim_idioma", idiomaActual);
            aplicarTraducciones();
            guardarProgresoNubeAuto();
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

    // --- MODAL DE AJUSTES ---
    const modalAjustes = document.getElementById("ajustes-modal");
    const btnCerrarAjustes = document.getElementById("btn-cerrar-ajustes");
    if (btnCerrarAjustes && modalAjustes) {
        btnCerrarAjustes.addEventListener("click", () => { modalAjustes.style.display = "none"; });
    }

    window.addEventListener("click", (e) => {
        if (modalAuth && e.target === modalAuth) { modalAuth.style.display = "none"; }
        if (modalAjustes && e.target === modalAjustes) { modalAjustes.style.display = "none"; }
    });

    // --- NAVEGACIÓN PRINCIPAL ---
    const navInicio = document.getElementById('nav-inicio');
    const navPractica = document.getElementById('nav-practica');
    const navExamen = document.getElementById('nav-examen');
    const navEstadisticas = document.getElementById('nav-estadisticas');
    const navAjustes = document.getElementById('nav-ajustes');

    if (navInicio) navInicio.addEventListener('click', () => iniciarModoPractica());
    if (navPractica) navPractica.addEventListener('click', () => iniciarModoPractica());
    if (navExamen) navExamen.addEventListener('click', () => iniciarModoExamenOficial());
    if (navEstadisticas) navEstadisticas.addEventListener('click', () => mostrarModalHistorial());
    if (navAjustes) navAjustes.addEventListener('click', () => { if (modalAjustes) modalAjustes.style.display = 'flex'; });

    // --- TARJETAS DE MODO ---
    const cardPractica = document.getElementById('modecard-practica');
    const cardExamen = document.getElementById('modecard-examen');
    const cardPartidos = document.getElementById('modecard-partidos');

    if (cardPractica) cardPractica.addEventListener('click', () => iniciarModoPractica());
    if (cardExamen) cardExamen.addEventListener('click', () => iniciarModoExamenOficial());
    if (cardPartidos) cardPartidos.addEventListener('click', () => mostrarModalHistorial());

    // --- MONITOR: siguiente jugada rápida y pantalla completa ---
    const btnJugadaSiguiente = document.getElementById('btn-jugada-siguiente');
    if (btnJugadaSiguiente) btnJugadaSiguiente.addEventListener('click', () => cargarNuevaSituacion());

    const btnFullscreen = document.getElementById('btn-fullscreen-monitor');
    if (btnFullscreen) {
        btnFullscreen.addEventListener('click', () => {
            const monitorEl = document.querySelector('.monitor');
            if (!monitorEl) return;
            if (!document.fullscreenElement) {
                monitorEl.requestFullscreen?.();
            } else {
                document.exitFullscreen?.();
            }
        });
    }

    const verificarFirebaseInterval = setInterval(() => {
        if (window.refSimFirebase) {
            clearInterval(verificarFirebaseInterval);
            configurarAuthFirebase(modalAuth, btnAbrirAuth);
        }
    }, 200);
});

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
            authContainer.style.cssText = "display: flex; align-items: center; gap: 10px;";
            btnAbrirAuth.parentNode.appendChild(authContainer);
        }

        if (user) {
            usuarioFirebaseActual = user;
            if (btnAbrirAuth) btnAbrirAuth.style.display = "none";
            await cargarProgresoNube(user.uid);

            if (authContainer) {
                let nombreCorto = user.email.split('@')[0];
                authContainer.classList.add('cuenta-pill');
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
            if (authContainer) { authContainer.innerHTML = ""; authContainer.classList.remove('cuenta-pill'); }
            usuarioState = { puntos: 0, aciertos: 0, totalJugadas: 0, racha: 0, maxRacha: 0 };
            actualizarMarcadorInterfaz();
        }
    });

    if (btnLogin && btnRegister && emailInput && passwordInput && statusText) {
        btnLogin.addEventListener("click", async () => {
            try {
                await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
                statusText.style.color = "#2E9B5E";
                statusText.innerText = t().authOk;
                setTimeout(() => { if (modalAuth) modalAuth.style.display = "none"; }, 1000);
            } catch (error) {
                statusText.style.color = "#E63946";
                statusText.innerText = t().authError + " " + error.message;
            }
        });

        btnRegister.addEventListener("click", async () => {
            try {
                await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
                statusText.style.color = "#2E9B5E";
                statusText.innerText = t().authCreada;
                setTimeout(() => { if (modalAuth) modalAuth.style.display = "none"; }, 1000);
            } catch (error) {
                statusText.style.color = "#E63946";
                statusText.innerText = t().authError + " " + error.message;
            }
        });
    }
}