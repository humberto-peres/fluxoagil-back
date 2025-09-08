const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
	const token = req.cookies?.token;
	if (!token) return res.status(401).json({ message: 'Não autenticado' });

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		req.user = payload;
		next();
	} catch {
		return res.status(401).json({ message: 'Token inválido' });
	}
}

function requireRole(...roles) {
	return (req, res, next) => {
		if (!req.user) return res.status(401).json({ message: 'Não autenticado' });
		if (!roles.includes(req.user.role))
			return res.status(403).json({ message: 'Acesso negado' });
		next();
	};
}

module.exports = { authRequired, requireRole };
