module.exports = async function (req, res, utils) {
	const valueId = req.params.valueId;
	let query = `INSERT INTO schema_data (schema_value_id, placeholder, data) VALUES `;
	for (let i = 0; i < req.body.length; i++) {
		query += `(${utils.Esc(valueId)}, '${utils.Esc(req.body[i][0])}', '${utils.Esc(req.body[i][1])}')`;
		if (i !== req.body.length - 1) query += ', ';
	}
	utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully inserted'}));
}