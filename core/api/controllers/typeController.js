module.exports = (logger, database, utils) => {
    return {
        getAllTypes: async (req, res) => {
			utils.ExecuteAction(res, `SELECT * FROM type`, rows => {
				res.status(200).json(rows);
			});
        },
        createType: async (req, res) => {
			const { name, versionColumns, versionRows, variantColumns, variantRows } = req.body;
			const cocFileName = req.file ? `'${req.file.filename}'` : null;
		
			let query = `INSERT INTO type (type_name, version_columns, version_rows, variant_columns, variant_rows`;
			if (cocFileName)
				query += `, coc_file`;
			query += `) VALUES ('${name}', ${versionColumns}, ${versionRows}, ${variantColumns}, ${variantRows}`;
			if (cocFileName)
				query += `, ${cocFileName}`;
			query += `)`;

			utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully inserted'}));
        },
		editType: async (req, res) => {
			const { name } = req.body;
			const cocFileName = req.file ? `'${req.file.filename}'` : null;
			
			let query = `UPDATE type SET type_name = '${name}'`;
			if (cocFileName)
				query += `, coc_file = ${cocFileName}`;
			query += ` WHERE type_id = ${req.params.id}`;

			utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully updated'}));
        },
		fetchType: async (req, res) => {
			const {id} = req.params;
			utils.ExecuteAction(res, `SELECT * FROM type where type_id = ${id}`, rows => {
				res.status(200).json(rows);
			});
		},
		updateType: async (req, res) => {
			const {id, name, versionColumns, versionRows, variantColumns, variantRows, coc_file} = req.body;
			var query = `UPDATE type SET type_name = '${name}', version_columns = ${versionColumns},  version_rows = ${versionRows}, 
				variant_columns = ${variantColumns}, variant_rows = ${variantRows}, ${coc_file ? `coc_file = '${coc_file}'` : ''}
				WHERE type_id = ${id}
			`;
			utils.ExecuteAction(res, query, rows => {
				res.status(200).json({info: 'successfully updated'});
			});
		},
		deleteType: async (req, res) => {
			const {id} = req.params;

			utils.ExecuteAction(res, `DELETE FROM type WHERE type_id = ${id}`, () => {
				utils.ExecuteAction(res, `SELECT * from matrix where type_id = ${id}`, rows => {
					utils.ExecuteAction(res, `DELETE from matrix where type_id = ${id}`, () => {
						if (rows.length == 0) {
							res.status(200).json({info: 'successfully deleted'});
						} else {
							let query = `DELETE FROM matrix_value WHERE matrix_id IN (`;
							rows.forEach(row => {
								query += `${row.matrix_id},`;
							});
							query = query.slice(0, -1);
							query += `);`;

							utils.ExecuteAction(res, query, () => {
								res.status(200).json({info: 'successfully deleted'});
							});
						}
					});
				});
			});
		},
		removeColumn: async (req, res) => {
			const {typeId, versionVariant, columnId} = req.params;

			let deleteQuery = `DELETE FROM matrix_value WHERE matrix_id IN (SELECT matrix_id FROM matrix WHERE type_id = ${typeId}) AND version_variant = ${versionVariant} AND column = ${columnId};`;
			let updateQuery = `UPDATE matrix_value SET column = column - 1 WHERE matrix_id IN (SELECT matrix_id FROM matrix WHERE type_id = ${typeId}) AND version_variant = ${versionVariant} AND column > ${columnId};`;
			let typeUpdateQuery = `UPDATE type SET version_columns = version_columns - 1 WHERE type_id = ${typeId};`;
			if (versionVariant == 1) {
				typeUpdateQuery = `UPDATE type SET variant_columns = variant_columns - 1 WHERE type_id = ${typeId};`;
			}
			
			utils.ExecuteAction(res, typeUpdateQuery, () => {
				utils.ExecuteAction(res, deleteQuery, () => {
					utils.ExecuteAction(res, updateQuery, () => {
						res.status(200).json({info: 'successfully deleted a column from type'});
					});
				});
			});
		},
		addColumn: async (req, res) => {
			const { typeId, versionVariant, columnId } = req.params;
		
			// Shift subsequent columns to the right
			let updateQuery = `UPDATE matrix_value SET column = column + 1 WHERE matrix_id IN (SELECT matrix_id FROM matrix WHERE type_id = ${typeId}) AND version_variant = ${versionVariant} AND column >= ${columnId};`;
		
			// Insert new column values. Assuming 'defaultValue' is the value you want to insert for the new column.
			let defaultValue = '';
		
			// First, determine the maximum column index for each matrix
			let getMaxColumnIndexQuery = `
				SELECT matrix_id, MAX(column) as max_column
				FROM matrix_value
				WHERE matrix_id IN (SELECT matrix_id FROM matrix WHERE type_id = ${typeId})
				AND version_variant = ${versionVariant}
				GROUP BY matrix_id;
			`;

			utils.ExecuteAction(res, getMaxColumnIndexQuery, maxColumnIndexResults => {
				// Create and execute insert queries based on the max column index results
				let insertQueries = maxColumnIndexResults.map(({ matrix_id, max_column }) => {
					if (max_column < columnId) {
						// Inserting at the end
						return `
							INSERT INTO matrix_value (matrix_id, version_variant, row, column, value)
							SELECT ${matrix_id}, ${versionVariant}, row, ${columnId}, '${defaultValue}'
							FROM matrix_value
							WHERE matrix_id = ${matrix_id} AND version_variant = ${versionVariant}
							GROUP BY row;
						`;
					} else {
						// Inserting in between existing columns
						return `
							INSERT INTO matrix_value (matrix_id, version_variant, row, column, value)
							SELECT ${matrix_id}, ${versionVariant}, row, ${columnId}, '${defaultValue}'
							FROM matrix_value
							WHERE matrix_id = ${matrix_id} AND version_variant = ${versionVariant} AND column >= ${columnId}
							GROUP BY row;
						`;
					}
				});
			
				// Update the type table
				let typeUpdateQuery = `UPDATE type SET version_columns = version_columns + 1 WHERE type_id = ${typeId};`;
				if (versionVariant == 1) {
					typeUpdateQuery = `UPDATE type SET variant_columns = variant_columns + 1 WHERE type_id = ${typeId};`;
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
						res.status(200).json({info: 'Successfully added a column to the type'});
					});
				});
			});
			
		},
		removeRow: async (req, res) => {
			const {typeId, versionVariant, rowId} = req.params;

			let deleteQuery = `DELETE FROM matrix_value WHERE matrix_id IN (SELECT matrix_id FROM matrix WHERE type_id = ${typeId}) AND version_variant = ${versionVariant} AND row = ${rowId};`;
			let updateQuery = `UPDATE matrix_value SET row = row - 1 WHERE matrix_id IN (SELECT matrix_id FROM matrix WHERE type_id = ${typeId}) AND version_variant = ${versionVariant} AND row > ${rowId};`;
			let typeUpdateQuery = `UPDATE type SET version_rows = version_rows - 1 WHERE type_id = ${typeId};`;
			if (versionVariant == 1) {
				typeUpdateQuery = `UPDATE type SET variant_rows = variant_rows - 1 WHERE type_id = ${typeId};`;
			}

			utils.ExecuteAction(res, typeUpdateQuery, () => {
				utils.ExecuteAction(res, deleteQuery, () => {
					utils.ExecuteAction(res, updateQuery, () => {
						res.status(200).json({info: 'successfully deleted a column from type'});
					});
				});
			});
		},
		addRow: async (req, res) => {
			const { typeId, versionVariant, rowId } = req.params;
		
			// Shift subsequent rows down
			let updateQuery = `UPDATE matrix_value SET row = row + 1 WHERE matrix_id IN (SELECT matrix_id FROM matrix WHERE type_id = ${typeId}) AND version_variant = ${versionVariant} AND row >= ${rowId};`;
		
			// Insert new row values. Assuming 'defaultValue' is the value you want to insert for each column in the new row.
			let defaultValue = '';
		
			// First, determine the maximum row index for each matrix
			let getMaxRowIndexQuery = `
				SELECT matrix_id, MAX(row) as max_row
				FROM matrix_value
				WHERE matrix_id IN (SELECT matrix_id FROM matrix WHERE type_id = ${typeId})
				AND version_variant = ${versionVariant}
				GROUP BY matrix_id;
			`;

			utils.ExecuteAction(res, getMaxRowIndexQuery, maxRowIndexResults => {
				// Create and execute insert queries based on the max row index results
				let insertQueries = maxRowIndexResults.map(({ matrix_id, max_row }) => {
					if (rowId === 0) {
						// Inserting at the beginning
						return `
							INSERT INTO matrix_value (matrix_id, version_variant, row, column, value)
							SELECT ${matrix_id}, ${versionVariant}, ${rowId}, column, '${defaultValue}'
							FROM (
								SELECT DISTINCT column
								FROM matrix_value
								WHERE matrix_id = ${matrix_id} AND version_variant = ${versionVariant}
							);
						`;
					} else if (max_row < rowId) {
						// Inserting at the end
						return `
							INSERT INTO matrix_value (matrix_id, version_variant, row, column, value)
							SELECT ${matrix_id}, ${versionVariant}, ${rowId}, column, '${defaultValue}'
							FROM matrix_value
							WHERE matrix_id = ${matrix_id} AND version_variant = ${versionVariant}
							GROUP BY column;
						`;
					} else {
						// Inserting in between existing rows
						return `
							INSERT INTO matrix_value (matrix_id, version_variant, row, column, value)
							SELECT ${matrix_id}, ${versionVariant}, ${rowId}, column, '${defaultValue}'
							FROM matrix_value
							WHERE matrix_id = ${matrix_id} AND version_variant = ${versionVariant} AND row >= ${rowId}
							GROUP BY column;
						`;
					}
				});
			
				// Update the type table
				let typeUpdateQuery = `UPDATE type SET version_rows = version_rows + 1 WHERE type_id = ${typeId};`;
				if (versionVariant == 1) {
					typeUpdateQuery = `UPDATE type SET variant_rows = variant_rows + 1 WHERE type_id = ${typeId};`;
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
		},
    };
};