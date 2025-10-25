const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gerenciamento de usuários
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários
 *     description: Retorna todos os usuários com seus endereços (se cadastrados)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/User'
 *                   - type: object
 *                     properties:
 *                       address:
 *                         $ref: '#/components/schemas/Address'
 *                         nullable: true
 *             example:
 *               - id: 1
 *                 name: João Silva
 *                 email: joao@example.com
 *                 username: joaosilva
 *                 role: user
 *                 address:
 *                   id: 1
 *                   street: Rua das Flores
 *                   city: São Paulo
 *                   state: SP
 *                   zipCode: "01234-567"
 *                   neighborhood: Centro
 *                   number: 123
 *               - id: 2
 *                 name: Maria Santos
 *                 email: maria@example.com
 *                 username: mariasantos
 *                 role: admin
 *                 address: null
 *       500:
 *         description: Erro ao buscar usuários
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao buscar usuários
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Busca um usuário por ID
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuário encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/User'
 *                 - type: object
 *                   properties:
 *                     address:
 *                       $ref: '#/components/schemas/Address'
 *                       nullable: true
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não encontrado
 *       500:
 *         description: Erro ao buscar usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Cria um novo usuário
 *     description: |
 *       Cria um novo usuário no sistema. A senha é criptografada com bcrypt.
 *       O endereço é opcional, mas se fornecido, todos os campos devem ser preenchidos.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - username
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome completo do usuário
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email único do usuário
 *                 example: joao@example.com
 *               username:
 *                 type: string
 *                 description: Nome de usuário único
 *                 example: joaosilva
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Senha com no mínimo 6 caracteres
 *                 example: senha123
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *                 default: user
 *                 description: Papel do usuário no sistema
 *                 example: user
 *               street:
 *                 type: string
 *                 description: Rua (obrigatório se informar endereço)
 *                 example: Rua das Flores
 *               city:
 *                 type: string
 *                 description: Cidade (obrigatório se informar endereço)
 *                 example: São Paulo
 *               state:
 *                 type: string
 *                 description: Estado (obrigatório se informar endereço)
 *                 example: SP
 *               zipCode:
 *                 type: string
 *                 description: CEP (obrigatório se informar endereço, aceita também "cep")
 *                 example: "01234-567"
 *               cep:
 *                 type: string
 *                 description: Alias para zipCode
 *                 example: "01234-567"
 *               neighborhood:
 *                 type: string
 *                 description: Bairro (obrigatório se informar endereço)
 *                 example: Centro
 *               number:
 *                 type: integer
 *                 description: Número (obrigatório se informar endereço)
 *                 example: 123
 *           examples:
 *             withoutAddress:
 *               summary: Usuário sem endereço
 *               value:
 *                 name: João Silva
 *                 email: joao@example.com
 *                 username: joaosilva
 *                 password: senha123
 *                 role: user
 *             withAddress:
 *               summary: Usuário com endereço completo
 *               value:
 *                 name: Maria Santos
 *                 email: maria@example.com
 *                 username: mariasantos
 *                 password: senha123
 *                 role: admin
 *                 street: Rua das Acácias
 *                 city: Rio de Janeiro
 *                 state: RJ
 *                 zipCode: "20000-000"
 *                 neighborhood: Copacabana
 *                 number: 456
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/User'
 *                 - type: object
 *                   properties:
 *                     address:
 *                       $ref: '#/components/schemas/Address'
 *                       nullable: true
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               passwordTooShort:
 *                 summary: Senha muito curta
 *                 value:
 *                   message: Senha obrigatória com no mínimo 6 caracteres.
 *       409:
 *         description: Violação de unicidade (email ou username já existe)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               duplicateEmail:
 *                 summary: Email já cadastrado
 *                 value:
 *                   message: "Violação de unicidade em: email."
 *               duplicateUsername:
 *                 summary: Username já cadastrado
 *                 value:
 *                   message: "Violação de unicidade em: username."
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', controller.create);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualiza um usuário existente
 *     description: |
 *       Atualiza dados de um usuário. Todos os campos são opcionais.
 *       A senha só é atualizada se fornecida (mínimo 6 caracteres).
 *       O endereço usa upsert: cria se não existir, atualiza se existir.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: João da Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao.silva@example.com
 *               username:
 *                 type: string
 *                 example: joaosilva2025
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Se fornecida, deve ter no mínimo 6 caracteres
 *                 example: novaSenha123
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *                 example: admin
 *               street:
 *                 type: string
 *                 example: Rua Nova
 *               city:
 *                 type: string
 *                 example: Curitiba
 *               state:
 *                 type: string
 *                 example: PR
 *               zipCode:
 *                 type: string
 *                 example: "80000-000"
 *               neighborhood:
 *                 type: string
 *                 example: Batel
 *               number:
 *                 type: integer
 *                 example: 789
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/User'
 *                 - type: object
 *                   properties:
 *                     address:
 *                       $ref: '#/components/schemas/Address'
 *                       nullable: true
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Senha deve ter no mínimo 6 caracteres.
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não encontrado
 *       409:
 *         description: Violação de unicidade (email ou username já existe)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /users:
 *   delete:
 *     summary: Remove múltiplos usuários
 *     description: |
 *       Remove permanentemente um ou mais usuários do banco de dados.
 *       
 *       REGRAS DE NEGÓCIO:
 *       - Não é permitido excluir administradores (role: admin)
 *       - Não é permitido excluir usuários com tarefas associadas (userId, reporterId ou assigneeId)
 *       - Não é permitido excluir usuários que são membros de equipes
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 minItems: 1
 *                 description: Array de IDs dos usuários a serem removidos
 *                 example: [3, 4, 5]
 *     responses:
 *       200:
 *         description: Usuários excluídos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuários excluídos com sucesso
 *       400:
 *         description: Erro de validação ou regra de negócio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               noIds:
 *                 summary: Nenhum ID fornecido
 *                 value:
 *                   message: Nenhum ID fornecido para exclusão
 *               withTasks:
 *                 summary: Usuários com tarefas
 *                 value:
 *                   message: "Usuários com tarefas associadas não podem ser excluídos: João Silva, Maria Santos"
 *               inTeams:
 *                 summary: Usuários em equipes
 *                 value:
 *                   message: "Usuários que são membros de equipes não podem ser excluídos: João Silva"
 *       403:
 *         description: Tentativa de excluir administrador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Não é permitido excluir um administrador
 *       500:
 *         description: Erro interno ao excluir usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/', controller.removeMany);

module.exports = router;
