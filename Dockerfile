# Dockerfile
FROM node:20

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta usada pela sua aplicação
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "dev"]
