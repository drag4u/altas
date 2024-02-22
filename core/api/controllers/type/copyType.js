module.exports = async function getAllTypes(req, res, utils) {
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
}