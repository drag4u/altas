module.exports = async function (req, res, utils) {
    const { typeId, versionVariant, rowId } = req.params;
	
	// Shift subsequent rows down
	let updateQuery = `UPDATE matrix_value SET row = row + 1 WHERE matrix_id IN (SELECT matrix_id FROM matrix WHERE type_id = ${utils.Esc(typeId)}) AND version_variant = ${utils.Esc(versionVariant)} AND row >= ${utils.Esc(rowId)};`;

	// Insert new row values. Assuming 'defaultValue' is the value you want to insert for each column in the new row.
	let defaultValue = '';

	// First, determine the maximum row index for each matrix
	let getMaxRowIndexQuery = `
		SELECT matrix_id, MAX(row) as max_row
		FROM matrix_value
		WHERE matrix_id IN (SELECT matrix_id FROM matrix WHERE type_id = ${utils.Esc(typeId)})
		AND version_variant = ${utils.Esc(versionVariant)}
		GROUP BY matrix_id;
	`;

	utils.ExecuteAction(res, getMaxRowIndexQuery, maxRowIndexResults => {
		// Create and execute insert queries based on the max row index results
		let insertQueries = maxRowIndexResults.map(({ matrix_id, max_row }) => {
			if (rowId === 0) {
				// Inserting at the beginning
				return `
					INSERT INTO matrix_value (matrix_id, version_variant, row, column, value)
					SELECT ${utils.Esc(matrix_id)}, ${utils.Esc(versionVariant)}, ${utils.Esc(rowId)}, column, '${utils.Esc(defaultValue)}'
					FROM (
						SELECT DISTINCT column
						FROM matrix_value
						WHERE matrix_id = ${utils.Esc(matrix_id)} AND version_variant = ${utils.Esc(versionVariant)}
					);
				`;
			} else if (max_row < rowId) {
				// Inserting at the end
				return `
					INSERT INTO matrix_value (matrix_id, version_variant, row, column, value)
					SELECT ${utils.Esc(matrix_id)}, ${utils.Esc(versionVariant)}, ${utils.Esc(rowId)}, column, '${utils.Esc(defaultValue)}'
					FROM matrix_value
					WHERE matrix_id = ${utils.Esc(matrix_id)} AND version_variant = ${utils.Esc(versionVariant)}
					GROUP BY column;
				`;
			} else {
				// Inserting in between existing rows
				return `
					INSERT INTO matrix_value (matrix_id, version_variant, row, column, value)
					SELECT ${utils.Esc(matrix_id)}, ${utils.Esc(versionVariant)}, ${utils.Esc(rowId)}, column, '${utils.Esc(defaultValue)}'
					FROM matrix_value
					WHERE matrix_id = ${utils.Esc(matrix_id)} AND version_variant = ${utils.Esc(versionVariant)} AND row >= ${utils.Esc(rowId)}
					GROUP BY column;
				`;
			}
		});
	
		// Update the type table
		let typeUpdateQuery = `UPDATE type SET version_rows = version_rows + 1 WHERE type_id = ${utils.Esc(typeId)};`;
		if (versionVariant == 1) {
			typeUpdateQuery = `UPDATE type SET variant_rows = variant_rows + 1 WHERE type_id = ${utils.Esc(typeId)};`;
		}
	
		// Execute the queries
		utils.ExecuteAction(res, typeUpdateQuery, () => {
			utils.ExecuteAction(res, updateQuery, () => {
				// Execute each insert query
				insertQueries.forEach(insertQuery => {
					utils.ExecuteAction(res, insertQuery, () => {
						// Handle completion or errors for each query
					});
				});
				res.status(200).json({info: 'Successfully added a row to the type'});
			});
		});
	});
}