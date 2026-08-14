# Datemind

O Datemind é um CRM pessoal de encontros que funciona como aplicação estática no navegador. A versão atual usa `localStorage` para os contatos e `sessionStorage` para a chave de IA. O modo padrão está ligado ao endpoint histórico da planilha Google do projeto; o modo local pode ser reativado apagando a URL no painel de configurações.

## Executar

Abra `index.html` no navegador. Não há dependência externa obrigatória para iniciar a aplicação. A função de notas de voz requer um navegador com suporte a `SpeechRecognition` e uma chave configurada pelo painel de configurações.

## Sincronização com a planilha

A aplicação está configurada para ler a planilha histórica pelo endpoint do Google Apps Script associado ao projeto. Ao abrir o `index.html`, ela faz um `GET`, converte `fonte`, `fase` e `status` para o modelo atual e mescla os registros com o cache local sem apagar contactos locais. O estado exibido no cabeçalho informa quantos registros foram lidos.

Ao criar ou editar um contacto, o Datemind envia um `POST` com `action: "update"`; ao apagar, envia `action: "delete"`. As colunas adicionais da planilha são preservadas mesmo quando não aparecem na interface. Falhas de rede mantêm as alterações localmente numa fila e fazem nova tentativa na próxima abertura.

Para desligar a planilha e trabalhar apenas no dispositivo, abra as configurações, remova a URL e salve. Para substituir o endpoint, informe outra URL HTTPS compatível com o mesmo contrato.

> Atenção: o endpoint histórico é público e não oferece autenticação por utilizador. Qualquer pessoa que tenha acesso à URL pode potencialmente ler ou alterar os dados, dependendo da configuração do Google Apps Script. Para uso real, prefira migrar para um backend autenticado com autorização por utilizador e transporte HTTPS.

## Importação e exportação

O exportador inclui os campos do contato, incluindo datas de último contato e próxima ação. O importador aceita campos entre aspas, vírgulas e quebras de linha dentro de notas. A importação é mesclada por `id` e não apaga contatos existentes; registros sem `id` recebem um identificador novo.

## Validação

O arquivo `validate_datemind.js` verifica a sintaxe do JavaScript embutido, a ausência das referências legadas de criptografia e o tratamento de CSV com campos quoted. Execute-o a partir desta pasta com `node validate_datemind.js`.
