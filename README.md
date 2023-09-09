# Atualizador de Preços - API

Esta é uma API para atualização de preço de produtos. Possui duas rotas que recebem arquivos em CSV e faz as validações necessárias de acordo com as regras de negócio estabelecidas, retornando feedbacks descritivos quando os novos preços ou códigos não passam nas validações. Para funcionar é preciso que o arquivo CSV contenha as colunas: "product_code" e "new_price", com seus respectivos valores, de acordo com os produtos em estoque. Confira também o [front-end da aplicação](https://github.com/brunnaserafina/price-updater).

## Funcionalidades

- Validação de arquivo CSV
- Conversão de CSV para JSON
- Aplicação das regras de negócio
- Validação dos dados enviados e retorno de erros com feedback
- Atualização de preço dos produtos no banco de dados

## Documentação da API

#### VALIDAÇÃO DE ARQUIVO CSV COM RETORNO EM JSON:

```http
  POST /api/uploads/validation
```

- Body:

| Parâmetro | Tipo       | Descrição                                                         |
| :-------- | :--------- | :---------------------------------------------------------------- |
| `file`    | `file.csv` | `Arquivo do tipo CSV com as colunas "product_code" e "new_price"` |

--

#### ATUALIZAÇÃO DE PREÇOS:

```http
  PUT /api/uploads/update
```

- Body:

| Parâmetro | Tipo       | Descrição                                                         |
| :-------- | :--------- | :---------------------------------------------------------------- |
| `file`    | `file.csv` | `Arquivo do tipo CSV com as colunas "product_code" e "new_price"` |

--

### Pré-requisitos de instalação

Certifique-se de ter os seguintes pré-requisitos instalados antes de executar o projeto:

- Node.js
- npm ou Yarn
- Banco de dados MySQL (5 ou 8)

<br />
<br />

## ▶️ Rodando a aplicação

- Clone este repositório em uma pasta de sua preferência:

```bash
  $ git clone https://github.com/brunnaserafina/price-updater-backend.git
```

- Instale suas depêndencias:

```bash
   npm i
```

- Crie um banco de dados local mysql utilizando o arquivo database.sql na pasta "prisma" do projeto para fazer as migrações necessárias;
- Crie um .env com base no .env.example e insira o endereço do banco de dados mysql criado seguindo o modelo;

```
    PORT=5000
    DATABASE_URL=mysql://<nome-de-usuario>:<senha>@<host>:<porta>/<nome-do-banco-de-dados>?schema=<esquema>
```

- Inicie a aplicação na raíz do projeto rodando o ambiente de desenvolvimento:

```bash
   npm run dev
```

## 🛠️ Tecnologias utilizadas

<img align="left" height="30px" alt="typescript" src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" />
<img align="left" height="30px" alt="nodejs" src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" />
<img align="left" height="30px" alt="express" src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" />
<img align="left" height="30px" alt="prisma" src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" />
<img align="left" height="30px" alt="mysql" src="https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white" />

</br>
</br>

## 🙇🏻‍♀️ Autora

- Feito com ❤️ por [@brunnaserafina](https://www.github.com/brunnaserafina)
