# Fluxo de trabalho da equipe

Este fluxo orienta novas entregas e correções do GemVenture. Preserva a equipe,
os IDs e as autorizações existentes. A primeira etapa do plano de ação organiza
instruções e evidências; não concede autorização de aplicação a pacotes pendentes.

## Fontes vigentes

| Assunto | Fonte a consultar |
| --- | --- |
| Escopo, aceite, responsável, autorização e aplicação | `../../coordination/team-control.json`, no ID da tarefa e nos recibos referenciados |
| Fila de encaminhamento | `../../coordination/team-outbox.json`; conservar o estado de mensagens enviadas ou incertas |
| Arquitetura e saves | `ARCHITECTURE.md` e contratos do módulo afetado |
| Produto | `../DESIGN_RULES.md`; conferir números atuais no código e decisões posteriores no ID |
| Arte procedural e composição em código | `../skills/gemventure-procedural-art/SKILL.md` e referências pertinentes |
| Arte raster | `gemventure-image-art`, referências aprovadas da família e manifesto do pacote |
| Ícones | `E:/assets GemVenture/skill-draft/gemventure-icon-art/SKILL.md` e fontes aprovadas indicadas nessa regra |
| Interação do ouriço | `art/hedgehog-interaction.md` e módulos atuais; não restaurar a antiga proibição de contato |
| Quantidade de biomas e andares | `../dist/campaign.js` |

Instruções humanas posteriores e específicas prevalecem no seu escopo. Se houver
conflito material sem decisão registrada, sinalize o ponto e avance apenas no
trabalho independente. Documentos históricos e cópias dentro de pacotes congelados
servem à proveniência, não à definição automática da regra atual.

Regras de geometria e contagem de formas do gerador procedural não se aplicam
automaticamente a PNGs. Referências raster aprovadas mantêm seus chanfros e
acabamento; ícones têm contrato próprio de escala e semântica. Nenhuma dessas
diferenças autoriza recolorir o runtime ou substituir arte ativa por iniciativa própria.

## Preparação e reserva

Cada tarefa mantém um produtor, uma próxima ação e dependências identificadas por
ID e versão/checkpoint. Escolha o integrador pelo domínio; não encaminhe toda
mudança técnica ao diretor de UI.

Antes de produzir, registre junto da entrega a baseline: commit e, se houver
alterações locais relevantes, manifesto/hash dessas fontes. Registre também os
arquivos e interfaces reservados: seletores CSS, elementos DOM, eventos, funções
públicas ou esquema de save. Arquivos diferentes podem afetar o mesmo consumidor.

Use candidatas isoladas para trabalho concorrente. Branch/worktree é uma opção
para código; pacotes de arte podem manter suas fontes e manifestos atuais. Não
crie cópias completas para uma correção pequena se um delta isolado for suficiente.

## Entrega e bloqueio

Ao concluir um recorte, o responsável deve informar Márcia sem esperar uma cobrança.
Deixe o relatório no próprio chat com ID/versão, estado, caminho da entrega,
verificações e limites, pendências e próxima ação. Quando houver canal autorizado
para avisar a coordenadora diretamente, envie uma notificação curta com o ID e o
caminho do relatório. A coordenação recolhe o relatório antes de marcar a tarefa
como concluída ou encaminhar integração; não trate silêncio como entrega.

Use o mesmo ID e uma mensagem curta com estes campos; reaproveite o manifesto
existente em vez de duplicar listas longas:

```text
ID e versão:
Estado: pronta para revisão | bloqueada | pronta para integração autorizada
Baseline e dependências:
Arquivos e interfaces afetados:
Resultado e critérios atendidos:
Verificação: comandos/resultados, origem e limites da prova
Evidências: manifesto, patch/fontes e prévia utilizável
Autorização: referência e escopo; ou pendente
Próxima ação e responsável:
```

Em bloqueios, acrescente causa observada, impacto, recomendação e trabalho
independente possível. Falta de créditos ou rejeição persistente de ferramenta
exige preservar o checkpoint, sem tentativas automáticas repetidas ou contorno.

O relatório no próprio chat continua válido. Mensagens a outros chats dependem da
autorização humana aplicável. A coordenadora recolhe e encaminha um pacote coeso
quando o destinatário estiver disponível, respeitando a fila vigente.

## Verificação proporcional

O produtor verifica o recorte alterado. Uma revisão independente precisa responder
a uma pergunta: contrato financeiro, migração, completude, legibilidade ou composição.
Não repetir uma suíte ou reconstruir uma análise sem mudança ou dúvida que justifique.

Antes de integrar, compare a candidata com as mudanças posteriores à sua baseline.
Reconcile seletores e contratos afetados; fontes congeladas permanecem preservadas.
Execute `npm run check`, `npm test` e a auditoria pertinente no lote integrado,
conforme `CONTRIBUTING.md`. Registre as evidências dessa composição.

Verificação de código, VM ou Canvas nativo não certifica layout físico, foco nativo,
rolagem, toque ou CRT. Identifique sempre a origem da prova e o que está pendente.

## Aprovação e aplicação

Distinga entrega técnica, aprovação humana, autorização de aplicação, aplicação
com recibo e revisão perceptiva. Reutilize autorizações válidas no seu escopo;
não peça novamente decisões intermediárias já delegadas. Alterações materiais de
escopo ou aparência não herdam automaticamente o aceite de outra versão.

Aplicação exige baseline compatível, escopo autorizado, possibilidade de recuperação
e recibo de arquivos aplicados. Uma fotografia do checkout é inventário e recuperação,
não transforma todos os seus arquivos em um lote aprovado.

## QA visual pendente

Para os recortes abertos de GV-033/GV-035 e GV-048, use a candidata e o parecer
atuais referenciados no controle da equipe, sem regenerar pilotos já aceitos.
A conferência é humana ou por ferramenta que conceda acesso à origem isolada.
Rejeição de acesso continua sendo um bloqueio; não mudar de via para contorná-la.

Registre versão, origem, viewport/zoom e prova antes/depois. Confira:

- textos, quebra e contraste com o CRT oficial, inclusive HUD e pop-ups;
- foco, teclado, rolagem, fechamento e alvos interativos;
- dicas e feedback junto ao HUD do Abismo após a reconciliação de CSS;
- movimento e contato de sombras em biomas contrastantes para GV-048;
- pausa, modo suave e preservação do save do jogador.

O resultado deve ser aprovado, reprovado com passos de reprodução, ou não verificado.
Não encerrar todo o ID porque apenas um subconsumidor passou.

## Piloto e medição

Aplicar este formato às próximas entregas sem migrar ou reescrever o histórico agora.
Comparar tarefas equivalentes por domínio: prazo, tempo bloqueado, correções,
reaberturas, consultas sem novidade e consumo quando disponível. Tokens não são
inferidos de bytes, mensagens ou número de chats.

Manter o monitor pausado até decisão humana de retomada. Acompanhamento por eventos,
nova skill de entrega e alterações na estrutura da equipe continuam como etapas
posteriores, condicionadas ao piloto. Não substituir consultas periódicas sem testar
recebimento, deduplicação e recuperação de eventos perdidos.
