module.exports = async function (req, res, utils) {
	const {id} = req.params;

	let typeInsertQuery = `
		INSERT INTO type (type_name, type_code, version_columns, version_rows, variant_columns, variant_rows, coc_file, cnit_file)
			SELECT type_name, type_code, version_columns, version_rows, variant_columns, variant_rows, coc_file, cnit_file FROM type  WHERE type_id = ${utils.Esc(id)};
	`;
	utils.ExecuteAction(res, typeInsertQuery, (newTypeResult) => {
		utils.ExecuteAction(res, `SELECT MAX(type_id) as "id" FROM type`, newTypeRows => {
			const newTypeId = newTypeRows[0].id;
			
			const schemaFieldQuery = `
				INSERT INTO schema_fields (type_id, field_name, field_placeholder) 
				SELECT ${newTypeId}, field_name, field_placeholder
					FROM schema_fields where type_id = ${id};
			`;

			utils.ExecuteAction(res, schemaFieldQuery, () => {
				let matricesQuery = `SELECT * FROM matrix WHERE type_id = ${utils.Esc(id)}`;
				utils.ExecuteAction(res, matricesQuery, existingTypeMatrices => {
					if (existingTypeMatrices.length == 0){
						Continue1();
						return;
					}

					let matrixValuesQuery = `
						SELECT * FROM matrix_value WHERE matrix_id IN (
							select matrix_id FROM matrix where type_id = ${utils.Esc(id)}
						)
					`;
					
					utils.ExecuteAction(res, matrixValuesQuery, currentMatrixValuesRows => {
						
						const newMatricesQuery = `
							insert into matrix (type_id)
							select ${utils.Esc(newTypeId)} from matrix where type_id = ${utils.Esc(id)}
						`;

						utils.ExecuteAction(res, newMatricesQuery, () => {
							
							let newMatrixIdsQuery = `SELECT * FROM matrix WHERE type_id = ${utils.Esc(newTypeId)}`;
							utils.ExecuteAction(res, newMatrixIdsQuery, newMatrixIdsRows => {
								
								let oldMatrixIdsArray = existingTypeMatrices.map(matrix => matrix.matrix_id);
								currentMatrixValuesRows.forEach(row => {
									row.matrix_id = newMatrixIdsRows[oldMatrixIdsArray.indexOf(row.matrix_id)].matrix_id;
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
									utils.ExecuteAction(res, `SELECT * FROM schema_values WHERE type_id = ${utils.Esc(id)}`, schemaValuesRows => {
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
											utils.ExecuteAction(res, `SELECT * FROM schema_values WHERE type_id = ${utils.Esc(newTypeId)}`, newSchemaValuesRows => {
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
														Continue1(oldSchemaValueIdArray, newSchemaValueIdArray);
													} else {
														schemaDataRows.forEach(row => {
															newSchemaDataQuery += `(${utils.Esc(row.schema_value_id)}, '${utils.Esc(row.placeholder)}', '${utils.Esc(row.data)}'), `;
														});
														newSchemaDataQuery = newSchemaDataQuery.slice(0, -2);
														newSchemaDataQuery += ';';
														utils.ExecuteAction(res, newSchemaDataQuery, () => {
															Continue1(oldSchemaValueIdArray, newSchemaValueIdArray);
														});
													}
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});

			function Continue1(oldIds, newIds)
			{
				// Copy schema combinations, schema combination sequences and schema combination data
				let schemaCombinationQuery = 'SELECT * FROM schema_combination WHERE type_id = ' + utils.Esc(id);
				utils.ExecuteAction(res, schemaCombinationQuery, schemaCombinationRows => {
					if (schemaCombinationRows.length == 0) {
						res.status(200).json({info: 'successfully copied'});
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
										const schemaValueId = newIds[oldIds.indexOf(row.schema_value_id)];
										newSchemaCombinationSequenceQuery += `('${utils.Esc(newSchemaCombinationIdArray[oldSchemaCombinationIdArray.indexOf(row.schema_combination_id)] )}', '${utils.Esc(schemaValueId)}'), `;
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
												res.status(200).json({info: 'successfully copied'});
											});
										});
									});
								});
							});
						});
					}
				});
			}
		});
	});
}