module.exports = async function (req, res, utils) {
	const combinationId = req.params.combinationId;
	const { dataName, placeholder } = req.body;
	console.log( combinationId, dataName, placeholder);
	let query = `INSERT INTO schema_combination_data (schema_combination_id, field_name, field_placeholder) VALUES (${utils.Esc(combinationId)}, '${utils.Esc(dataName)}', '${utils.Esc(placeholder)}')`;
	utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully inserted'}));
}