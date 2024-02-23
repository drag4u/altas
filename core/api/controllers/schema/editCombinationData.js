module.exports = async function (req, res, utils) {
	const combinationDataId = req.params.combinationDataId;
	const { dataName, placeholder } = req.body;
	let query = `UPDATE schema_combination_data SET field_name = '${utils.Esc(dataName)}', field_placeholder = '${utils.Esc(placeholder)}' WHERE schema_combination_data_id = ${utils.Esc(combinationDataId)}`;
	utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully inserted'}));
}