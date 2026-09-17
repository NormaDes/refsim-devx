// ==========================================
// 0. ESTADO GLOBAL E IDIOMAS
// ==========================================
let idiomaActual = localStorage.getItem("refsim_idioma") || "es";
let situacionActual = null;
let marcadorActual = null;
let usuarioFirebaseActual = null;
let usuarioState = { puntos: 0, aciertos: 0, totalJugadas: 0, racha: 0, maxRacha: 0 };

// Lienzo de referencia de las coordenadas posX / posY de la base de datos.
// El campo es fluido: convertimos esos px a % para que el marcador caiga
// siempre en el mismo sitio en cualquier pantalla.
const CAMPO_REF = { ancho: 760, alto: 450 };

const traducciones = {
    es: {
        tagSimulador: "Simulador arbitral \u00b7 Reglas del Juego IFAB",
        lblPuntos: "Puntos",
        lblPrecision: "Precisi\u00f3n",
        lblRacha: "Racha",
        btnAcceso: "Acceso",
        varRepeticion: "VAR \u00b7 Repetici\u00f3n de la jugada",
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

        aciertoMsg: "Decisi\u00f3n correcta",
        falloMsg: "Decisi\u00f3n incorrecta",
        decisionOficial: "Decisi\u00f3n oficial:",

        authTitulo: "Acceso a RefSim",
        authIntro: "Entra para guardar tus puntos y tu racha en cualquier dispositivo.",
        authEmail: "Correo electr\u00f3nico",
        authPassword: "Contrase\u00f1a",
        authLogin: "Iniciar sesi\u00f3n",
        authRegister: "Crear cuenta",
        authCerrarSesion: "Cerrar sesi\u00f3n",
        authOk: "Sesi\u00f3n iniciada",
        authCreada: "Cuenta creada",
        authError: "No se ha podido completar:",

        adLabel: "Publicidad",
        footer: "\u00a9 2026 RefSim \u2014 Basado en las Reglas del Juego de la IFAB.",

        nombreDecision: {
            "No hay falta": "No hay falta",
            "Falta": "Falta",
            "Falta + Tarjeta Amarilla": "Falta + tarjeta amarilla",
            "Falta + Tarjeta Roja": "Falta + tarjeta roja",
            "Penalti": "Penalti",
            "Penalti + Tarjeta Amarilla": "Penalti + tarjeta amarilla",
            "Gol": "Gol",
            "Fuera de juego": "Fuera de juego"
        }
    },

    eu: {
        tagSimulador: "Arbitraje simulagailua \u00b7 IFAB Jokoaren Arauak",
        lblPuntos: "Puntuak",
        lblPrecision: "Zehaztasuna",
        lblRacha: "Bolada",
        btnAcceso: "Sartu",
        varRepeticion: "VAR \u00b7 Jokaldiaren errepikapena",
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
        footer: "\u00a9 2026 RefSim \u2014 IFABen Jokoaren Arauetan oinarritua.",

        nombreDecision: {
            "No hay falta": "Ez dago faltarik",
            "Falta": "Falta",
            "Falta + Tarjeta Amarilla": "Falta + txartel horia",
            "Falta + Tarjeta Roja": "Falta + txartel gorria",
            "Penalti": "Penaltia",
            "Penalti + Tarjeta Amarilla": "Penaltia + txartel horia",
            "Gol": "Gola",
            "Fuera de juego": "Jokoz kanpo"
        }
    }
};

function t() {
    return traducciones[idiomaActual] || traducciones.es;
}

