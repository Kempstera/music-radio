/**
 * Music Radio — i18n dictionary + language management (vanilla JS)
 * 6 languages: English, Cymraeg, Deutsch, Français, Italiano, Español
 */
(function () {
  "use strict";

  var I18N = {
    en: {
      brand: "Music Radio",
      tagline: "Multi-Channel Web Radio",

      "nav.home": "Home",
      "nav.classical": "Classical",
      "nav.jazz": "Jazz",
      "nav.vibes": "Vibes",

      "home.title": "Music Radio — Multi-Channel Web Radio",
      "home.hero_title": "Your Soundtrack for Every Moment.",
      "home.hero_sub": "Classical, Jazz and curated Vibes — live streams from around the globe.",
      "home.classical_title": "Classical",
      "home.classical_desc": "Elegant orchestral and chamber music.",
      "home.jazz_title": "Jazz",
      "home.jazz_desc": "Classic, smooth, and lounge jazz vibes.",
      "home.vibes_title": "Vibes",
      "home.vibes_desc": "Ambient music for your day.",
      "home.stations": "stations",
      "home.view_all": "View All",

      "classical.title": "Classical Radio",
      "classical.subtitle": "Pure classical music, organized by geographic region.",
      "classical.choose_region": "Choose a region",
      "classical.stations": "stations",
      "classical.top_overall": "Top 20 Selected",

      "jazz.title": "Jazz Radio",
      "jazz.subtitle": "Relaxed and romantic, organized by sub-genre.",
      "jazz.choose": "Choose a sub-genre",
      "jazz.stations": "stations",

      "vibes.title": "Vibes Radio",
      "vibes.subtitle": "Ambient and scenario-based soundscapes.",
      "vibes.choose": "Choose a scenario",
      "vibes.stations": "tracks",

      "player.now_playing": "Now Playing",
      "player.nothing": "Select a station to begin",
      "player.play": "Play",
      "player.pause": "Pause",
      "player.volume": "Volume",
      "player.loading": "Buffering…",
      "player.error": "Stream unavailable",

      "footer.visitors": "Visitors",
      "footer.disclaimer": "This website is for personal use. All audio streams are aggregated from public internet sources. We do not host any media files.",

      "common.back": "Return to Home",
      "common.loading": "Loading stations…",
      "common.no_stations": "No stations available",
      "common.buffering": "Buffering…",
      "common.all": "All",
      "common.top_selected": "Top 20 Selected",

      "auth.sign_in": "Sign In",
      "auth.sign_up": "Sign Up",
      "auth.create_account": "Create Account",
      "auth.sign_out": "Sign Out",
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.my_profile": "My Profile",
      "auth.welcome_back": "Welcome back",
      "auth.signin_sub": "Sign in to continue listening.",
      "auth.signup_title": "Create your account",
      "auth.signup_sub": "One account for Classical, Jazz and Vibes.",
      "auth.email_placeholder": "you@example.com",
      "auth.password_placeholder": "At least 6 characters",
      "auth.new_here": "New here? Create Account",
      "auth.have_account": "Already have an account? Sign In",
      "auth.signing_in": "Signing in…",
      "auth.creating": "Creating account…",
      "auth.check_inbox": "Check your inbox",
      "auth.signup_success": "Registration successful! Please check your inbox and click the confirmation link to activate your account.",
      "auth.back_to_signin": "Back to Sign In",
      "auth.close": "Close",
      "auth.err_invalid_email": "Please enter a valid email address.",
      "auth.err_short_password": "Password must be at least 6 characters.",
      "auth.err_unavailable": "Authentication is unavailable. Please reload the page.",

      "guestbook.title": "Guestbook",
      "guestbook.leave_msg": "Leave a message...",
      "guestbook.name": "Name (Optional)",
      "guestbook.message": "Message",
      "guestbook.submit": "Submit",
      "guestbook.guest": "Guest",
      "guestbook.loading": "Loading messages…",
      "guestbook.empty": "No messages yet. Be the first to leave one!",
      "guestbook.err_load": "Could not load messages.",
      "guestbook.err_post": "Could not post your message. Please try again.",
      "guestbook.msg_required": "Please write a message.",

      "guestbook.posted": "Thanks! Your message has been posted.",

      "fav.title": "My Favorites",
      "fav.subtitle": "Your saved stations, all in one place.",
      "fav.signin_required": "Please sign in to save your favorite stations.",
      "fav.limit": "You can only save up to 20 stations.",
      "fav.added": "Added to favorites",
      "fav.removed": "Removed from favorites",
      "fav.empty": "No favorites yet. Tap the heart on any station to save it."
    },

    cy: {
      brand: "Music Radio",
      tagline: "Radio Gwe Aml-Sianel",

      "nav.home": "Hafan",
      "nav.classical": "Clasurol",
      "nav.jazz": "Jazz",
      "nav.vibes": "Awyrgylch",

      "home.title": "Music Radio — Radio Gwe Aml-Sianel",
      "home.hero_title": "Eich Trac Sain ar gyfer Pob Eiliad.",
      "home.hero_sub": "Clasurol, Jazz ac Awyrgylch dethol — ffrydiau byw o bedwar ban byd.",
      "home.classical_title": "Clasurol",
      "home.classical_desc": "Cerddoriaeth gerddorfaol a siambr gain.",
      "home.jazz_title": "Jazz",
      "home.jazz_desc": "Awyrgylch jazz clasurol, llyfn a lolfa.",
      "home.vibes_title": "Awyrgylch",
      "home.vibes_desc": "Cerddoriaeth amgylchynol i'ch diwrnod.",
      "home.stations": "gorsafoedd",
      "home.view_all": "Gweld y Cyfan",

      "classical.title": "Radio Clasurol",
      "classical.subtitle": "Cerddoriaeth glasurol bur, wedi'i threfnu yn ôl rhanbarth daearyddol.",
      "classical.choose_region": "Dewiswch ranbarth",
      "classical.stations": "gorsafoedd",
      "classical.top_overall": "Detholiad 20 Uchaf",

      "jazz.title": "Radio Jazz",
      "jazz.subtitle": "Ymlaciol a rhamantus, wedi'i drefnu yn ôl is-genre.",
      "jazz.choose": "Dewiswch is-genre",
      "jazz.stations": "gorsafoedd",

      "vibes.title": "Radio Awyrgylch",
      "vibes.subtitle": "Tirluniau sain amgylchynol a seiliedig ar senario.",
      "vibes.choose": "Dewiswch senario",
      "vibes.stations": "traciau",

      "player.now_playing": "Yn Chwarae Nawr",
      "player.nothing": "Dewiswch orsaf i ddechrau",
      "player.play": "Chwarae",
      "player.pause": "Seibio",
      "player.volume": "Cyfaint",
      "player.loading": "Yn byffro…",
      "player.error": "Ffrwd ddim ar gael",

      "footer.visitors": "Ymwelwyr",
      "footer.disclaimer": "Mae'r wefan hon at ddefnydd personol. Daw'r holl ffrydiau sain o ffynonellau rhyngrwyd cyhoeddus. Nid ydym yn cynnal unrhyw ffeiliau cyfryngau.",

      "common.back": "Dychwelyd i'r Hafan",
      "common.loading": "Wrthi'n llwytho gorsafoedd…",
      "common.no_stations": "Dim gorsafoedd ar gael",
      "common.buffering": "Yn byffro…",
      "common.all": "Popeth",
      "common.top_selected": "Detholiad 20 Uchaf",

      "auth.sign_in": "Mewngofnodi",
      "auth.sign_up": "Creu Cyfrif",
      "auth.create_account": "Creu Cyfrif",
      "auth.sign_out": "Allgofnodi",
      "auth.email": "E-bost",
      "auth.password": "Cyfrinair",
      "auth.my_profile": "Fy Mhroffil",
      "auth.welcome_back": "Croeso'n ôl",
      "auth.signin_sub": "Mewngofnodwch i barhau i wrando.",
      "auth.signup_title": "Creu eich cyfrif",
      "auth.signup_sub": "Un cyfrif ar gyfer Clasurol, Jazz ac Awyrgylch.",
      "auth.email_placeholder": "chi@enghraifft.com",
      "auth.password_placeholder": "O leiaf 6 chymeriad",
      "auth.new_here": "Yn newydd yma? Creu Cyfrif",
      "auth.have_account": "Cyfrif gennych eisoes? Mewngofnodi",
      "auth.signing_in": "Mewngofnodi…",
      "auth.creating": "Creu cyfrif…",
      "auth.check_inbox": "Gwiriwch eich mewnflwch",
      "auth.signup_success": "Cofrestru'n llwyddiannus! Gwiriwch eich mewnflwch a chliciwch ar y ddolen gadarnhau i weithredu'ch cyfrif.",
      "auth.back_to_signin": "Yn ôl i Mewngofnodi",
      "auth.close": "Cau",
      "auth.err_invalid_email": "Rhowch gyfeiriad e-bost dilys.",
      "auth.err_short_password": "Rhaid i'r cyfrinair fod yn 6 chymeriad o leiaf.",
      "auth.err_unavailable": "Nid yw dilysu ar gael. Ail-lwythwch y dudalen.",

      "guestbook.title": "Llyfr Ymwelwyr",
      "guestbook.leave_msg": "Gadewch neges...",
      "guestbook.name": "Enw (Dewisol)",
      "guestbook.message": "Neges",
      "guestbook.submit": "Cyflwyno",
      "guestbook.guest": "Gwestai",
      "guestbook.loading": "Wrthi'n llwytho negeseuon…",
      "guestbook.empty": "Dim negeseuon eto. Byddwch y cyntaf i adael un!",
      "guestbook.err_load": "Methwyd llwytho negeseuon.",
      "guestbook.err_post": "Methwyd postio eich neges. Ceisiwch eto.",
      "guestbook.msg_required": "Ysgrifennwch neges.",

      "guestbook.posted": "Diolch! Mae eich neges wedi'i phostio.",

      "fav.title": "Fy Ffefrynnau",
      "fav.subtitle": "Eich gorsafoedd wedi'u cadw, i gyd yn un lle.",
      "fav.signin_required": "Mewngofnodwch i gadw eich gorsafoedd dewisol.",
      "fav.limit": "Dim ond hyd at 20 gorsaf y gallwch eu cadw.",
      "fav.added": "Ychwanegwyd at y ffefrynnau",
      "fav.removed": "Tynnwyd o'r ffefrynnau",
      "fav.empty": "Dim ffefrynnau eto. Tapiwch y galon ar unrhyw orsaf i'w chadw."
    },

    de: {
      brand: "Music Radio",
      tagline: "Mehrkanal-Webradio",

      "nav.home": "Startseite",
      "nav.classical": "Klassik",
      "nav.jazz": "Jazz",
      "nav.vibes": "Vibes",

      "home.title": "Music Radio — Mehrkanal-Webradio",
      "home.hero_title": "Dein Soundtrack für jeden Moment.",
      "home.hero_sub": "Klassik, Jazz und kuratierte Vibes — Livestreams aus aller Welt.",
      "home.classical_title": "Klassik",
      "home.classical_desc": "Elegante Orchester- und Kammermusik.",
      "home.jazz_title": "Jazz",
      "home.jazz_desc": "Klassischer, sanfter und Lounge-Jazz.",
      "home.vibes_title": "Vibes",
      "home.vibes_desc": "Ambient-Musik für deinen Tag.",
      "home.stations": "Sender",
      "home.view_all": "Alle anzeigen",

      "classical.title": "Klassikradio",
      "classical.subtitle": "Reine klassische Musik, nach geografischer Region geordnet.",
      "classical.choose_region": "Region wählen",
      "classical.stations": "Sender",
      "classical.top_overall": "Top 20 Auswahl",

      "jazz.title": "Jazzradio",
      "jazz.subtitle": "Entspannt und romantisch, nach Subgenre geordnet.",
      "jazz.choose": "Subgenre wählen",
      "jazz.stations": "Sender",

      "vibes.title": "Vibes Radio",
      "vibes.subtitle": "Ambiente und szenenbasierte Klanglandschaften.",
      "vibes.choose": "Szenerie wählen",
      "vibes.stations": "Streams",

      "player.now_playing": "Jetzt läuft",
      "player.nothing": "Wähle einen Sender",
      "player.play": "Abspielen",
      "player.pause": "Pause",
      "player.volume": "Lautstärke",
      "player.loading": "Puffert…",
      "player.error": "Stream nicht verfügbar",

      "footer.visitors": "Besucher",
      "footer.disclaimer": "Diese Website dient dem persönlichen Gebrauch. Alle Audiostreams stammen aus öffentlichen Internetquellen. Wir hosten keine Mediendateien.",

      "common.back": "Zurück zur Startseite",
      "common.loading": "Sender werden geladen…",
      "common.no_stations": "Keine Sender verfügbar",
      "common.buffering": "Puffert…",
      "common.all": "Alle",
      "common.top_selected": "Top 20 Auswahl",

      "auth.sign_in": "Anmelden",
      "auth.sign_up": "Registrieren",
      "auth.create_account": "Konto erstellen",
      "auth.sign_out": "Abmelden",
      "auth.email": "E-Mail",
      "auth.password": "Passwort",
      "auth.my_profile": "Mein Profil",
      "auth.welcome_back": "Willkommen zurück",
      "auth.signin_sub": "Melden Sie sich an, um weiterzuhören.",
      "auth.signup_title": "Konto erstellen",
      "auth.signup_sub": "Ein Konto für Klassik, Jazz und Vibes.",
      "auth.email_placeholder": "sie@beispiel.de",
      "auth.password_placeholder": "Mindestens 6 Zeichen",
      "auth.new_here": "Neu hier? Konto erstellen",
      "auth.have_account": "Schon ein Konto? Anmelden",
      "auth.signing_in": "Anmeldung…",
      "auth.creating": "Konto wird erstellt…",
      "auth.check_inbox": "E-Mail-Postfach prüfen",
      "auth.signup_success": "Registrierung erfolgreich! Bitte prüfen Sie Ihren Posteingang und klicken Sie auf den Bestätigungslink, um Ihr Konto zu aktivieren.",
      "auth.back_to_signin": "Zurück zur Anmeldung",
      "auth.close": "Schließen",
      "auth.err_invalid_email": "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      "auth.err_short_password": "Das Passwort muss mindestens 6 Zeichen lang sein.",
      "auth.err_unavailable": "Authentifizierung nicht verfügbar. Bitte laden Sie die Seite neu.",

      "guestbook.title": "Gästebuch",
      "guestbook.leave_msg": "Hinterlassen Sie eine Nachricht...",
      "guestbook.name": "Name (optional)",
      "guestbook.message": "Nachricht",
      "guestbook.submit": "Absenden",
      "guestbook.guest": "Gast",
      "guestbook.loading": "Nachrichten werden geladen…",
      "guestbook.empty": "Noch keine Nachrichten. Seien Sie der Erste!",
      "guestbook.err_load": "Nachrichten konnten nicht geladen werden.",
      "guestbook.err_post": "Ihre Nachricht konnte nicht gepostet werden. Bitte versuchen Sie es erneut.",
      "guestbook.msg_required": "Bitte schreiben Sie eine Nachricht.",

      "guestbook.posted": "Danke! Ihre Nachricht wurde veröffentlicht.",

      "fav.title": "Meine Favoriten",
      "fav.subtitle": "Ihre gespeicherten Sender, alle an einem Ort.",
      "fav.signin_required": "Melden Sie sich an, um Ihre Lieblingssender zu speichern.",
      "fav.limit": "Sie können nur bis zu 20 Sender speichern.",
      "fav.added": "Zu den Favoriten hinzugefügt",
      "fav.removed": "Aus den Favoriten entfernt",
      "fav.empty": "Noch keine Favoriten. Tippen Sie auf das Herz einer Station, um sie zu speichern."
    },

    fr: {
      brand: "Music Radio",
      tagline: "Radio web multicanaux",

      "nav.home": "Accueil",
      "nav.classical": "Classique",
      "nav.jazz": "Jazz",
      "nav.vibes": "Vibes",

      "home.title": "Music Radio — Radio web multicanaux",
      "home.hero_title": "Votre bande-son pour chaque instant.",
      "home.hero_sub": "Classique, jazz et Vibes sélectionnés — flux en direct du monde entier.",
      "home.classical_title": "Classique",
      "home.classical_desc": "Musique orchestrale et de chambre élégante.",
      "home.jazz_title": "Jazz",
      "home.jazz_desc": "Jazz classique, smooth et lounge.",
      "home.vibes_title": "Vibes",
      "home.vibes_desc": "Musique ambient pour votre journée.",
      "home.stations": "stations",
      "home.view_all": "Tout afficher",

      "classical.title": "Radio Classique",
      "classical.subtitle": "Musique classique pure, classée par région géographique.",
      "classical.choose_region": "Choisir une région",
      "classical.stations": "stations",
      "classical.top_overall": "Top 20 Sélection",

      "jazz.title": "Radio Jazz",
      "jazz.subtitle": "Détendu et romantique, classé par sous-genre.",
      "jazz.choose": "Choisir un sous-genre",
      "jazz.stations": "stations",

      "vibes.title": "Radio Vibes",
      "vibes.subtitle": "Ambiances et scénarios sonores.",
      "vibes.choose": "Choisir un scénario",
      "vibes.stations": "pistes",

      "player.now_playing": "En cours",
      "player.nothing": "Sélectionnez une station",
      "player.play": "Lecture",
      "player.pause": "Pause",
      "player.volume": "Volume",
      "player.loading": "Mise en mémoire tampon…",
      "player.error": "Flux indisponible",

      "footer.visitors": "Visiteurs",
      "footer.disclaimer": "Ce site est à usage personnel. Tous les flux audio proviennent de sources Internet publiques. Nous n'hébergeons aucun fichier multimédia.",

      "common.back": "Retour à l'accueil",
      "common.loading": "Chargement des stations…",
      "common.no_stations": "Aucune station disponible",
      "common.buffering": "Mise en mémoire tampon…",
      "common.all": "Tout",
      "common.top_selected": "Top 20 Sélection",

      "auth.sign_in": "Se connecter",
      "auth.sign_up": "S'inscrire",
      "auth.create_account": "Créer un compte",
      "auth.sign_out": "Se déconnecter",
      "auth.email": "E-mail",
      "auth.password": "Mot de passe",
      "auth.my_profile": "Mon profil",
      "auth.welcome_back": "Bon retour",
      "auth.signin_sub": "Connectez-vous pour continuer à écouter.",
      "auth.signup_title": "Créez votre compte",
      "auth.signup_sub": "Un compte pour Classique, Jazz et Vibes.",
      "auth.email_placeholder": "vous@exemple.fr",
      "auth.password_placeholder": "Au moins 6 caractères",
      "auth.new_here": "Nouveau ici ? Créer un compte",
      "auth.have_account": "Déjà un compte ? Se connecter",
      "auth.signing_in": "Connexion…",
      "auth.creating": "Création du compte…",
      "auth.check_inbox": "Vérifiez votre boîte de réception",
      "auth.signup_success": "Inscription réussie ! Veuillez vérifier votre boîte de réception et cliquer sur le lien de confirmation pour activer votre compte.",
      "auth.back_to_signin": "Retour à la connexion",
      "auth.close": "Fermer",
      "auth.err_invalid_email": "Veuillez saisir une adresse e-mail valide.",
      "auth.err_short_password": "Le mot de passe doit contenir au moins 6 caractères.",
      "auth.err_unavailable": "Authentification indisponible. Veuillez recharger la page.",

      "guestbook.title": "Livre d'or",
      "guestbook.leave_msg": "Laissez un message...",
      "guestbook.name": "Nom (facultatif)",
      "guestbook.message": "Message",
      "guestbook.submit": "Envoyer",
      "guestbook.guest": "Invité",
      "guestbook.loading": "Chargement des messages…",
      "guestbook.empty": "Pas encore de messages. Soyez le premier !",
      "guestbook.err_load": "Impossible de charger les messages.",
      "guestbook.err_post": "Impossible de publier votre message. Veuillez réessayer.",
      "guestbook.msg_required": "Veuillez écrire un message.",

      "guestbook.posted": "Merci ! Votre message a été publié.",

      "fav.title": "Mes favoris",
      "fav.subtitle": "Vos stations enregistrées, toutes au même endroit.",
      "fav.signin_required": "Connectez-vous pour enregistrer vos stations préférées.",
      "fav.limit": "Vous ne pouvez enregistrer que 20 stations au maximum.",
      "fav.added": "Ajouté aux favoris",
      "fav.removed": "Retiré des favoris",
      "fav.empty": "Pas encore de favoris. Touchez le cœur d'une station pour l'enregistrer."
    },

    it: {
      brand: "Music Radio",
      tagline: "Radio web multicanale",

      "nav.home": "Home",
      "nav.classical": "Classica",
      "nav.jazz": "Jazz",
      "nav.vibes": "Vibes",

      "home.title": "Music Radio — Radio web multicanale",
      "home.hero_title": "La tua colonna sonora per ogni momento.",
      "home.hero_sub": "Classica, jazz e Vibes curati — streaming dal vivo da tutto il mondo.",
      "home.classical_title": "Classica",
      "home.classical_desc": "Elegante musica orchestrale e da camera.",
      "home.jazz_title": "Jazz",
      "home.jazz_desc": "Jazz classico, smooth e lounge.",
      "home.vibes_title": "Vibes",
      "home.vibes_desc": "Musica ambient per la tua giornata.",
      "home.stations": "stazioni",
      "home.view_all": "Mostra tutti",

      "classical.title": "Radio Classica",
      "classical.subtitle": "Musica classica pura, organizzata per regione geografica.",
      "classical.choose_region": "Scegli una regione",
      "classical.stations": "stazioni",
      "classical.top_overall": "Top 20 Selezionati",

      "jazz.title": "Radio Jazz",
      "jazz.subtitle": "Rilassato e romantico, organizzato per sottogenere.",
      "jazz.choose": "Scegli un sottogenere",
      "jazz.stations": "stazioni",

      "vibes.title": "Radio Vibes",
      "vibes.subtitle": "Ambient e scenari sonori.",
      "vibes.choose": "Scegli uno scenario",
      "vibes.stations": "brani",

      "player.now_playing": "In riproduzione",
      "player.nothing": "Seleziona una stazione",
      "player.play": "Riproduci",
      "player.pause": "Pausa",
      "player.volume": "Volume",
      "player.loading": "Buffering…",
      "player.error": "Stream non disponibile",

      "footer.visitors": "Visitatori",
      "footer.disclaimer": "Questo sito è per uso personale. Tutti i flussi audio provengono da fonti internet pubbliche. Non ospitiamo alcun file multimediale.",

      "common.back": "Torna alla home",
      "common.loading": "Caricamento stazioni…",
      "common.no_stations": "Nessuna stazione disponibile",
      "common.buffering": "Buffering…",
      "common.all": "Tutte",
      "common.top_selected": "Top 20 Selezionati",

      "auth.sign_in": "Accedi",
      "auth.sign_up": "Registrati",
      "auth.create_account": "Crea un account",
      "auth.sign_out": "Esci",
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.my_profile": "Il mio profilo",
      "auth.welcome_back": "Bentornato",
      "auth.signin_sub": "Accedi per continuare ad ascoltare.",
      "auth.signup_title": "Crea il tuo account",
      "auth.signup_sub": "Un account per Classica, Jazz e Vibes.",
      "auth.email_placeholder": "tu@esempio.it",
      "auth.password_placeholder": "Almeno 6 caratteri",
      "auth.new_here": "Nuovo qui? Crea un account",
      "auth.have_account": "Hai già un account? Accedi",
      "auth.signing_in": "Accesso…",
      "auth.creating": "Creazione account…",
      "auth.check_inbox": "Controlla la tua casella di posta",
      "auth.signup_success": "Registrazione completata! Controlla la tua casella di posta e clicca sul link di conferma per attivare il tuo account.",
      "auth.back_to_signin": "Torna all'accesso",
      "auth.close": "Chiudi",
      "auth.err_invalid_email": "Inserisci un indirizzo email valido.",
      "auth.err_short_password": "La password deve contenere almeno 6 caratteri.",
      "auth.err_unavailable": "Autenticazione non disponibile. Ricarica la pagina.",

      "guestbook.title": "Libro ospiti",
      "guestbook.leave_msg": "Lascia un messaggio...",
      "guestbook.name": "Nome (facoltativo)",
      "guestbook.message": "Messaggio",
      "guestbook.submit": "Invia",
      "guestbook.guest": "Ospite",
      "guestbook.loading": "Caricamento messaggi…",
      "guestbook.empty": "Nessun messaggio. Sii il primo!",
      "guestbook.err_load": "Impossibile caricare i messaggi.",
      "guestbook.err_post": "Impossibile pubblicare il tuo messaggio. Riprova.",
      "guestbook.msg_required": "Scrivi un messaggio.",

      "guestbook.posted": "Grazie! Il tuo messaggio è stato pubblicato.",

      "fav.title": "I miei preferiti",
      "fav.subtitle": "Le tue stazioni salvate, tutte in un unico posto.",
      "fav.signin_required": "Accedi per salvare le tue stazioni preferite.",
      "fav.limit": "Puoi salvare al massimo 20 stazioni.",
      "fav.added": "Aggiunto ai preferiti",
      "fav.removed": "Rimosso dai preferiti",
      "fav.empty": "Nessun preferito ancora. Tocca il cuore su una stazione per salvarla."
    },

    es: {
      brand: "Music Radio",
      tagline: "Radio web multicanal",

      "nav.home": "Inicio",
      "nav.classical": "Clásica",
      "nav.jazz": "Jazz",
      "nav.vibes": "Vibes",

      "home.title": "Music Radio — Radio web multicanal",
      "home.hero_title": "Tu banda sonora para cada momento.",
      "home.hero_sub": "Clásica, jazz y Vibes seleccionados — emisiones en directo de todo el mundo.",
      "home.classical_title": "Clásica",
      "home.classical_desc": "Elegante música orquestal y de cámara.",
      "home.jazz_title": "Jazz",
      "home.jazz_desc": "Jazz clásico, suave y lounge.",
      "home.vibes_title": "Vibes",
      "home.vibes_desc": "Música ambient para tu día.",
      "home.stations": "emisoras",
      "home.view_all": "Ver todo",

      "classical.title": "Radio Clásica",
      "classical.subtitle": "Música clásica pura, organizada por región geográfica.",
      "classical.choose_region": "Elige una región",
      "classical.stations": "emisoras",
      "classical.top_overall": "Top 20 Seleccionados",

      "jazz.title": "Radio Jazz",
      "jazz.subtitle": "Relajado y romántico, organizado por subgénero.",
      "jazz.choose": "Elige un subgénero",
      "jazz.stations": "emisoras",

      "vibes.title": "Radio Vibes",
      "vibes.subtitle": "Ambient y escenarios sonoros.",
      "vibes.choose": "Elige un escenario",
      "vibes.stations": "pistas",

      "player.now_playing": "Sonando",
      "player.nothing": "Selecciona una emisora",
      "player.play": "Reproducir",
      "player.pause": "Pausa",
      "player.volume": "Volumen",
      "player.loading": "Cargando…",
      "player.error": "Stream no disponible",

      "footer.visitors": "Visitantes",
      "footer.disclaimer": "Este sitio es de uso personal. Todas las emisiones de audio provienen de fuentes públicas de internet. No alojamos ningún archivo multimedia.",

      "common.back": "Volver al inicio",
      "common.loading": "Cargando emisoras…",
      "common.no_stations": "No hay emisoras disponibles",
      "common.buffering": "Cargando…",
      "common.all": "Todas",
      "common.top_selected": "Top 20 Seleccionados",

      "auth.sign_in": "Iniciar sesión",
      "auth.sign_up": "Registrarse",
      "auth.create_account": "Crear cuenta",
      "auth.sign_out": "Cerrar sesión",
      "auth.email": "Correo electrónico",
      "auth.password": "Contraseña",
      "auth.my_profile": "Mi perfil",
      "auth.welcome_back": "Bienvenido de nuevo",
      "auth.signin_sub": "Inicia sesión para seguir escuchando.",
      "auth.signup_title": "Crea tu cuenta",
      "auth.signup_sub": "Una cuenta para Clásica, Jazz y Vibes.",
      "auth.email_placeholder": "tu@ejemplo.es",
      "auth.password_placeholder": "Al menos 6 caracteres",
      "auth.new_here": "¿Nuevo aquí? Crear cuenta",
      "auth.have_account": "¿Ya tienes una cuenta? Iniciar sesión",
      "auth.signing_in": "Iniciando sesión…",
      "auth.creating": "Creando cuenta…",
      "auth.check_inbox": "Revisa tu bandeja de entrada",
      "auth.signup_success": "¡Registro completado! Revisa tu bandeja de entrada y haz clic en el enlace de confirmación para activar tu cuenta.",
      "auth.back_to_signin": "Volver a iniciar sesión",
      "auth.close": "Cerrar",
      "auth.err_invalid_email": "Introduce un correo electrónico válido.",
      "auth.err_short_password": "La contraseña debe tener al menos 6 caracteres.",
      "auth.err_unavailable": "Autenticación no disponible. Recarga la página.",

      "guestbook.title": "Libro de visitas",
      "guestbook.leave_msg": "Deja un mensaje...",
      "guestbook.name": "Nombre (opcional)",
      "guestbook.message": "Mensaje",
      "guestbook.submit": "Enviar",
      "guestbook.guest": "Invitado",
      "guestbook.loading": "Cargando mensajes…",
      "guestbook.empty": "Aún no hay mensajes. ¡Sé el primero!",
      "guestbook.err_load": "No se pudieron cargar los mensajes.",
      "guestbook.err_post": "No se pudo publicar tu mensaje. Inténtalo de nuevo.",
      "guestbook.msg_required": "Escribe un mensaje.",

      "guestbook.posted": "¡Gracias! Tu mensaje ha sido publicado.",

      "fav.title": "Mis favoritos",
      "fav.subtitle": "Tus emisoras guardadas, todas en un solo lugar.",
      "fav.signin_required": "Inicia sesión para guardar tus emisoras favoritas.",
      "fav.limit": "Solo puedes guardar hasta 20 emisoras.",
      "fav.added": "Añadido a favoritos",
      "fav.removed": "Eliminado de favoritos",
      "fav.empty": "Aún no hay favoritos. Toca el corazón de una emisora para guardarla."
    }
  };

  var LANGUAGES = [
    { code: "en", label: "English" },
    { code: "cy", label: "Cymraeg" },
    { code: "de", label: "Deutsch" },
    { code: "fr", label: "Français" },
    { code: "it", label: "Italiano" },
    { code: "es", label: "Español" }
  ];

  var currentLang = "en";

  function detectLang() {
    var saved = null;
    try { saved = localStorage.getItem("music-radio-lang"); } catch (e) { /* noop */ }
    if (saved && I18N[saved]) return saved;
    var nav = (navigator.language || "en").toLowerCase();
    var two = nav.slice(0, 2);
    if (I18N[two]) return two;
    if (I18N[nav]) return nav;
    return "en";
  }

  function t(key, vars) {
    var s = (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.split("{" + k + "}").join(vars[k]);
      });
    }
    return s;
  }

  function applyTranslations() {
    document.documentElement.lang = currentLang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      var spec = el.getAttribute("data-i18n-attr"); // "title:key" or "aria-label:key"
      var parts = spec.split(":");
      var attr = parts[0];
      var key = parts.slice(1).join(":");
      el.setAttribute(attr, t(key));
    });
    var titleEl = document.querySelector("title[data-i18n]");
    if (titleEl) document.title = t(titleEl.getAttribute("data-i18n"));
  }

  function buildLangSwitcher() {
    var sel = document.getElementById("lang-switcher");
    if (!sel) return;
    LANGUAGES.forEach(function (lang) {
      var opt = document.createElement("option");
      opt.value = lang.code;
      opt.textContent = lang.label;
      sel.appendChild(opt);
    });
    sel.value = currentLang;
    sel.addEventListener("change", function () {
      setLang(sel.value);
    });
  }

  function setLang(code) {
    if (!I18N[code]) code = "en";
    currentLang = code;
    try { localStorage.setItem("music-radio-lang", code); } catch (e) { /* noop */ }
    applyTranslations();
    if (window.onLanguageChange) window.onLanguageChange(code);
    document.dispatchEvent(new CustomEvent("langchange", { detail: code }));
  }

  window.I18N = {
    t: t,
    getLang: function () { return currentLang; },
    setLang: setLang,
    languages: LANGUAGES,
    init: function () {
      currentLang = detectLang();
      buildLangSwitcher();
      applyTranslations();
      document.dispatchEvent(new CustomEvent("langchange", { detail: currentLang }));
    }
  };
})();
