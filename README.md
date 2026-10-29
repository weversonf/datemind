# DateMind — CRM pessoal de conexões

Aplicação web leve em **HTML, CSS e JavaScript**, com listas, Kanban, fichas e **dossiês estruturados**. A interface utiliza **os sete estágios originais** do DateMind: Conheci, Conversando, Quase marcando, Date marcado, Fiquei, Intimidade e Recorrente.

## Rodar

Abra o `index.html` em um navegador moderno ou use a publicação no GitHub Pages. O frontend não precisa de um processo de build. **A edição sincronizada e o login Google requerem internet**: a versão atual carrega as bibliotecas do Firebase por HTTPS e usa Firebase Auth / Firestore. O cache local permite conservar registros já carregados e manter alterações pendentes para sincronização posterior, mas **não substitui uma instalação totalmente offline**.

## Recursos atuais

- Visão **Lista** e **Kanban** com arrastar e soltar (sete colunas mantidas).
- Cadastro, edição automática, busca, filtros básicos, seleção múltipla e edição em lote.
- **Dossiê** em seis blocos expansíveis: Perfil e formação; Relacionamento e expectativas; Estilo de vida e lazer; Gastronomia e bebidas; Rotina e disponibilidade; Comunicação e conexão.
- **31 campos adicionais**, entre eles filhos, quantidade de filhos, cidade, formação, estudos, música, atividades, hobbies, comidas, bebidas, álcool, disponibilidade, frequência de conversa e contexto registrado.
- **24 filtros avançados combináveis**, disponíveis tanto na Lista quanto no Kanban. Critérios simultâneos usam a regra **E (AND)**. O filtro explícito *Não informado* diferencia ausência de uma resposta negativa.
- Dossiês salvos no campo `dossier` dentro de cada contato, usando o **mesmo Firestore** do DateMind; sem coleção separada e sem migração destrutiva.
- CSV exporta os campos novos com prefixo `dossier_`. Importação por ID preserva dossiês anteriores quando o CSV legado não contém essas colunas. Campos multivalorados aparecem separados por ` | ` no CSV.
- Notas de voz, datas do último contato e próxima ação e configurações de IA do DateMind permanecem disponíveis.

## Dados e sincronização

- `index.html`: aplicação, login Google, conexão Firestore, telas de Lista e Kanban.
- `datemind-dossier.js`: regras dos campos, normalização, filtros, formulário e intercâmbio de CSV.
- `datemind-dossier.css`: layout responsivo das seções e filtros.
- `firestore.rules`: regra de acesso restrito à conta Google autorizada. Requer publicação dessas regras no projeto Firebase.
- `INTEGRACAO_PLANILHA.md`: documentação **histórica** da planilha Google Apps Script; o app atual utiliza **Firestore** como origem remota.

O `normalizeRemoteContact` converte, quando disponíveis, campos antigos `formacao`, `cidade`, `qtde_filhos` e `bebe` para o novo dossiê, sem substituir valores detalhados já preenchidos. Os dados originais de planilha são mantidos em `legacyFields`. A sincronização conserva os IDs e as fases existentes.

## Privacidade

O repositório contém apenas **código e esquema de dados**: não publicar exports de conversas, contatos reais, CSV/JSON preenchidos nem notas íntimas. Revise os controles do Firebase antes de liberar o app a outros usuários. O histórico de conversas do WhatsApp **não é enviado automaticamente nem importado pelo código**. Preencha somente informações compartilhadas voluntariamente e marque o que não foi confirmado.

## Testes estáticos

Execute `node validate_datemind.js` para verificar JavaScript, o modelo de dossiê, os sete estágios, o filtro avançado e o parser de CSV. Os testes estáticos não substituem testes manuais do login e do Firestore em uma sessão real.
