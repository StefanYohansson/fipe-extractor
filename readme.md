FIPE Extractor
===

Ferramenta para exportar a tabela fipe do site: http://veiculos.fipe.org.br/

## Baixando apenas o JSON

Você pode encontrar os json exportados dia a dia em: https://sadfeelings.me/fipe/fipe.tar.gz

## Requerimentos

* Perl (opcional)
* Node

Node é usado para baixar os dados e jogar para o formato json. Perl é utilizado apenas para converter de json para sql.

OBS: você pode rodar apenas com node para obter apenas uma lista de json com o comando: `node get-fipe.js`

## Instalando


1. Perl JSON + Data Dumper (opcional)

```
sudo cpan /data-dumper-names/
sudo cpan JSON
```

2. Node v5+ (use nvm)

```
npm install
```

3. Fé

## Como rodar

Se instalar o perl, você pode rodar o sh.

```
chmod +x extract-fipe.sh
./extract-fipe.sh
```

Caso contrário, basta rodar o node:

```
node get-fipe.js
```
