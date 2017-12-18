#!/bin/bash

node get-fipe.js > /dev/null 2>&1
perl import-fipe.pl carros.json > carros.sql
perl import-fipe.pl caminhoes.json > caminhoes.sql
perl import-fipe.pl motos.json > motos.sql
