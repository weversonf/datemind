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
