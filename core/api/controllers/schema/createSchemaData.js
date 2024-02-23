module.exports = async function (req, res, utils) {
	const valueId = req.params.valueId;
	const { placeholder, data } = req.body;
	let query = `INSERT INTO schema_data (schema_value_id, placeholder, data) VALUES (${utils.Esc(valueId)}, '${utils.Esc(placeholder)}', '${utils.Esc(data)}')`;
	
	utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully inserted'}));
}