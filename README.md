# Datemind

O Datemind é um CRM pessoal de encontros que funciona como aplicação estática no navegador. A versão atual usa `localStorage` para os contatos e `sessionStorage` para a chave de IA. O modo padrão é **local-only**: nenhum dado de contato é enviado para a internet até que uma URL de sincronização seja configurada explicitamente.

## Executar

Abra `index.html` no navegador. Não há dependência externa obrigatória para iniciar a aplicação. A função de notas de voz requer um navegador com suporte a `SpeechRecognition` e uma chave configurada pelo painel de configurações.

## Sincronização opcional

Para ativar sincronização, abra o painel de configurações e informe uma URL HTTPS em **Sincronização remota opcional**. O endpoint precisa autenticar o utilizador, autorizar o acesso à sua própria coleção e validar o corpo recebido. A aplicação envia JSON em texto simples com `syncVersion: 2`; ela não tenta cifrar dados no cliente, porque uma chave embutida no JavaScript não é um segredo.

O endpoint deve aceitar `POST` com `action: "update"` ou `action: "delete"` e responder com status HTTP de sucesso. Um `GET` pode retornar um array de registros. Falhas de rede mantêm as alterações localmente numa fila e fazem nova tentativa quando a aplicação for aberta ou a sincronização for reconfigurada.

> A sincronização remota não deve apontar para uma URL pública sem autenticação. Para dados pessoais, prefira um backend autenticado com autorização por utilizador e transporte HTTPS.

## Importação e exportação

O exportador inclui os campos do contato, incluindo datas de último contato e próxima ação. O importador aceita campos entre aspas, vírgulas e quebras de linha dentro de notas. A importação é mesclada por `id` e não apaga contatos existentes; registros sem `id` recebem um identificador novo.

## Validação

O arquivo `validate_datemind.js` verifica a sintaxe do JavaScript embutido, a ausência das referências legadas de criptografia e o tratamento de CSV com campos quoted. Execute-o a partir desta pasta com `node validate_datemind.js`.
