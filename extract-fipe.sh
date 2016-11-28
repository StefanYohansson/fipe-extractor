#!/usr/bin/bash

node get-fipe.js > /dev/null 2>&1 && perl import-fipe.pl > veiculos.sql
