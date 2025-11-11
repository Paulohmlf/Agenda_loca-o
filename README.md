# 🚗 Agenda de Locação

Sistema mobile completo para **gestão de locações de veículos**, desenvolvido em **React Native com Expo**.  
<br>Permite gerenciar frota, acompanhar locações, controlar pagamentos e visualizar relatórios financeiros — tudo de forma simples e intuitiva.

---

## 🧰 Tecnologias utilizadas

- **React Native (Expo)**
- **SQLite**
- **React Navigation**
- **Date-fns**
- **Styled Components**

---

## ⚙️ Funcionalidades

✅ Cadastro de clientes e veículos  
✅ Controle de locações (data, valor, status)  
✅ Geração automática de comprovantes em PDF  
✅ Histórico de locações  
✅ Busca e filtragem de registros  
✅ Layout responsivo e moderno  

---

## 📸 Demonstração

<p align="center">
  <img src="assets/screenshot1.png" alt="Tela principal do app" width="300"/>
</p>

---

## 🚀 Instalação e execução

1. **Clone o repositório**
   ```bash
   git clone https://github.com/Paulohmlf/agenda-locacao.git
   cd agenda-locacao
````

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Execute o projeto**

   ```bash
   npx expo start
   ```

---

## 📂 Estrutura de pastas

```
agenda-locacao/
│
├── src/
│   ├── components/       # Componentes reutilizáveis
│   ├── screens/          # Telas do aplicativo
│   ├── database/         # Conexão e funções do SQLite
│   ├── utils/            # Funções auxiliares
│   └── assets/           # Ícones e imagens
│
├── App.js                # Arquivo principal
└── package.json
```

---

## 🧪 Banco de dados

O projeto utiliza **SQLite local** para armazenar informações de clientes, veículos e locações.
Todos os dados ficam salvos no dispositivo, garantindo rapidez e segurança.

---

## 🧾 Geração de PDF

Ao finalizar uma locação, o app gera automaticamente um **termo de responsabilidade em PDF**, contendo:

* Dados do cliente (nome, CPF, RG, endereço, telefone)
* Informações do veículo
* Data e assinatura
* Rodapé personalizado da empresa

---

## 🧑‍💻 Contribuindo

1. Faça um **fork** do projeto
2. Crie uma nova branch para sua feature (`git checkout -b minha-feature`)
3. Faça o commit (`git commit -m 'Adiciona nova feature'`)
4. Envie o push (`git push origin minha-feature`)
5. Abra um **Pull Request**

---

## 🧩 Suporte

Encontrou um bug ou quer sugerir uma melhoria?
Abra uma [issue](https://github.com/Paulohmlf/agenda-locacao/issues).

---

## 👤 Autor

**Paulo Henrique**
📍 Prado, Pernambuco, Brasil
🔗 [GitHub - @Paulohmlf](https://github.com/Paulohmlf)

⭐ Se este projeto te ajudou, não esqueça de deixar uma **estrela** no repositório!

