module.exports = async function getAllTypes(req, res, utils) {
    const { typeId, versionVariant, columnId } = req.params;
	
	// Shift subsequent columns to the right
	let updateQuery = `UPDATE matrix_value SET column = column + 1 WHERE matrix_id IN (SELECT matrix_id FROM matrix WHERE type_id = ${utils.Esc(typeId)}) AND version_variant = ${utils.Esc(versionVariant)} AND column >= ${utils.Esc(columnId)};`;

	// Insert new column values. Assuming 'defaultValue' is the value you want to insert for the new column.
	let defaultValue = '';

	// First, determine the maximum column index for each matrix
	let getMaxColumnIndexQuery = `
		SELECT matrix_id, MAX(column) as max_column
		FROM matrix_value
		WHERE matrix_id IN (SELECT matrix_id FROM matrix WHERE type_id = ${utils.Esc(typeId)})
		AND version_variant = ${utils.Esc(versionVariant)}
		GROUP BY matrix_id;
	`;

	utils.ExecuteAction(res, getMaxColumnIndexQuery, maxColumnIndexResults => {
		// Create and execute insert queries based on the max column index results
		let insertQueries = maxColumnIndexResults.map(({ matrix_id, max_column }) => {
			if (max_column < columnId) {
				// Inserting at the end
				return `
					INSERT INTO matrix_value (matrix_id, version_variant, row, column, value)
					SELECT ${utils.Esc(matrix_id)}, ${utils.Esc(versionVariant)}, row, ${utils.Esc(columnId)}, '${utils.Esc(defaultValue)}'
					FROM matrix_value
					WHERE matrix_id = ${utils.Esc(matrix_id)} AND version_variant = ${utils.Esc(versionVariant)}
					GROUP BY row;
				`;
			} else {
				// Inserting in between existing columns
				return `
					INSERT INTO matrix_value (matrix_id, version_variant, row, column, value)
					SELECT ${utils.Esc(matrix_id)}, ${utils.Esc(versionVariant)}, row, ${utils.Esc(columnId)}, '${utils.Esc(defaultValue)}'
					FROM matrix_value
					WHERE matrix_id = ${utils.Esc(matrix_id)} AND version_variant = ${utils.Esc(versionVariant)} AND column >= ${utils.Esc(columnId)}
					GROUP BY row;
				`;
			}
		});
	
		// Update the type table
		let typeUpdateQuery = `UPDATE type SET version_columns = version_columns + 1 WHERE type_id = ${utils.Esc(typeId)};`;
		if (versionVariant == 1) {
			typeUpdateQuery = `UPDATE type SET variant_columns = variant_columns + 1 WHERE type_id = ${utils.Esc(typeId)};`;
		}
		
		// Shift subsequent columns to the right
		let schemaUpdateQuery = `UPDATE schema_values SET column = column + 1 WHERE type_id = ${utils.Esc(typeId)} AND version_variant = ${utils.Esc(versionVariant)} AND column >= ${utils.Esc(columnId)};`;

		// Execute the queries
		utils.ExecuteAction(res, schemaUpdateQuery, () => {
			utils.ExecuteAction(res, typeUpdateQuery, () => {
				utils.ExecuteAction(res, updateQuery, () => {
					// Execute each insert query
					insertQueries.forEach(insertQuery => {
						utils.ExecuteAction(res, insertQuery, () => {
							// Handle completion or errors for each query
						});
					});
					res.status(200).json({info: 'Successfully added a column to the type'});
				});
			});
		});
	});
}