// ==========================================
// 1. BASE DE DATOS DE SITUACIONES (IFAB - Bilingüe)
// ==========================================
let indicesDisponibles = []; // 📌 Lista para el sistema aleatorio sin repetición

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
        descripcionEu: "Defentsa batek nahita oinez pasatzen dio baloia bere atezainari eta honek eskuekin hartzen du.",
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
// 3. LÓGICA DEL JUEGO
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

    if (situacionesDB.length === 0) return;

    // Si la lista de índices está vacía, rellenamos y barajamos los 50 elementos
    if (indicesDisponibles.length === 0) {
        indicesDisponibles = Array.from({ length: situacionesDB.length }, (_, i) => i);
        // Algoritmo Fisher-Yates para mezcla aleatoria
        for (let i = indicesDisponibles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indicesDisponibles[i], indicesDisponibles[j]] = [indicesDisponibles[j], indicesDisponibles[i]];
        }
    }

    // Extraemos la siguiente jugada aleatoria sin repetir de la lista
    const indiceAleatorio = indicesDisponibles.pop();
    situacionActual = situacionesDB[indiceAleatorio];

    const idSituacion = document.getElementById('situacion-id');
    const tituloSituacion = document.getElementById('situacion-titulo');
    const descripcionSituacion = document.getElementById('situacion-descripcion');

    if (idSituacion) idSituacion.textContent = `${t().jugada} #${situacionActual.id}`;
    
    if (tituloSituacion) {
        tituloSituacion.textContent = (idiomaActual === 'eu' && situacionActual.tipoEu) ? situacionActual.tipoEu : situacionActual.tipo;
    }
    if (descripcionSituacion) {
        descripcionSituacion.textContent = (idiomaActual === 'eu' && situacionActual.descripcionEu) ? situacionActual.descripcionEu : situacionActual.descripcion;
    }

    colocarMarcador(situacionActual.posX, situacionActual.posY);
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
    
    const panelFeedback = document.getElementById('panel-feedback');
    const resultadoFeedback = document.getElementById('feedback-resultado');
    const explicacionFeedback = document.getElementById('feedback-explicacion');

    botonesOpcion.forEach(btn => {
        btn.disabled = true;
        if (btn.getAttribute('data-decision') === situacionActual.decisionCorrecta) {
            btn.classList.add('es-correcta');
        }
    });
    
    if (panelFeedback) {
        panelFeedback.classList.remove('oculto');
        panelFeedback.classList.remove('acierto', 'fallo');
    }

    usuarioState.totalJugadas++;

    if (decisionElegida.trim() === situacionActual.decisionCorrecta.trim()) {
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

function actualizarMarcadorInterfaz() {
    const statPuntos = document.getElementById('stat-puntos');
    const statPrecision = document.getElementById('stat-precision');
    const statRacha = document.getElementById('stat-racha');

    const precisionCalculada = usuarioState.totalJugadas > 0 
        ? Math.round((usuarioState.aciertos / usuarioState.totalJugadas) * 100) 
        : 0;

    if (statPuntos) statPuntos.textContent = usuarioState.puntos;
    if (statPrecision) statPrecision.textContent = `${precisionCalculada}%`;
    if (statRacha) statRacha.textContent = usuarioState.racha;
}

function aplicarTraducciones() {
    const t = traducciones[idiomaActual] || traducciones.es;
    
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

    const botonesOpcion = document.querySelectorAll('.btn-opcion');
    if (botonesOpcion.length >= 8) {
        botonesOpcion[0].innerHTML = `<span class="decision__glyph" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12.5L10 17.5L19 6.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span> ${t.btnNoFalta}`;
        botonesOpcion[1].innerHTML = `<span class="decision__glyph" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.2"/><path d="M12 7v6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="16.3" r="1.15" fill="currentColor"/></svg></span> ${t.btnFalta}`;
        botonesOpcion[2].innerHTML = `<span class="decision__card" aria-hidden="true"></span> ${t.btnAmarilla}`;
        botonesOpcion[3].innerHTML = `<span class="decision__card" aria-hidden="true"></span> ${t.btnRoja}`;
        botonesOpcion[4].innerHTML = `<span class="decision__card" aria-hidden="true" style="background:var(--papel)"></span> ${t.btnPenalti}`;
        botonesOpcion[5].innerHTML = `<span class="decision__card" aria-hidden="true" style="background:var(--amarilla)"></span> ${t.btnPenaltiAmarilla}`;
        botonesOpcion[6].innerHTML = `<span class="decision__glyph" aria-hidden="true">⚽</span> ${t.btnGol}`;
        botonesOpcion[7].innerHTML = `<span class="decision__glyph" aria-hidden="true">🚩</span> ${t.btnFueraDeJuego}`;
    }

    const btnSig = document.getElementById('btn-nueva-situacion');
    if (btnSig) btnSig.textContent = t.btnSiguiente;

    if (situacionActual) {
        const tituloSituacion = document.getElementById('situacion-titulo');
        const descripcionSituacion = document.getElementById('situacion-descripcion');
        if (tituloSituacion) {
            tituloSituacion.textContent = (idiomaActual === 'eu' && situacionActual.tipoEu) ? situacionActual.tipoEu : situacionActual.tipo;
        }
        if (descripcionSituacion) {
            descripcionSituacion.textContent = (idiomaActual === 'eu' && situacionActual.descripcionEu) ? situacionActual.descripcionEu : situacionActual.descripcion;
        }
    }

    // --- Etiqueta de la jugada ---
    const idSit = document.getElementById('situacion-id');
    if (idSit && situacionActual) idSit.textContent = `${t.jugada} #${situacionActual.id}`;

    // --- Modal de acceso ---
    const fijar = (selector, propiedad, valor) => {
        const el = document.querySelector(selector);
        if (el) el[propiedad] = valor;
    };
    fijar('#auth-titulo', 'textContent', t.authTitulo);
    fijar('.auth-card__intro', 'textContent', t.authIntro);
    fijar('#user-email', 'placeholder', t.authEmail);
    fijar('#user-password', 'placeholder', t.authPassword);
    fijar('#btn-login', 'textContent', t.authLogin);
    fijar('#btn-register', 'textContent', t.authRegister);
    fijar('#btn-cerrar-sesion', 'textContent', t.authCerrarSesion);

    // --- Publicidad y pie ---
    document.querySelectorAll('.ad-slot__label').forEach(el => { el.textContent = t.adLabel; });
    fijar('.footer-legal p', 'textContent', t.footer);

    // --- Bandera activa ---
    document.querySelectorAll('#selector-idioma button').forEach(b => {
        const activo = b.getAttribute('data-lang') === idiomaActual;
        b.classList.toggle('is-activo', activo);
        b.setAttribute('aria-pressed', activo ? 'true' : 'false');
    });

    document.documentElement.lang = idiomaActual;
}

// ==========================================
// 4. FIREBASE Y EVENTOS DOM
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
    window.addEventListener("click", (e) => {
        if (modalAuth && e.target === modalAuth) { modalAuth.style.display = "none"; }
    });

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
                authContainer.innerHTML = `
                    <span style="color: var(--amarilla); font-weight: 700; font-size: 0.85rem;">👤 ${nombreCorto}</span>
                    <button id="btn-cerrar-sesion" style="background: #E63946; color: white; border: none; padding: 6px 10px; border-radius: var(--radio-s); font-weight: 700; cursor: pointer; font-size: 0.8rem;">${t().authCerrarSesion}</button>
                `;
                document.getElementById("btn-cerrar-sesion").addEventListener("click", async () => {
                    await signOut(auth);
                    location.reload();
                });
            }
        } else {
            usuarioFirebaseActual = null;
            if (btnAbrirAuth) btnAbrirAuth.style.display = "block";
            if (authContainer) authContainer.innerHTML = "";
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