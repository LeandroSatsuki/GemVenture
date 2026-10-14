import {createState} from '../dist/core.js';
import {buildingUpgrade,missionSlots} from '../dist/village.js';
import {MISSION_TYPES,MISSION_TIERS,missionOdds,missionTerms} from '../dist/missions.js';

export function missionBalanceData(){
 const state=createState(712);state.seals=5;let coins=0,minerals=[0,0,0,0];
 for(let level=1;level<150;level++){
  state.village.missions=level;const p=buildingUpgrade(state,'missions');coins+=p.cost;
  minerals=minerals.map((n,i)=>n+p.recipe[i]);
 }
 const levels=[1,10,30,60,90,120,149,150].map(level=>{
  state.village.missions=level;const upgrade=buildingUpgrade(state,'missions');
  return{level,slots:missionSlots(state),nextCost:upgrade.cost,nextMaterials:upgrade.recipe,odds:missionOdds(state),
   miner:missionTerms('miner','common',level),goldMiner:missionTerms('miner','gold',level),
   goldCombo:missionTerms('combo','gold',level),goldFloors:missionTerms('floors','gold',level)};
 });
 let maximumDuration=0,maximumReward=0,checked=0;
 for(let level=1;level<=150;level++)for(const def of MISSION_TYPES)for(const tier of Object.keys(MISSION_TIERS)){
  if(def.fixed&&level>10)continue;const terms=missionTerms(def.id,tier,level);checked++;
  maximumDuration=Math.max(maximumDuration,terms.duration);maximumReward=Math.max(maximumReward,terms.reward.gems);
 }
 const topGold=MISSION_TYPES.filter(d=>!d.fixed).map(d=>({template:d.id,...missionTerms(d.id,'gold',150)})).sort((a,b)=>b.reward.gems-a.reward.gems).slice(0,5);
 const maximumBatchReward=topGold.reduce((sum,m)=>sum+m.reward.gems,0);
 return{model:'Curvas e limites de design; prazo ativo não é previsão de tempo humano para completar ou maximizar.',checked,coins,minerals,maximumDuration,maximumReward,maximumBatchReward,topGold,levels};
}

export function missionBalanceSection(table,num){
 const audit=missionBalanceData();
 return `<section id="missoes"><h2>Quadro de missões · nível 150</h2><p>Somente o Quadro passa de 10 para 150. Forja e Poço mantêm o limite de suas construções. A compra usa moedas e as quatro cores de cristal; não cria poder de combate ou pontos de habilidade.</p>
 <p>O custo já pago até o nível 10 é preservado. A partir daí, moedas crescem por uma curva quadrática e minerais por uma potência de 1,55. Custo total de 1 a 150: <strong>${num(audit.coins)} moedas</strong> e <strong>${num(audit.minerals.reduce((a,b)=>a+b,0))} cristais</strong>, divididos por cor. Recursos não são consumidos se faltar qualquer parte da receita.</p>
 ${table(['Nível','Vagas','Próxima melhoria: moedas','Próxima melhoria: cristais','Cristais / missão comum','Prêmio comum','Prazo ativo'],audit.levels.map(r=>[r.level,r.slots,r.nextCost?num(r.nextCost):'MÁXIMO',r.nextCost?num(r.nextMaterials.reduce((a,b)=>a+b,0)):'—',num(r.miner.goal),num(r.miner.reward.gems),num(r.miner.duration/60)+' min']))}
 ${table(['Nível','Dourada: cristais / moedas','Dourada: combo / moedas','Dourada: andares / moedas','Chance dourada sem talento'],audit.levels.filter(r=>[1,10,60,120,150].includes(r.level)).map(r=>[r.level,num(r.goldMiner.goal)+' / '+num(r.goldMiner.reward.gems),num(r.goldCombo.goal)+' / '+num(r.goldCombo.reward.gems),num(r.goldFloors.goal)+' / '+num(r.goldFloors.reward.gems),num(r.odds.gold*100)+'%']))}
 <p>Uma vaga inicial; mais uma nos níveis 30, 60, 90 e 120. O limite de cinco permanece até 150. Uma ação pode avançar objetivos compatíveis em paralelo, mas não é permitido aceitar o mesmo tipo de missão duas vezes. Cada contrato preserva seu próprio prazo.</p>
 <p>Com seleção ideal de cinco contratos dourados distintos no nível 150, o maior lote paga <strong>${num(audit.maximumBatchReward)} moedas</strong>. É um teto por lote completo, não por minuto: os cinco objetivos e prazos ainda precisam ser cumpridos. Esse cenário já considera a possibilidade de procurar ofertas melhores; a renda não foi estimada usando apenas a raridade média. Missões não dão cristais, logo não financiam sozinhas a construção que as gera. Não há multiplicador adicional por ocupar mais vagas.</p>
 <details><summary>Regras de balanceamento e compatibilidade</summary><p>Com n = nível − 1: coleta, abates e pontos usam 1 + 0,03n + 0,00035n². Combo usa 1 + 0,012n. Consumíveis e andares completos usam 1 + 0,018n + 0,0001n². Assim, missões longas podem continuar por várias descidas, enquanto combos não exigem milhares de acertos seguidos.</p><p>Prêmios preservam o crescimento de 8% por nível nos primeiros dez níveis; depois crescem com a potência 0,9 do aumento de esforço. Missões de pulsos pagam 35% da referência, combos 45%, consumíveis 125% e andares completos 250%. Isso reduz o ganho por ficar apenas marcando ritmo e valoriza concluir conteúdo. Essências crescem por marcos, sem crescimento exponencial.</p><p>Prazos dependem do tipo de objetivo e da quantidade. Só correm em exploração ativa: morte, vila, menus pausados e decisão entre andares preservam o tempo restante. O orçamento aumenta sem exigir entradas mais rápidas que a música; limite defensivo de duas horas de exploração ativa.</p><p>Há no máximo seis ofertas distintas, mantendo as três iniciais e os espaços dos níveis 4, 7 e 10. Missões introdutórias de alcançar um andar saem das novas ofertas depois do nível 10, evitando prêmios altos por usar um elevador já desbloqueado. Comuns continuam possíveis no nível 150, inclusive com Olho de Ouro; raridade nunca soma mais de 100%.</p><p>Objetivo, prazo e recompensa são fixados ao aceitar. Salvar, morrer ou melhorar o quadro não muda o contrato. Missões antigas mantêm seus valores antigos; ofertas novas usam a nova curva. Entrega apenas na vila, uma única vez.</p></details>
 <p>Aceitar e entregar renova automaticamente todas as ofertas livres; missões aceitas ficam guardadas. Abrir, recarregar, abandonar ou iniciar uma descida não sorteia novamente. A aceitação fecha o painel e o prêmio continua sendo recebido manualmente na vila. Aceitar e abandonar repetidamente ainda permite procurar raridades melhores: acompanhar esse comportamento no teste, sem confundir os percentuais do sorteio com a distribuição final dos contratos escolhidos.</p>
 <p>Auditoria automática: ${num(audit.checked)} combinações de nível, tipo e raridade; maior prazo gerado ${num(audit.maximumDuration/60)} minutos e maior prêmio ${num(audit.maximumReward)} moedas. Esses números descrevem os limites do sistema, não horas garantidas de jogo. Próximo ajuste deve usar tempo real por contrato, taxa de expiração, quantidade de vagas ocupadas e participação das missões na renda da Forja.</p></section>`;
}
