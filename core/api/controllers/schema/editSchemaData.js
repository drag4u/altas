module.exports = async function (req, res, utils) {
	const dataId = req.params.dataId;
	const { placeholder, data } = req.body;

	let query = `UPDATE schema_data SET placeholder = '${utils.Esc(placeholder)}', data = '${utils.Esc(data)}' WHERE schema_data_id = ${utils.Esc(dataId)}`;
	utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully inserted'}));
}