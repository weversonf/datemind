# Validação visual e funcional

- O arquivo local iniciou sem a pasta `lib/` e sem a dependência CryptoJS.
- O status inicial exibido foi `Local — navegador`, confirmando que a sincronização remota está desativada por padrão.
- O formulário mostrou campos acessíveis de nome e datas de último contacto/próxima ação.
- Foi criado um registro de teste `Ana Teste`, com observação contendo vírgula e quebra de linha, idade, bairro e datas.
- O registro foi renderizado na lista, atualizou o funil e o índice alfabético.
- Nenhuma chamada remota foi necessária durante o teste local.

A reabertura do registro de teste manteve nome, observação e as datas `2026-08-13` e `2026-08-20`. O clique no botão de configurações enquanto o modal de edição estava aberto não alterou a tela, o que é esperado pela sobreposição do modal; a configuração será testada após fechá-lo.

O painel de configurações confirmou que a chave de IA fica somente na sessão do navegador e que a sincronização remota é opcional, com o campo vazio por padrão. O texto também alerta que o endpoint remoto precisa exigir autenticação e autorização por utilizador.

Após recarregar a versão final, a aplicação iniciou sem a dependência ausente e exibiu `Local — navegador`. A fila local foi mostrada como pendente porque o registro de teste havia sido salvo sem endpoint remoto; depois, o registro e a fila foram removidos condicionalmente apenas quando correspondiam exatamente ao teste `Ana Teste`.

## Validação do redesign visual

A versão v13 foi recarregada no navegador com a nova composição clara: cabeçalho com marca, alternador Lista/Funil, estado de sincronização, ação principal, painel de funil, filtro alfabético e área de dados. O estado vazio apresenta uma mensagem orientada à ação em um cartão central.

O formulário de novo contacto foi verificado com campos preenchidos e o registro `Marina Costa` foi salvo com sucesso. O cartão resultante exibe nome, origem, temperatura, localização, fase do funil e próxima ação; o contador principal, o funil lateral e o filtro alfabético foram atualizados sem erro.

O modo Funil foi verificado com cartão preenchido e colunas vazias tratadas como estados leves, sem poluir a interface. O modal de notas de voz e sincronização também foi revisado com o novo estilo de superfície, botões, campos e hierarquia textual.

O contacto usado apenas para validação visual foi removido com segurança ao final dos testes. Não foram alteradas configurações existentes.

Após limpar os dados de teste, a página foi recarregada com zero contactos e o estado vazio permaneceu correto. A inspeção final do console não apresentou saídas ou erros.
