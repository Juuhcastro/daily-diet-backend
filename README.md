# A2 – Daily Diet (Backend)
**Disciplina:** Programação para Web II  
**Curso:** Tecnologia em Análise e Desenvolvimento de Sistemas – UNITINS  
**Estudante:** Juliana Rodrigues de Castro Ferreira

## 📌 Descrição
Este repositório contém a API do projeto Daily Diet, desenvolvida em Node.js com Express, como parte da atividade A2.

A API permite o cadastro de usuários e o gerenciamento de refeições, incluindo métricas sobre a dieta de cada usuário.

## 🧱 Tecnologias utilizadas
- Node.js
- Express
- CORS (para integração com o frontend em React)

## 🔗 Principais rotas

### Usuários
- `POST /users`  
  Cria um novo usuário ou reutiliza um usuário existente com o mesmo nome.

- `GET /users`  
  Lista todos os usuários (uso apenas para conferência em ambiente de desenvolvimento).

### Refeições  
Todas as rotas abaixo exigem o header:
```http
user-id: <id do usuário>
