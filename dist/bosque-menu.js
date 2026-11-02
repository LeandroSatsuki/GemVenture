// GV-033/GV-035 isolated presentation candidate. No state, storage or transaction handlers.
const bound=new WeakSet();
const scopes=new Set(['stars','forge']);
export const BOSQUE_COPY=Object.freeze([
 ['DISPONÍVEL / CUSTO','Atendido / necessário'],['DEPOSITADO / CUSTO','Depositado / custo'],
 ['RELICÁRIO','Relicário'],['NOVA RELÍQUIA','Nova relíquia'],['ESCOLHA UMA RELÍQUIA','Escolha uma relíquia'],
 ['COLEÇÃO COMPLETA','Coleção completa'],['PERMANENTE','Efeito permanente'],['3 OPÇÕES · ESCOLHA 1','3 opções · escolha 1'],
 ['INVOCAR ·','Invocar ·'],['RELÍQUIAS A DESCOBRIR','relíquias a descobrir'],[' ATIVOS',' equipadas'],
 ['COMO FUNCIONA','Como funciona'],['Até três ecos ativos. Troque na vila.','Equipe até três relíquias. Troque na vila.'],
 ['O sorteio fica salvo e nunca repete um eco da coleção.','O sorteio fica guardado e não repete sua coleção.'],
 ['COLEÇÃO ·','Coleção ·'],['TROQUE NA VILA','Troque na vila'],['EQUIPAR','Equipar'],['ESCOLHER','Escolher'],['LIVRE','Livre'],
 ['RELÍQUIAS FUNDADORAS','Relíquias fundadoras'],['DESPERTAR ·','Despertar ·'],['ATÉ 5 ESTRELAS POR DESCIDA','Até 5 estrelas por descida'],
 ['COMO FORJAR','Como forjar'],['FORJAR PICARETA','Forjar picareta'],['REFORÇAR VIDA','Reforçar vida'],
 ['DEPOSITAR RECURSOS','Depositar recursos'],['CONSTRUIR','Construir'],['FUNDINDO…','Fundindo…'],
 ['ATRIBUTOS DO EQUIPAMENTO','Atributos do equipamento'],['MELHORAR ARMADURA','Melhorar armadura'],
 ['USOS DOS CRISTAIS','Usos dos cristais'],['ROLETAR ATRIBUTO','Roletar atributo'],['ROLETAR OUTRO','Roletar outro'],
 ['MANTER ATUAL','Manter atual'],['APRIMORAR ·','Aprimorar ·'],['CONFIRMAR LIMPEZA','Confirmar limpeza'],['LIMPAR ATRIBUTO','Limpar atributo'],
 ['ESCOLHA UM ATRIBUTO','Escolha um atributo'],['ATRIBUTO MÁXIMO','Atributo máximo']
]);
export function applyBosqueMenu(dialog,kind){
 const supported=scopes.has(kind);
 dialog.classList.toggle('bosque-ui',supported);
 if(!supported){delete dialog.dataset.gvui;return false;}
 dialog.dataset.gvui=kind;
 const body=dialog.querySelector('#dialogBody');
 if(body){const walker=dialog.ownerDocument.createTreeWalker(body,4);let node;while((node=walker.nextNode())){if(node.parentElement?.closest('svg'))continue;let text=node.nodeValue;for(const [old,next]of BOSQUE_COPY)text=text.split(old).join(next);if(text!==node.nodeValue)node.nodeValue=text;}}
 if(!bound.has(dialog)){
  bound.add(dialog);
  dialog.addEventListener('click',event=>{
   if(!dialog.classList.contains('bosque-ui'))return;
   const button=event.target?.closest?.('button');
   if(!button||!dialog.contains(button)||button.disabled||button.getAttribute('aria-disabled')==='true')return;
   const win=dialog.ownerDocument.defaultView;
   if(win?.matchMedia?.('(prefers-reduced-motion: reduce)').matches||dialog.ownerDocument.body.classList.contains('soft-fx'))return;
   button.classList.remove('gvui-clicked');
   // Restart visual feedback only. The element's box and its original click handler are untouched.
   void button.offsetWidth;
   button.classList.add('gvui-clicked');
  },{passive:true});
  const release=event=>{if(event.animationName==='gvui-click')event.target?.classList?.remove('gvui-clicked');};
  dialog.addEventListener('animationend',release);
  dialog.addEventListener('animationcancel',release);
 }
 return true;
}
