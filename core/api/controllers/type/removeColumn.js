module.exports = async function (req, res, utils) {
    const {typeId, versionVariant, columnId} = req.params;

	let deleteQuery = `DELETE FROM matrix_value WHERE matrix_id IN (SELECT matrix_id FROM matrix WHERE type_id = ${utils.Esc(typeId)}) AND version_variant = ${utils.Esc(versionVariant)} AND column = ${utils.Esc(columnId)};`;
	let updateQuery = `UPDATE matrix_value SET column = column - 1 WHERE matrix_id IN (SELECT matrix_id FROM matrix WHERE type_id = ${utils.Esc(typeId)}) AND version_variant = ${utils.Esc(versionVariant)} AND column > ${utils.Esc(columnId)};`;
	let typeUpdateQuery = `UPDATE type SET version_columns = version_columns - 1 WHERE type_id = ${utils.Esc(typeId)};`;
	if (versionVariant == 1) {
		typeUpdateQuery = `UPDATE type SET variant_columns = variant_columns - 1 WHERE type_id = ${utils.Esc(typeId)};`;
	}

	let schemaDeleteQuery = `DELETE FROM schema_values WHERE type_id = ${utils.Esc(typeId)} AND version_variant = ${utils.Esc(versionVariant)} AND column = ${utils.Esc(columnId)};`;
	let schemaUpdateQuery = `UPDATE schema_values SET column = column - 1 WHERE type_id = ${utils.Esc(typeId)} AND version_variant = ${utils.Esc(versionVariant)} AND column > ${utils.Esc(columnId)};`;
	
	utils.ExecuteAction(res, typeUpdateQuery, () => {
		utils.ExecuteAction(res, deleteQuery, () => {
			utils.ExecuteAction(res, updateQuery, () => {
				utils.ExecuteAction(res, schemaDeleteQuery, () => {
					utils.ExecuteAction(res, schemaUpdateQuery, () => {
						res.status(200).json({info: 'successfully deleted a column from type'});
					});
				});
			});
		});
	});
}