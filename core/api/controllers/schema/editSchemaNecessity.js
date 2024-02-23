module.exports = async function (req, res, utils) {
	const dataId = req.params.dataId;
	const { necessity } = req.body;

	let query = `UPDATE schema_values SET necessary = '${utils.Esc(necessity)}' WHERE schema_value_id = ${utils.Esc(dataId)}`;
	utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully inserted'}));
}