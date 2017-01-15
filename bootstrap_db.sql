CREATE TABLE marcas (
  id bigserial primary key,
  nome varchar(255) not null
);

CREATE TABLE modelos (
  id bigserial primary key,
  marca_id bigint not null,
  nome varchar(255) not null,
  constraint fk_marca foreign key (marca_id) references marcas(id)
);

CREATE TABLE anos (
  id bigserial,
  modelo_id bigint not null,
  nome varchar(255) not null,
  constraint fk_modelo foreign key (modelo_id) references modelos(id),
  CONSTRAINT pk_ano PRIMARY KEY (id, modelo_id)
);
