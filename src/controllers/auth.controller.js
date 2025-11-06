const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function sign(user) {
	return jwt.sign(
		{ id: user.id, role: user.role, name: user.name, username: user.username },
		process.env.JWT_SECRET,
		{ expiresIn: process.env.JWT_EXPIRES || '7d' }
	);
}

module.exports = {
	async login(req, res) {
		const { username, password } = req.body || {};
		if (!username || !password) return res.status(400).json({ message: 'Credenciais inválidas' });

		const user = await prisma.user.findUnique({ where: { username } });
		if (!user) return res.status(401).json({ message: 'Usuário/senha inválidos' });

		const ok = await bcrypt.compare(password, user.password);
		if (!ok) return res.status(401).json({ message: 'Usuário/senha inválidos' });

		const token = sign(user);

		const isProduction = process.env.NODE_ENV === 'production';

		res.cookie('token', token, {
			httpOnly: true,
			sameSite: isProduction ? 'none' : 'lax',
			secure: isProduction,
			maxAge: 7 * 24 * 60 * 60 * 1000,
			path: '/',
		});

		res.json({
			id: user.id,
			name: user.name,
			username: user.username,
			email: user.email,
			role: user.role,
		});
	},

	async me(req, res) {
		const { id } = req.user;
		const user = await prisma.user.findUnique({
			where: { id },
			select: { id: true, name: true, username: true, email: true, role: true }
		});
		res.json(user);
	},

	async logout(req, res) {
		const isProduction = process.env.NODE_ENV === 'production';

		res.clearCookie('token', {
			httpOnly: true,
			sameSite: isProduction ? 'none' : 'lax',
			secure: isProduction,
			path: '/',
		});

		res.json({ message: 'OK' });
	},
};
