const express = require('express');
const cors = require('cors');
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

require('dotenv').config();
app.use(cors());
app.use(express.json());

app.use('/users', userRoutes);

app.use('/teams', teamRoutes);

app.use('/team-members', teamMemberRoutes);

app.use('/steps', stepRoutes);

app.use('/priorities', priorityRoutes);

app.use('/task-types', taskTypeRoutes);

app.use('/workspaces', workspaceRoutes);

app.use('/tasks', taskRoutes);

app.use('/sprints', sprintRoutes);

app.get('/', (req, res) => {
  res.send('API funcionando ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
