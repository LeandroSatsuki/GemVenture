# Fontes e aquisição — 31/10/2026

Skills `music-compose` e `music-evaluate` instaladas em `gemventure/skills/` pelo instalador oficial, sem alterações ao material adquirido:

- Repositório: https://github.com/sb-dev/music-production-skills
- Commit: `aa3933bc87f54a48ec018bb868bf6385b340db22`
- Licença: MIT; texto preservado em `LICENSE.upstream` nas duas pastas.
- Uso: separar composição/arranjo de produção; planejar papéis e energia; verificar preservação e distinguir QC de juízo musical.
- Execução MIDI opcional depende de bibliotecas próprias da skill. Não foram instaladas: a engine existente sintetiza o arranjo diretamente e não precisa delas.
- Replicate é uma rota externa opcional no upstream, não uma dependência deste jogo nem autorização de consumo pago.

Também examinados: https://github.com/the0cp/beatflow-skill (MIDI determinístico, GPL-3.0-only) e https://github.com/SJY051/music-composition (teoria e arranjo). Não incorporados: o primeiro duplicaria representação sem ajudar a síntese atual, e o segundo tem escopo mais amplo do que o piloto. Não se atribui ranking de qualidade sem produção comparada.

O complemento `gemventure-music-arrangement` foi escrito para o contrato do jogo. Não é um fork silencioso das skills adquiridas. Sua prova prática está no piloto GV-059 e nos scripts verificáveis, com aprovação auditiva ainda humana.
