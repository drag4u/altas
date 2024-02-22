module.exports = async function getAllTypes(req, res, utils) {
    const {typeId, versionVariant, rowId} = req.params;

	let deleteQuery = `DELETE FROM matrix_value WHERE matrix_id IN (SELECT matrix_id FROM matrix WHERE type_id = ${utils.Esc(typeId)}) AND version_variant = ${utils.Esc(versionVariant)} AND row = ${utils.Esc(rowId)};`;
	let updateQuery = `UPDATE matrix_value SET row = row - 1 WHERE matrix_id IN (SELECT matrix_id FROM matrix WHERE type_id = ${utils.Esc(typeId)}) AND version_variant = ${utils.Esc(versionVariant)} AND row > ${utils.Esc(rowId)};`;
	let typeUpdateQuery = `UPDATE type SET version_rows = version_rows - 1 WHERE type_id = ${utils.Esc(typeId)};`;
	if (versionVariant == 1) {
		typeUpdateQuery = `UPDATE type SET variant_rows = variant_rows - 1 WHERE type_id = ${utils.Esc(typeId)};`;
	}

	utils.ExecuteAction(res, typeUpdateQuery, () => {
		utils.ExecuteAction(res, deleteQuery, () => {
			utils.ExecuteAction(res, updateQuery, () => {
				res.status(200).json({info: 'successfully deleted a column from type'});
			});
		});
	});
}