// Current refuge art, shared with rewards and wallets. Historical selections stay on disk.
const selected={
  "trophy": "assets/refuge-night-v3/trophy.png",
  "swords": "assets/refuge-night-v3/swords.png",
  "ranking": "assets/refuge-night-v3/ranking.svg",
  "enemies": "assets/refuge-night-v3/golem-0.png",
  "heart": "assets/refuge-night-v3/heart.png",
  "infinite": "assets/ui-corrections-r2/infinite-progress-v2.png",
  "crystal": "assets/refuge-night-v3/gem-0.png",
  "coin": "assets/refuge-night-v3/coin.png",
  "star": "assets/refuge-night-v3/star.png",
  "ruby": "assets/refuge-night-v3/gem-1.png",
  "quartz": "assets/refuge-night-v3/gem-0.png",
  "coins": "assets/refuge-night-v3/coin.png",
  "chest": "assets/refuge-night-v3/chest.png",
  "scroll": "assets/refuge-night-v3/scroll.png",
  "liftCabin": "assets/refuge-night-v3/lift.png"
};
function image(id,className,width,height){
 const src=selected[id];if(!src)throw new RangeError('Unmapped selected Abyss asset: '+id);
 return `<img class="${className}" src="${src}" width="${width}" height="${height}" alt="" aria-hidden="true" data-abyss-selected="${id}">`;
}
export const icon=id=>image(id,'gv-v2-abyss-icon gv-v2-selected-icon',51,51);
export const rewardArt=id=>image(id,'gv-v2-abyss-reward-art gv-v2-selected-reward',112,112);
export const liftCabinIcon=()=>image('liftCabin','gv-v2-selected-cabin',112,112);
