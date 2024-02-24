module.exports = async function (req, res, utils) {
	const { id } = req.params;
	const fileNameQuery = `SELECT cnit_file FROM type WHERE type_id = ${utils.Esc(id)}`;
	utils.ExecuteAction(res, fileNameQuery, fileRows => {
		if (fileRows.length > 0) {
			utils.DeleteFileIfNotUsed(res, fileRows[0].cnit_file);
		}
	});
    let query = `UPDATE type SET cnit_file = null WHERE type_id = ${utils.Esc(id)}`;
	utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully removed CNIT file'}));
}