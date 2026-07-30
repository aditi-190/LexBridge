const express = require("express");
const router = express.Router();
const javaController = require("../controllers/javaController");
const fs = require('fs');

router.post("/compile", (req, res) => {
	console.log('Route /api/java/compile invoked');
	Promise.resolve()
		.then(() => javaController.compileJavaCode(req, res))
		.catch((err) => {
			const msg = (err && err.stack) ? err.stack : String(err);
			console.error('Route caught error:', msg);
			try { fs.appendFileSync('error_http.log', msg + '\n---\n'); } catch (e) {}
			return res.status(500).json({ success: false, error: err && err.message ? err.message : 'Internal Server Error' });
		});
});

module.exports = router;