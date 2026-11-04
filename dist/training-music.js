import {MUSIC_ALBUMS,ALBUM_TIERS,editionById} from './music-albums.js';
import {ownsAlbumEdition} from './album-collection.js';
import {albumClock} from './album-clock.js';

// Read-only projection of the live catalog. Training never equips or buys a disc.
export const validTrainingEdition=id=>!!editionById(id)&&!!albumClock(id);
export const canTrainEdition=(profile,id)=>validTrainingEdition(id)&&ownsAlbumEdition(profile,id);
export function trainingMusicOptions(profile){
 return [{id:'',label:'BPM livre'},...MUSIC_ALBUMS.flatMap(album=>album.editions
  .filter(edition=>canTrainEdition(profile,edition.id))
  .map(edition=>({id:edition.id,label:album.title+' · '+(ALBUM_TIERS[edition.tier]||edition.tier)})))];
}
