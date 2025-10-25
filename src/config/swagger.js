const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'API REST completa para gerenciamento ágil de projetos, oferecendo recursos para controle de tarefas, sprints, épicos, equipes e workspaces. Suporta metodologias ágeis como Scrum e Kanban com autenticação baseada em JWT.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento',
      },
      {
        url: 'https://api.seudominio.com',
        description: 'Servidor de produção',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'Token JWT armazenado em cookie HttpOnly',
        },
      },
      schemas: {
        // AUTH & USER
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'João Silva' },
            username: { type: 'string', example: 'joaosilva' },
            email: { type: 'string', format: 'email', example: 'joao@example.com' },
            role: { type: 'string', enum: ['admin', 'user'], example: 'user' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'joaosilva' },
            password: { type: 'string', format: 'password', example: 'senha123' },
          },
        },

        // ADDRESS
        Address: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            street: { type: 'string', example: 'Rua das Flores' },
            city: { type: 'string', example: 'São Paulo' },
            state: { type: 'string', example: 'SP' },
            zipCode: { type: 'string', example: '01234-567' },
            neighborhood: { type: 'string', example: 'Centro' },
            number: { type: 'integer', example: 123 },
            userId: { type: 'integer', example: 1 },
          },
        },

        // TEAM
        Team: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Time de Desenvolvimento' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // WORKSPACE
        Workspace: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Projeto Principal' },
            methodology: { type: 'string', example: 'Scrum' },
            key: { type: 'string', example: 'PROJ', maxLength: 5 },
            nextTaskSeq: { type: 'integer', example: 1 },
            nextEpicSeq: { type: 'integer', example: 1 },
            teamId: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // STEP
        Step: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Em Desenvolvimento' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // SPRINT
        Sprint: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Sprint 1' },
            startDate: { type: 'string', format: 'date-time', nullable: true },
            endDate: { type: 'string', format: 'date-time', nullable: true },
            isActive: { type: 'boolean', example: false },
            workspaceId: { type: 'integer', example: 1 },
            activatedAt: { type: 'string', format: 'date-time', nullable: true },
            closedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // EPIC
        Epic: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            key: { type: 'string', example: 'PROJ-1' },
            title: { type: 'string', example: 'Implementar autenticação' },
            description: { type: 'string', nullable: true, example: 'Sistema completo de auth' },
            status: { type: 'string', example: 'open' },
            startDate: { type: 'string', format: 'date-time', nullable: true },
            targetDate: { type: 'string', format: 'date-time', nullable: true },
            priorityId: { type: 'integer', nullable: true, example: 1 },
            workspaceId: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // TASK
        Task: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            idTask: { type: 'string', example: 'PROJ-1' },
            title: { type: 'string', example: 'Criar endpoint de login' },
            description: { type: 'string', nullable: true },
            status: { type: 'string', example: 'in_progress' },
            userId: { type: 'integer', example: 1 },
            reporterId: { type: 'integer', example: 1 },
            assigneeId: { type: 'integer', nullable: true, example: 2 },
            sprintId: { type: 'integer', nullable: true, example: 1 },
            epicId: { type: 'integer', nullable: true, example: 1 },
            stepId: { type: 'integer', example: 2 },
            priorityId: { type: 'integer', example: 1 },
            typeTaskId: { type: 'integer', example: 1 },
            workspaceId: { type: 'integer', example: 1 },
            startDate: { type: 'string', format: 'date-time', nullable: true },
            deadline: { type: 'string', format: 'date-time', nullable: true },
            estimate: { type: 'string', nullable: true, example: '4h' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // PRIORITY
        Priority: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            label: { type: 'string', example: 'Alta' },
            name: { type: 'string', example: 'high' },
            deleted: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // TYPE TASK
        TypeTask: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Bug' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ERROR
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Mensagem de erro' },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Não autenticado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { message: 'Não autenticado' },
            },
          },
        },
        Forbidden: {
          description: 'Acesso negado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { message: 'Acesso negado' },
            },
          },
        },
        NotFound: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { message: 'Recurso não encontrado' },
            },
          },
        },
      },
    },
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
  ],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };