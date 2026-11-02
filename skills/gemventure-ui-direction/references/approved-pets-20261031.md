# Pets / Cuidadora — padrão aprovado em 31/10/2026

O usuário aprovou explicitamente a proposta v1: “ficou muito bom a UI, gostei da forma que tá apresentado, tá bem clean, pode aplicar no jogo real”. Fonte da decisão e escopo: `E:/Genventure/coordination/PETS-UI-INTEGRATION-20261031/HUMAN-APPROVAL.json`. Aplicação, fontes e QA pertencem ao mesmo lote; aceite da proposta não certifica o runtime perceptivamente.

## Função antes da composição

Pets separa coleção, ficha do selecionado e companheiro ativo. Selecionar um card nunca equipa. Equipar e **Desequipar** são ações explícitas na ficha; o nome do ativo no cabeçalho e a marca verde no card permanecem independentes do contorno ciano de seleção. Não copiar o catálogo de roupa ou o layout da Forja: compartilhar a linguagem dos controles, respeitando a decisão própria desta tela.

- Coleção à esquerda e ficha fixa à direita; em espaço estreito, a ficha ocupa a mesma área da coleção com retorno claro. Sem pilha vertical das duas áreas ou expansão ao trocar abas.
- Dez pets reais, nomes/raridades/poderes do catálogo atual; seis cards por página normal, oito no amplo. Filtros preservam todos os grupos existentes. Ao abrir, o ativo deve estar na página visível, inclusive o décimo pet.
- Poder mostra primeiro números e condições essenciais. A descrição completa continua a um clique no mesmo espaço. Não usar texto de hover nem apagar condições de um resumo para caber.
- Vínculo mostra cada objetivo real em barra, com `atual/meta` na mesma linha; não somar medidas incompatíveis em um nível ou percentual de afeto inventado. Propriedade válida legada continua válida mesmo sem provas novas.
- Cuidar permanece a operação atual, sem fome, XP, custo, bônus diário ou cooldown fictícios. Clique no personagem pode acionar o mesmo carinho para possuídos. Só mostrar corações/marca após confirmação persistida.

## Linguagem visual e movimento

Manter os 27 tokens semânticos da família aprovada, Fredoka/Nunito e pesos existentes. Azul para superfícies/controles comuns, ciano para seleção, verde para equipado/confirmado, dourado para equipar disponível e vermelho para fechar. Raridade também escrita; não pintar todos os cards com cores arbitrárias.

Personagem e pedestal fornecidos são preservados, incluindo ponto de apoio e silhueta. Usar `petArtSpec`, `petPortraitFit` e `drawPetArt`; os dois idles atuais de cada pet continuam acessíveis. Um impulso curto e três corações confirmam carinho sem mover a ficha ou o pedestal. Os tempos do piloto são parâmetros do consumidor aprovado, não uma regra universal de animação.

Limpar efeitos ao selecionar outro pet, falhar, fechar, trocar modo ou ocultar a aba. Modo suave conserva estado, informação e pose estática, reduzindo movimento; fechar remove observadores/listeners/animações e interrompe o desenho. Verificar no tamanho final de cada diálogo, não apenas na largura isolada da proposta.

## Integração e comprovação

O host é dono do perfil corrente e de `commitPetAction`. `installPetDraft` substitui a referência do perfil: o componente precisa ler o perfil atual a cada render, e não guardar a referência anterior. Preservar acesso pelo Vestiário e Cuidadora, guardas de expedição/menu/tutorial/retorno, `readProfile`, save, invalidação de progressão e atualização da estátua.

Não reconstruir toda a janela após equipar/cuidar: isso pode cortar o som de confirmação recém-emitido. Pressão, seleção e sucesso são respostas distintas; um resultado recusado não recebe celebração. A emissão semântica de ação vem após confirmação, sem depender do clique global fora do Shadow DOM. Novos SFX e padronização global de botões/cartas são lotes próprios.

Conferir seleção sem equipar, retirada, carinho, persistência após recarregar, falha de salvamento, bloqueios, dados indisponíveis, paginação/filtros, dez textos integrais, foco e modo suave. Registre origem e limites da prova; testes de código não constituem escuta física, touch ou aceite humano. Expedição é a próxima prioridade humana e ainda exige proposta própria.
