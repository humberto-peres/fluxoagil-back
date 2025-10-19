require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

const userRoutes = require('./routes/user.routes');
const teamRoutes = require('./routes/team.routes');
const teamMemberRoutes = require('./routes/teamMember.routes');
const stepRoutes = require('./routes/step.routes');
const priorityRoutes = require('./routes/priority.routes');
const taskTypeRoutes = require('./routes/typeTask.routes');
const workspaceRoutes = require('./routes/workspace.routes');
const taskRoutes = require('./routes/task.routes');
const sprintRoutes = require('./routes/sprint.routes');
const epicRoutes = require('./routes/epic.routes');
const authRoutes = require('./routes/auth.routes');
const searchRoutes = require('./routes/search.routes');

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/teams', teamRoutes);
app.use('/team-members', teamMemberRoutes);
app.use('/steps', stepRoutes);
app.use('/priorities', priorityRoutes);
app.use('/task-types', taskTypeRoutes);
app.use('/workspaces', workspaceRoutes);
app.use('/tasks', taskRoutes);
app.use('/sprints', sprintRoutes);
app.use('/epics', epicRoutes);

app.use(searchRoutes);

app.get('/', (_, res) => {
  res.send('API funcionando ✅');
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '::';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
