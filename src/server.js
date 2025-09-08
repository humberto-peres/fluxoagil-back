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

require('dotenv').config();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

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

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API funcionando ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
