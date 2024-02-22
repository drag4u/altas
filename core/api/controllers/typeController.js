module.exports = (logger, database, utils) => {
    return {
        getAllTypes: async (req, res) => {
			utils.ExecuteAction(res, `SELECT * FROM type`, rows => {
				res.status(200).json(rows);
			});
        },
        createType: async (req, res) => {
			const { name, code, versionColumns, versionRows, variantColumns, variantRows } = req.body;
			const cocFileName = req.files.cocFile ? `'${req.files.cocFile[0].filename}'` : null;
			const cnitFileName = req.files.cnitFile ? `'${req.files.cnitFile[0].filename}'` : null;
		
			let query = `INSERT INTO type (type_name, type_code, version_columns, version_rows, variant_columns, variant_rows`;
			if (cocFileName)
				query += `, coc_file`;
			if (cnitFileName)
				query += `, cnit_file`;
			query += `) VALUES ('${utils.Esc(name)}', '${utils.Esc(code)}', ${utils.Esc(versionColumns)}, ${utils.Esc(versionRows)}, ${utils.Esc(variantColumns)}, ${utils.Esc(variantRows)}`;
			if (cocFileName)
				query += `, ${utils.Esc(cocFileName)}`;
			if (cnitFileName)
				query += `, ${utils.Esc(cnitFileName)}`;
			query += `)`;

			utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully inserted'}));
        },
		editType: async (req, res) => {
			const { name, code } = req.body;
			const cocFileName = req.files.editCocFile ? `${req.files.editCocFile[0].filename}` : null;
			const cnitFileName = req.files.editCNITFile ? `${req.files.editCNITFile[0].filename}` : null;
			
			let query = `UPDATE type SET type_name = '${utils.Esc(name)}', type_code = '${utils.Esc(code)}'`;
			if (cocFileName)
				query += `, coc_file = '${utils.Esc(cocFileName)}'`;
			if (cnitFileName)
				query += `, cnit_file = '${utils.Esc(cnitFileName)}'`;
			query += ` WHERE type_id = ${utils.Esc(req.params.id)}`;

			utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully updated'}));
        },
		copyType: async (req, res) => {
			const {id} = req.params;
			utils.ExecuteAction(res, `SELECT * FROM type where type_id = ${utils.Esc(id)}`, rows => {
				let type = rows[0];
				let query = `INSERT INTO type (type_name, type_code, version_columns, version_rows, variant_columns, variant_rows, coc_file, cnit_file) VALUES ('${utils.Esc(type.type_name)}', '${utils.Esc(type.type_code)}', ${utils.Esc(type.version_columns)}, ${utils.Esc(type.version_rows)}, ${utils.Esc(type.variant_columns)}, ${utils.Esc(type.variant_rows)}`;
				query += type.coc_file == null ? `, null` : `, '${utils.Esc(type.coc_file)}'`;
				query += type.cnit_file == null ? `, null` : `, '${utils.Esc(type.cnit_file)}'`;
				query += `);`;

				utils.ExecuteAction(res, query, () => {
					// get new type id
					utils.ExecuteAction(res, `SELECT MAX(type_id) as "id" FROM type`, newTypeRows => {
						const newTypeId = newTypeRows[0].id;
						console.log(newTypeId);

						let schemaFieldQuery = 'SELECT * FROM schema_fields WHERE type_id = ' + utils.Esc(id);
						utils.ExecuteAction(res, schemaFieldQuery, schemaFieldRows => {
							if (schemaFieldRows.length == 0) {
								Continue1();
							} else {
								let newSchemaFieldQuery = 'INSERT INTO schema_fields (type_id, field_name, field_placeholder) VALUES ';
								schemaFieldRows.forEach(row => {
									newSchemaFieldQuery += `(${utils.Esc(newTypeId)}, '${utils.Esc(row.field_name)}', '${utils.Esc(row.field_placeholder)}'), `;
								});
								newSchemaFieldQuery = newSchemaFieldQuery.slice(0, -2);
								newSchemaFieldQuery += ';';
								utils.ExecuteAction(res, newSchemaFieldQuery, () => {
									Continue1();
								});
							}
						});

						function Continue1()
						{
							// Copy schema combinations, schema combination sequences and schema combination data
							let schemaCombinationQuery = 'SELECT * FROM schema_combination WHERE type_id = ' + utils.Esc(id);
							utils.ExecuteAction(res, schemaCombinationQuery, schemaCombinationRows => {
								if (schemaCombinationRows.length == 0) {
									Continue2();
								} else {
									let newSchemaCombinationQuery = 'INSERT INTO schema_combination (type_id, combination_name) VALUES ';
									schemaCombinationRows.forEach(row => {
										newSchemaCombinationQuery += `(${utils.Esc(newTypeId)}, '${utils.Esc(row.combination_name)}'), `;
									});
									newSchemaCombinationQuery = newSchemaCombinationQuery.slice(0, -2);
									newSchemaCombinationQuery += ';';
									utils.ExecuteAction(res, newSchemaCombinationQuery, () => {
										// copy combination sequences to new combinations
										let newSchemaCombinationQuery = 'SELECT * FROM schema_combination WHERE type_id = ' + utils.Esc(newTypeId);
										utils.ExecuteAction(res, newSchemaCombinationQuery, newSchemaCombinationRows => {
											let newSchemaCombinationIdArray = [];
											newSchemaCombinationRows.forEach(row => {
												newSchemaCombinationIdArray.push(row.schema_combination_id);
											});
											let oldSchemaCombinationIdArray = [];
											schemaCombinationRows.forEach(row => {
												oldSchemaCombinationIdArray.push(row.schema_combination_id);
											});
											let schemaCombinationSequenceQuery = 'SELECT * FROM schema_combination_sequence WHERE schema_combination_id IN (' + oldSchemaCombinationIdArray.join(',') + ')';
											utils.ExecuteAction(res, schemaCombinationSequenceQuery, schemaCombinationSequenceRows => {
												let newSchemaCombinationSequenceQuery = 'INSERT INTO schema_combination_sequence (schema_combination_id, schema_value_id) VALUES ';
												schemaCombinationSequenceRows.forEach(row => {
													newSchemaCombinationSequenceQuery += `('${utils.Esc(newSchemaCombinationIdArray[oldSchemaCombinationIdArray.indexOf(row.schema_combination_id)] )}', '${utils.Esc(row.schema_value_id)}'), `;
												});
												newSchemaCombinationSequenceQuery = newSchemaCombinationSequenceQuery.slice(0, -2);
												newSchemaCombinationSequenceQuery += ';';
												utils.ExecuteAction(res, newSchemaCombinationSequenceQuery, () => {
													// copy combination data to new combinations
													let schemaCombinationDataQuery = 'SELECT * FROM schema_combination_data WHERE schema_combination_id IN (' + oldSchemaCombinationIdArray.join(',') + ')';
													utils.ExecuteAction(res, schemaCombinationDataQuery, schemaCombinationDataRows => {
														let newSchemaCombinationDataQuery = 'INSERT INTO schema_combination_data (schema_combination_id, field_name, field_placeholder) VALUES ';
														schemaCombinationDataRows.forEach(row => {
															newSchemaCombinationDataQuery += `(${utils.Esc(newSchemaCombinationIdArray[oldSchemaCombinationIdArray.indexOf(row.schema_combination_id)] )}, '${utils.Esc(row.field_name)}', '${utils.Esc(row.field_placeholder)}'), `;
														});
														newSchemaCombinationDataQuery = newSchemaCombinationDataQuery.slice(0, -2);
														newSchemaCombinationDataQuery += ';';
														utils.ExecuteAction(res, newSchemaCombinationDataQuery, () => {
															Continue2();
														});
													});
												});
											});
										});
									});
								}
							});
						}

						function Continue2()
						{
							let matricesQuery = `SELECT * FROM matrix WHERE type_id = ${utils.Esc(id)}`;
							utils.ExecuteAction(res, matricesQuery, existingTypeMatrices => {
								// get all matrix values for these matrices
								let matrixIds = '';
								let oldMatrixIdsArray = [];
								existingTypeMatrices.forEach(row => { 
									matrixIds += `${row.matrix_id},`; 
									oldMatrixIdsArray.push(row.matrix_id);
								});
								matrixIds = matrixIds.slice(0, -1);
								let matrixValuesQuery = `SELECT * FROM matrix_value WHERE matrix_id IN (${utils.Esc(matrixIds)})`;
								/////////////////////////
								utils.ExecuteAction(res, matrixValuesQuery, currentMatrixValuesRows => {
									// insert new matrices for new type
									let newMatricesQuery = 'INSERT INTO matrix (type_id) VALUES ';
									if (existingTypeMatrices.length == 0) {
										res.status(200).json({info: 'successfully copied'});
									} else {
										existingTypeMatrices.forEach(row => {
											newMatricesQuery += `(${utils.Esc(newTypeId)}), `;
										});
										newMatricesQuery = newMatricesQuery.slice(0, -2);
										newMatricesQuery += ';';
										// INSERT INTO matrix (type_id) VALUES (14), (14), (14);
										utils.ExecuteAction(res, newMatricesQuery, () => {
											// get new matrix ids for new matrices
											let newMatrixIdsQuery = `SELECT * FROM matrix WHERE type_id = ${utils.Esc(newTypeId)}`;
											utils.ExecuteAction(res, newMatrixIdsQuery, newMatrixIdsRows => {
												let newMatrixIds = '';
												let newMatrixIdsArray = [];
												newMatrixIdsRows.forEach(row => { 
													newMatrixIds += `${row.matrix_id},`; 
													newMatrixIdsArray.push(row.matrix_id);
												});
												newMatrixIds = newMatrixIds.slice(0, -1);
												
												currentMatrixValuesRows.forEach(row => {
													row.matrix_id = newMatrixIdsArray[oldMatrixIdsArray.indexOf(row.matrix_id)];
												});
												// copy old matrix values by changing matrix_id to new matrix id
												let newMatrixValuesQuery = 'INSERT INTO matrix_value (matrix_id, version_variant, row, column, value) VALUES ';
												
												currentMatrixValuesRows.forEach(row => {
													newMatrixValuesQuery += `(${utils.Esc(row.matrix_id)}, ${utils.Esc(row.version_variant)}, ${utils.Esc(row.row)}, ${utils.Esc(row.column)}, '${utils.Esc(row.value)}'), `;
												});
												newMatrixValuesQuery = newMatrixValuesQuery.slice(0, -2);
												newMatrixValuesQuery += ';';
												utils.ExecuteAction(res, newMatrixValuesQuery, () => {
													// select old type schema values
													let schemaValuesQuery = `SELECT * FROM schema_values WHERE type_id = ${utils.Esc(id)}`;
													utils.ExecuteAction(res, schemaValuesQuery, schemaValuesRows => {
														let oldSchemaValueIdArray = [];
														schemaValuesRows.forEach(row => {
															row.type_id = newTypeId;
															oldSchemaValueIdArray.push(row.schema_value_id);
														});
														// insert new type schema values
														let newSchemaValuesQuery = 'INSERT INTO schema_values (type_id, version_variant, column, unique_matrix_value, necessary) VALUES ';
														schemaValuesRows.forEach(row => {
															newSchemaValuesQuery += `(${utils.Esc(row.type_id)}, ${utils.Esc(row.version_variant)}, ${utils.Esc(row.column)}, '${utils.Esc(row.unique_matrix_value)}', ${utils.Esc(row.necessary)}), `;
														});
														newSchemaValuesQuery = newSchemaValuesQuery.slice(0, -2);
														newSchemaValuesQuery += ';';
														utils.ExecuteAction(res, newSchemaValuesQuery, () => {
															// select new schema values with newTypeId
															let newSchemaValuesQuery = `SELECT * FROM schema_values WHERE type_id = ${utils.Esc(newTypeId)}`;
															utils.ExecuteAction(res, newSchemaValuesQuery, newSchemaValuesRows => {
																let newSchemaValueIdArray = [];
																newSchemaValuesRows.forEach(row => {
																	newSchemaValueIdArray.push(row.schema_value_id);
																});
		
																// select old schema data from oldSchemaValueIdArray
																let schemaDataQuery = `SELECT * FROM schema_data WHERE schema_value_id IN (${utils.Esc(oldSchemaValueIdArray)})`;
																utils.ExecuteAction(res, schemaDataQuery, schemaDataRows => {
																	schemaDataRows.forEach(row => {
																		row.schema_value_id = newSchemaValueIdArray[oldSchemaValueIdArray.indexOf(row.schema_value_id)];
																	});
																	// insert new schema data
																	let newSchemaDataQuery = 'INSERT INTO schema_data (schema_value_id, placeholder, data) VALUES ';
																	if (schemaDataRows.length == 0) {
																		res.status(200).json({info: 'successfully copied'});
																	} else {
																		schemaDataRows.forEach(row => {
																			newSchemaDataQuery += `(${utils.Esc(row.schema_value_id)}, '${utils.Esc(row.placeholder)}', '${utils.Esc(row.data)}'), `;
																		});
																		newSchemaDataQuery = newSchemaDataQuery.slice(0, -2);
																		newSchemaDataQuery += ';';
																		utils.ExecuteAction(res, newSchemaDataQuery, () => {
																			res.status(200).json({info: 'successfully copied'});
																		});
																	}
																});
															});
														});
													});
												});
											});
										});
									}
								});
							});
						}
					});
				});
			});
		},
		removeCoCFile: async (req, res) => {
			let query = `UPDATE type SET coc_file = null WHERE type_id = ${utils.Esc(req.params.id)}`;
			utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully removed CoC file'}));
		},
		removeCNITFile: async (req, res) => {
			let query = `UPDATE type SET cnit_file = null WHERE type_id = ${utils.Esc(req.params.id)}`;
			utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully removed CNIT file'}));
		},
		fetchType: async (req, res) => {
			const {id} = req.params;
			utils.ExecuteAction(res, `SELECT * FROM type where type_id = ${utils.Esc(id)}`, rows => {
				res.status(200).json(rows);
			});
		},
		updateType: async (req, res) => {
			const {id, name, versionColumns, versionRows, variantColumns, variantRows, coc_file, cnit_file} = req.body;
			var query = `UPDATE type SET type_name = '${utils.Esc(name)}', version_columns = ${utils.Esc(versionColumns)},  version_rows = ${utils.Esc(versionRows)}, 
				variant_columns = ${utils.Esc(variantColumns)}, variant_rows = ${utils.Esc(variantRows)}, ${coc_file ? `coc_file = '${utils.Esc(coc_file)}'` : ''}, ${cnit_file ? `cnit_file = '${utils.Esc(cnit_file)}'` : ''}
				WHERE type_id = ${utils.Esc(id)}
			`;
			utils.ExecuteAction(res, query, () => {
				res.status(200).json({info: 'successfully updated'});
			});
		},
		deleteType: async (req, res) => {
			const {id} = req.params;

			utils.ExecuteAction(res, `DELETE FROM type WHERE type_id = ${utils.Esc(id)}`, () => {
				utils.ExecuteAction(res, `SELECT * from matrix where type_id = ${utils.Esc(id)}`, rows => {
					utils.ExecuteAction(res, `DELETE from matrix where type_id = ${utils.Esc(id)}`, () => {
						if (rows.length == 0) {
							res.status(200).json({info: 'successfully deleted'});
						} else {
							let query = `DELETE FROM matrix_value WHERE matrix_id IN (`;
							rows.forEach(row => {
								query += `${utils.Esc(row.matrix_id)},`;
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
		},
		addColumn: async (req, res) => {
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
			
		},
		removeRow: async (req, res) => {
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
		},
		addRow: async (req, res) => {
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
		},
    };
};