module.exports = async function (req, res, utils) {
	const dataId = req.params.dataId;
	let query = `DELETE FROM schema_data WHERE schema_data_id = ${utils.Esc(dataId)}`;
	utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully deleted'}));
}