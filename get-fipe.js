#!/usr/bin/env node

var cheerio = require('cheerio');
var jsonfile = require('jsonfile');
var http = require('http');
var request = require('request');

var cookieJar = request.jar();
var codigo;

var files = {
  1: {
    filename: "carros"
  },
  2: {
    filename: "motos"
  },
  3: {
    filename: "caminhoes"
  }
};

Object.keys(files).map(tipo => {
  request({
    method: "POST",
    uri: "http://veiculos.fipe.org.br/api/veiculos/ConsultarTabelaDeReferencia",
    jar: cookieJar,
    json: {},
    headers: {
      Host: "veiculos.fipe.org.br",
      Referer: "http://veiculos.fipe.org.br/"
    }
  }, function(err, status, bd) {
    codigo = bd[0]["Codigo"];

    request({
      method: "POST",
      uri: 'http://veiculos.fipe.org.br/api/veiculos/ConsultarMarcas',
      jar: cookieJar,
      headers: {
        Host: "veiculos.fipe.org.br",
        Referer: "http://veiculos.fipe.org.br/",
      },
      json: {
        codigoTabelaReferencia: codigo,
        codigoTipoVeiculo: tipo
      }
    },
      function(er, st, body) {
        if(er) {
          console.log("ERR: ", er);
          return;
        }

        if(st.statusCode != 200) {
          console.log('Returned: ', st.statusCode);
          console.log(body);
          return;
        }

        loadAndExport(body, tipo, files[tipo]);
      });
  }); 
});

var loadAndExport = (marcas, tipo, fileInfo) => {
  var modelos = [];
  var modelos_ano = {};
  var marcas_list = {};

  Object.keys(marcas).forEach(mKey => {
    const marca = marcas[mKey];

    marcas_list[marca.Value] = {
      name: marca.Label,
      modelos: {}
    };
  });

  if (!Object.keys(marcas_list).length) {
    return;
  }

  function consultaMarca(marca) {
    return new Promise((resolve, reject) => {
      request.post({
	url: 'http://veiculos.fipe.org.br/api/veiculos/ConsultarModelos',
        jar: cookieJar,
        headers: {
          Host: "veiculos.fipe.org.br",
          Referer: "http://veiculos.fipe.org.br/",
        },
        json: {
	  codigoTipoVeiculo: tipo,
	  codigoTabelaReferencia: codigo,
	  codigoModelo: '',
	  codigoMarca: marca,
	  ano: '',
	  codigoTipoCombustivel: '',
	  anoModelo: '',
	  modeloCodigoExterno: ''
	}
      },function(err, status, body) {
        if (err) {
          reject(err);
        }
        resolve(body);
      });
    });
  }

  function consultaModelo(marca, modelo) {
    return new Promise((resolve, reject) => {
      request.post({
	url: 'http://veiculos.fipe.org.br/api/veiculos/ConsultarAnoModelo',
        jar: cookieJar,
        headers: {
          Host: "veiculos.fipe.org.br",
          Referer: "http://veiculos.fipe.org.br/",
        },
	json: {
	  codigoTipoVeiculo: tipo,
	  codigoTabelaReferencia: codigo,
	  codigoModelo: modelo,
	  codigoMarca: marca,
	  ano: '',
	  codigoTipoCombustivel: '',
	  anoModelo: '',
	  modeloCodigoExterno: '' 
	}
      }, function(err, status, body) {
        if (err) {
          reject(err);
        }
        resolve(body);
      });
    });
  }

  var saveData = (data, filename) => {
    jsonfile.writeFile(filename, data, function(err) {
      if (err)
        console.error('Status: ', err); 
    });
  }; 

  function export_fip(veiculos, fileInfo) {
    var filename = fileInfo['filename'];
    saveData(veiculos, `${filename}.json`);
  }

  function main() {
    return new Promise((resolve, reject) => {
      var markas = Object.keys(marcas_list);

      var funcs = markas.map((marca) => {
	return consultaMarca(marca);
      });

      Promise.all( funcs ).then(
	(res) => {
	  var pairs = [];
	  var modelos = res.map((r, idx) => {
	    modelos_ano = {};
	    const { Modelos, Anos } = r;

	    var modelos = Modelos.map((modelo, id) => {
	      modelos_ano[modelo.Value] = {
		name: modelo.Label,
		anos: {}
	      };
	      pairs.push([markas[idx], modelo.Value]);

	      return modelo.Value;
	    });

	    marcas_list[markas[idx]]['modelos'] = modelos_ano;

	    return modelos;
	  });

	  modelos = [].concat.apply([], modelos);
	  var orig_modelos = modelos;
	  modelos = modelos.map(modelo => consultaModelo(pairs.filter(p => p[1] == modelo)[0][0], modelo));
	  Promise.all( modelos ).then((mestre_grilo) => {
	    var anos = mestre_grilo.map((r, index) => {
	      var anos = r.reduce((acc, ano) => {
		acc[ano.Value] = ano.Label;
		return acc;
	      }, {});
	      marcas_list[pairs.filter(p => p[1] == orig_modelos[index])[0][0]]['modelos'][orig_modelos[index]]['anos'] = anos;
	      return anos;
	    });
	    resolve(marcas_list);
	  });
	},
	() => console.log('deu ruim')
      ).catch((err) => { console.log(err)});
    }); 
  }

  main().then((veiculos) => {
    export_fip(veiculos, fileInfo);
    console.log('Tabela Fipe exportada com sucesso.');
  });
};
