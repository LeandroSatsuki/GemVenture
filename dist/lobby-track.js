export const LOBBY_TRACK=Object.freeze({title:'In doubt',artist:'Hessel_vanO',author:'',rights:'',source:'recording',url:'assets/audio/hessel-vano-in-doubt.mp3'});
export const lobbyTrackLabel=(track=LOBBY_TRACK)=>[track.title,track.artist,track.author&&'Autoria: '+track.author,track.rights].filter(Boolean).join(' · ');
