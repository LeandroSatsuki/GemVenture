import {RECORDS} from './records.js';
import {MUSIC_ALBUMS,ALBUM_TIERS} from './music-albums.js';
import {ALL_TRACKS} from './score.js';
import {albumPrice,ownsAlbum,albumForEdition} from './album-collection.js';
import {RECORD_ART} from './approved-records-assets.js';
import {RECORDED_ALBUM_ART} from './recorded-album-art.js';
export const CATALOG_TIERS=ALBUM_TIERS;
const previewTier=bpm=>bpm<=120?'Facil':bpm<=140?'Medio':'Dificil';
export const RECORD_CATALOG=Object.freeze([
 ...RECORDS.map(r=>({id:r.id,kind:'record',title:r.name,artist:'GemVenture',genre:r.genre,cost:r.cost,cover:RECORD_ART[r.id],tiers:[previewTier(ALL_TRACKS[r.previewTrack].bpm)],previewBpm:ALL_TRACKS[r.previewTrack].bpm,description:'Arranjo para as expedições. O nível indicado classifica a prévia; durante a partida, o ritmo acompanha o andar.',record:r})),
 ...MUSIC_ALBUMS.map(a=>({id:a.id,kind:'album',title:a.title,artist:a.artist,genre:a.genre,cost:albumPrice(a),cover:RECORDED_ALBUM_ART[a.coverKey],tiers:[...new Set(a.editions.map(e=>e.tier))],description:a.description,album:a}))
].sort((a,b)=>a.id==='pulse'?-1:b.id==='pulse'?1:a.title.localeCompare(b.title,'pt-BR',{sensitivity:'base'})));
export const catalogItem=id=>RECORD_CATALOG.find(i=>i.id===id);
export const ownsCatalogItem=(state,item)=>item.kind==='album'?ownsAlbum(state,item.id):state.records.owned.includes(item.id);
export const ownedCatalogCount=state=>RECORD_CATALOG.filter(i=>ownsCatalogItem(state,i)).length;
export function filterCatalog(state,{tier='Todos',genre='TODOS',owned=false}={}){return RECORD_CATALOG.filter(i=>(tier==='Todos'||i.tiers.includes(tier))&&(genre==='TODOS'||i.genre===genre)&&(!owned||ownsCatalogItem(state,i)));}

export const activeCatalogItem=state=>catalogItem(albumForEdition(state.records.albumActive)?.id||state.records.active);
