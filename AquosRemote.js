exports.action = function ( data , callback , config , SARAH ) {

	var net = require ( 'net' ),
		cfg = config.modules.AquosRemote,
		Aquos = {};

	if ( !cfg.IP ){
		console.log( "\nAquosRemote [Erreur] => IP non configurée !" );
		return callback ({ 'tts' : 'Adresse I P incorrecte !' });
	}

	Aquos.IP 		= cfg.IP,
	Aquos.Port 		= ( typeof cfg.Port != 'undefined' ) ? cfg.Port : 10002,
	Aquos.Username	= ( typeof cfg.User != 'undefined' ) ? cfg.User : false,
	Aquos.password 	= ( typeof cfg.password != 'undefined' ) ? cfg.password : false;

	if (!Aquos.Username || !Aquos.password) {
		console.log ( '\nAquosRemote [Erreur] => User et/ou Password absents' );
		return callback ({ "tts" : "Erreur d'authentification. Nom d'utilisateur et ou mot de passe absent." });
	}
	
	data.cmd = data.cmd.concat( '        ' ).substr(0,8) + '\x0D';

	var socket = net.connect ({ host: Aquos.IP, port: Aquos.Port });

	socket.on ( 'connect', function() {
		console.log ( '\nAquosRemote => Connexion = [OK] => user: '+Aquos.Username+' - Password: '+Aquos.password);
		
		socket.on ( 'data', function ( data ) {
			aquosData = data.toString();
			// Debug
			console.log ( '\n--------- Valeur à communiquer (ci-dessous) ----------');
			console.log (aquosData);
			console.log ( '------------------------------------------------------\n');
			// End debug

			if ( aquosData.indexOf( "Login" ) != -1 ) {
				socket.write ( Aquos.Username + "\n" + Aquos.password + "\n" );
				console.log('AquosRemote : User + Login envoyés...');
				socket.write("RSPW2   \x0D"); // commente cette ligne avec // devant...
				console.log('AquosRemote : RSPW2 envoyé...');
			}
			if ( aquosData.indexOf( "OK" ) != -1 ) {
				console.log('AquosRemote : Login OK');
				socket.end ( data.cmd );
				console.log ( '\nAquosRemote => Cmd: '+data.cmd+' = [OK]' );
				callback ({ "tts" : data.ttsAction });
			}
			if ( aquosData.indexOf( "User Name or Password mismatch" ) != -1 ) {
				socket.destroy();
				console.log ( '\nAquosRemote [Erreur] => User et/ou Password incorrects' );
				return callback ({ "tts" : "Erreur d'authentification. Nom d'utilisateur et ou mot de passe incorrects." });
			}
		});
	});

	socket.on ( 'error', function ( erreur ) {
		console.log ( '\nAquosRemote [Erreur] => ' + erreur );
		return callback ({ 'tts' : 'Erreur de connexion !' });
	});
}
