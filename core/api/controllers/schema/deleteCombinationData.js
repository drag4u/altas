module.exports = async function (req, res, utils) {
	const combinationDataId = req.params.combinationDataId;
	let query = `DELETE FROM schema_combination_data WHERE schema_combination_data_id = ${utils.Esc(combinationDataId)}`;
	utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully deleted'}));
}