/*_______________________________________________________
|                 AquosRemote v0.1                       |
|                                                        |
| Authors : Jérôme Garcia Miranda & Phil Bri ( 01/2015 ) |
| Description :                                          |
|    Sharp Aquos TV's Plugin for SARAH project           |
|    (See http://encausse.wordpress.com/s-a-r-a-h/)      |
|________________________________________________________|
*/

exports.action = function ( data , callback , config , SARAH ) {

	var net = require ( 'net' ),
		config = cfg.modules.AquosRemote,
		Aquos = {};

	if ( !config.IP ){
		console.log( "\nAquosRemote [Erreur] => IP non configurée !" );
		return; callback ({ 'tts' : 'Adresse I P incorrecte !' });
	}

	Aquos.IP 		= config.IP,
	Aquos.Port 		= ( typeof config.Port != 'undefined' ) ? config.Port : 10002,
	Aquos.User 		= ( typeof config.User != 'undefined' ) ? config.User : false,
	Aquos.password 	= ( typeof config.password != 'undefined' ) ? config.password : false;

	var socket = net.connect ({ host: Aquos.IP, port: Aquos.Port });

	socket.on ( 'connect', function() {
		console.log ( '\nAquosRemote => Connexion = [OK]');
	});

	socket.on ( 'data', function ( data ) {
		Aquos.Data = data.toString();

		// Debug
		console.log ( '\n--------- Valeur à communiquer (ci-dessous) ----------');
		console.log (Aquos);
		console.log ( '------------------------------------------------------\n');
		// End debug

		if ( Aquos.Data.indexOf( "Login" ) != -1 ) {
			if ( !Aquos.User || !Aquos.password ) {
				socket.destroy();
				console.log ( '\nAquosRemote [Erreur] => User et/ou Password absents' );
				return callback ({ "tts" : "Erreur d'authentification. Nom d'utilisateur et ou mot de passe absent." });
			}
			else socket.write ( Aquos.Username + "\n" + Aquos.password + "\n" );
		}
		if ( Aquos.Data.indexOf( "OK" ) != -1 ) {
			socket.end (data.cmd + "   \x0D" );
			console.log ( '\nAquosRemote => Cmd = [OK]');
			callback ({ "tts" : data.ttsAction });
		}
		if ( Aquos.Data.indexOf( "User Name or Password mismatch" ) != -1 ) {
			socket.destroy();
			console.log ( '\nAquosRemote [Erreur] => User et/ou Password incorrects' );
			return; callback ({ "tts" : "Erreur d'authentification. Nom d'utilisateur et ou mot de passe incorrects." });
		}
	});

	socket.on ( 'error', function ( erreur) {
		console.log ( '\nAquosRemote [Erreur] => ' + erreur );
		return;// callback ({ 'tts' : 'Erreur de connexion !'});
	});
}
