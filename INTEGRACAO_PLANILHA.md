# Integração histórica da planilha

A integração original do Datemind usa um endpoint público do Google Apps Script:

`https://script.google.com/macros/s/AKfycbzmNqRIo7AHp1bCV27XokIcQDauV5m__9AC7nGbaYjDx2gIf_4yD5UKYZk8wIH_DmaT/exec`

Uma segunda URL histórica encontrada em commits antigos (`AKfycbyCO...`) responde, mas o contrato observado retorna `{"success":true,"data":[]}` para a consulta testada e não corresponde ao formato atual da base.

A leitura do endpoint principal respondeu HTTP 200 com um array de 61 registos. As colunas observadas foram: `id`, `nome`, `fonte`, `idade`, `favorito`, `instagram`, `profissao`, `formacao`, `bairro`, `cidade`, `estado`, `bebe`, `fuma`, `pets`, `sexo`, `qtde_filhos`, `idade_filhos`, `fase` e `status`.

Valores observados em `fase`: `Orientativo` (18), `Fechado` (17), vazio (16), `Negociação` (6), `Perdido` (3) e `Declinado` (1). Valores observados em `status`: `Frio` (21), vazio (19), `Quente` (15) e `Morno` (6).

O endpoint é público e não foi alterado durante a descoberta. O contrato histórico de escrita usa POST com `action: "update"` e `action: "delete"`; a implementação deve preservar campos cifrados antigos como valores opacos e não reintroduzir uma chave de criptografia no front-end.

## Validação de leitura

Em 14/08/2026, a aplicação carregou a URL histórica no navegador sem erro e exibiu `Planilha · 61 registos`. A interface renderizou 61 contactos, com 38 em `Conheci`, 6 em `Conversando` e 17 em `Date marcado`; os demais estados atuais ficaram vazios. Nenhuma escrita foi realizada durante esta validação.

## Validação de escrita sem alteração remota

O payload de atualização foi inspecionado em memória para o primeiro contacto: `id=1772358613476`, `nome=Alayde Rodrigues`, `fonte=Tinder`, `fase=Orientativo` e `status=Frio`. O adaptador mantém o formato histórico e preserva colunas adicionais quando elas existem. Os testes do navegador não executaram `POST`, portanto a planilha não foi alterada durante a validação.

## Validação final da leitura

Após a recarga da versão final, a interface continuou a exibir 61 contactos e a distribuição `Conheci 38`, `Conversando 6` e `Date marcado 17`. Os cartões mostraram nomes, fonte, temperatura, bairro e fase convertidos da planilha. A captura inicial ainda exibiu brevemente o estado textual `A carregar planilha…` enquanto a lista já estava preenchida; isso será verificado como possível estado assíncrono da interface, sem relação com a leitura dos dados.

## Estado assíncrono confirmado

A inspeção final do DOM confirmou `Planilha · 61 registos`, 61 contactos carregados, fila de sincronização vazia e a URL histórica ativa. O texto `A carregar planilha…` observado na captura era apenas o estado transitório durante o carregamento.
