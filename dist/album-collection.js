import {MUSIC_ALBUMS,albumById} from './music-albums.js';
export const ALBUM_PURCHASE_COSTS=Object.freeze({Facil:2,Medio:3,Dificil:5});
export function albumPrice(id){const album=typeof id==='string'?albumById(id):id;return album?(album.purchaseCost??Math.max(...album.editions.map(e=>ALBUM_PURCHASE_COSTS[e.tier]))):null;}
export const ownsAlbum=(state,id)=>!!state.records?.albumOwned?.includes(id);
export function restoreAlbumOwnership(value){
 if(value===undefined)return undefined;
 if(!Array.isArray(value)||value.length>MUSIC_ALBUMS.length||new Set(value).size!==value.length||value.some(id=>!albumById(id)))return null;
 return [...value];
}
export function buyAlbum(state,id){
 const album=albumById(id),cost=albumPrice(album);
 if(state.run||!album||!state.records||ownsAlbum(state,id)||!Number.isFinite(state.stars)||state.stars<cost)return false;
 state.stars-=cost;(state.records.albumOwned??=[]).push(id);state.records.albumCatalogVersion=1;return true;
}

export const albumForEdition=id=>MUSIC_ALBUMS.find(a=>a.editions.some(e=>e.id===id));
export const ownsAlbumEdition=(state,id)=>{const album=albumForEdition(id);return !!album&&ownsAlbum(state,album.id);};
export function equipAlbumEdition(state,id){
 if(state.run||!ownsAlbumEdition(state,id))return false;
 state.records.albumActive=id;return true;
}
