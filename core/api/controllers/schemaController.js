module.exports = (logger, database, utils) => {
    return {
        getSchema: async (req, res) => {
			const typeId = req.params.typeId;
			
			utils.ExecuteAction(res, `SELECT * from schema_values where type_id = ${utils.Esc(typeId)}`, rows => {
				res.status(200).json(rows);
			});
        },

		getSchemaData: async (req, res) => {
			const valueId = req.params.valueId;
			
			utils.ExecuteAction(res, `SELECT * from schema_data where schema_value_id = ${utils.Esc(valueId)}`, rows => {
				res.status(200).json(rows);
			});
		},

		createSchemaData: async (req, res) => {
			const valueId = req.params.valueId;
			const { placeholder, data } = req.body;
			let query = `INSERT INTO schema_data (schema_value_id, placeholder, data) VALUES (${utils.Esc(valueId)}, '${utils.Esc(placeholder)}', '${utils.Esc(data)}')`;
			
			utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully inserted'}));
        },

		editSchemaData: async (req, res) => {
			const dataId = req.params.dataId;
			const { placeholder, data } = req.body;

			let query = `UPDATE schema_data SET placeholder = '${utils.Esc(placeholder)}', data = '${utils.Esc(data)}' WHERE schema_data_id = ${utils.Esc(dataId)}`;
			utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully inserted'}));
        },
		
		editSchemaNecessity: async (req, res) => {
			const dataId = req.params.dataId;
			const { necessity } = req.body;

			let query = `UPDATE schema_values SET necessary = '${utils.Esc(necessity)}' WHERE schema_value_id = ${utils.Esc(dataId)}`;
			utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully inserted'}));
        },

		createField: async (req, res) => {
			const typeId = req.params.typeId;
			const { fieldName, fieldPlaceholder } = req.body;

			let query = `INSERT INTO schema_fields (type_id, field_name, field_placeholder) VALUES (${utils.Esc(typeId)}, '${utils.Esc(fieldName)}', '${utils.Esc(fieldPlaceholder)}')`;
			utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully inserted'}));
		},

		getFields: async (req, res) => {
			const fieldId = req.params.fieldId;
			
			utils.ExecuteAction(res, `SELECT * from schema_fields where type_id = ${utils.Esc(fieldId)}`, rows => {
				res.status(200).json(rows);
			});
		},

		getField: async (req, res) => {
			const fieldId = req.params.fieldId;
			
			utils.ExecuteAction(res, `SELECT * from schema_fields where schema_field_id = ${utils.Esc(fieldId)}`, rows => {
				res.status(200).json(rows);
			});
		},

		editField: async (req, res) => {
			const fieldId = req.params.fieldId;
			const { fieldName, fieldPlaceholder } = req.body;

			let query = `UPDATE schema_fields SET field_name = '${utils.Esc(fieldName)}', field_placeholder = '${utils.Esc(fieldPlaceholder)}' WHERE schema_field_id = ${utils.Esc(fieldId)}`;
			utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully inserted'}));
		},

		deleteSchemaData: async (req, res) => {
			const dataId = req.params.dataId;
			let query = `DELETE FROM schema_data WHERE schema_data_id = ${utils.Esc(dataId)}`;
			utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully deleted'}));
		},

		deleteSchemaFieldData: async (req, res) => {
			const dataId = req.params.dataId;
			let query = `DELETE FROM schema_fields WHERE schema_field_id = ${utils.Esc(dataId)}`;
			utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully deleted'}));
		},

		createCombination: async (req, res) => {
			const typeId = req.params.typeId;
			const { name, combinationValues } = req.body;
			let query = `INSERT INTO schema_combination (type_id, combination_name) VALUES (${utils.Esc(typeId)}, '${utils.Esc(name)}')`;
			utils.ExecuteAction(res, query, () => {
				utils.ExecuteAction(res, `SELECT MAX(schema_combination_id) as "id" FROM schema_combination`, rows => {
					const newCombinationID = rows[0].id;
					let query = `INSERT INTO schema_combination_sequence (schema_combination_id, schema_value_id) VALUES `;
					for (let i = 0; i < combinationValues.length; i++) {
						const dataRow = combinationValues[i];
						query += `(${utils.Esc(newCombinationID)}, ${utils.Esc(dataRow)}),`;
					}
					query = query.slice(0, -1);
					query += `;`;
					utils.ExecuteAction(res, query, () => {
						res.status(200).json({info: 'Combination successfully created'});
					});
				});
			});
		},

		editCombination: async (req, res) => {
			const combinationId = req.params.combinationId;
			const { name, combinationValues } = req.body;
			// delete existing sequence
			let query = `DELETE FROM schema_combination_sequence WHERE schema_combination_id = ${utils.Esc(combinationId)}`;
			utils.ExecuteAction(res, query, () => {
				// insert new sequence
				let query = `INSERT INTO schema_combination_sequence (schema_combination_id, schema_value_id) VALUES `;
				for (let i = 0; i < combinationValues.length; i++) {
					const dataRow = combinationValues[i];
					query += `(${utils.Esc(combinationId)}, ${utils.Esc(dataRow)}),`;
				}
				query = query.slice(0, -1);
				query += `;`;
				utils.ExecuteAction(res, query, () => {
					// update combination name
					let query = `UPDATE schema_combination SET combination_name = '${utils.Esc(name)}' WHERE schema_combination_id = ${utils.Esc(combinationId)}`;
					utils.ExecuteAction(res, query, () => {
						res.status(200).json({info: 'Combination successfully updated'});
					});
				});
			});
		},

		copyCombination: async (req, res) => {
			const combinationId = req.params.combinationId;
			utils.ExecuteAction(res, `SELECT * from schema_combination where schema_combination_id = ${utils.Esc(combinationId)}`, rows => {
				const combination = rows[0];
				let query = `INSERT INTO schema_combination (type_id, combination_name) VALUES (${utils.Esc(combination.type_id)}, '${utils.Esc(combination.combination_name)}')`;
				utils.ExecuteAction(res, query, () => {
					utils.ExecuteAction(res, `SELECT MAX(schema_combination_id) as "id" FROM schema_combination`, rows => {
						const newCombinationID = rows[0].id;
						utils.ExecuteAction(res, `SELECT * from schema_combination_sequence where schema_combination_id = ${utils.Esc(combinationId)}`, sequenceRows => {
							let query = `INSERT INTO schema_combination_sequence (schema_combination_id, schema_value_id) VALUES `;
							for (let i = 0; i < sequenceRows.length; i++) {
								const sequence = sequenceRows[i];
								query += `(${utils.Esc(newCombinationID)}, ${utils.Esc(sequence.schema_value_id)}),`;
							}
							query = query.slice(0, -1);
							query += `;`;
							utils.ExecuteAction(res, query, () => {
								// now copy schema_combination_data
								utils.ExecuteAction(res, `SELECT * from schema_combination_data where schema_combination_id = ${utils.Esc(combinationId)}`, dataRows => {
									let query = `INSERT INTO schema_combination_data (schema_combination_id, field_name, field_placeholder) VALUES `;
									for (let i = 0; i < dataRows.length; i++) {
										const data = dataRows[i];
										query += `(${utils.Esc(newCombinationID)}, '${utils.Esc(data.field_name)}', '${utils.Esc(data.field_placeholder)}'),`;
									}
									query = query.slice(0, -1);
									query += `;`;
									utils.ExecuteAction(res, query, () => {
										res.status(200).json({info: 'Combination successfully copied'});
									});
								});
							});
						});
					});
				});
			});
		},

		createCombinationData: async (req, res) => {
			const combinationId = req.params.combinationId;
			const { dataName, placeholder } = req.body;
			console.log( combinationId, dataName, placeholder);
			let query = `INSERT INTO schema_combination_data (schema_combination_id, field_name, field_placeholder) VALUES (${utils.Esc(combinationId)}, '${utils.Esc(dataName)}', '${utils.Esc(placeholder)}')`;
			utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully inserted'}));
		},

		getCombinations: async (req, res) => {
			const typeId = req.params.typeId;
			utils.ExecuteAction(res, `SELECT * from schema_combination where type_id = ${utils.Esc(typeId)}`, rows => {
				// also select from schema_combination_sequence
				const combinations = [];
				const promises = [];
				for (let i = 0; i < rows.length; i++) {
					const combination = rows[i];
					promises.push(new Promise(resolve => {
						utils.ExecuteAction(res, `SELECT * from schema_combination_sequence where schema_combination_id = ${utils.Esc(combination.schema_combination_id)}`, sequenceRows => {
							combination.sequence = sequenceRows;
							combinations.push(combination);
							resolve();
						});
					}));
				}
				Promise.all(promises).then(() => {
					// also get schema_combination_data
					const promises = [];
					for (let i = 0; i < combinations.length; i++) {
						const combination = combinations[i];
						promises.push(new Promise(resolve => {
							utils.ExecuteAction(res, `SELECT * from schema_combination_data where schema_combination_id = ${utils.Esc(combination.schema_combination_id)}`, dataRows => {
								combination.data = dataRows;
								resolve();
							});
						}));
					}
					Promise.all(promises).then(() => {
						res.status(200).json(combinations.sort((a, b) => a.schema_combination_id - b.schema_combination_id));
					});
				});
			});
		},

		deleteCombinationData: async (req, res) => {
			const combinationDataId = req.params.combinationDataId;
			let query = `DELETE FROM schema_combination_data WHERE schema_combination_data_id = ${utils.Esc(combinationDataId)}`;
			utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully deleted'}));
		},

		deleteCombination: async (req, res) => {
			const combinationId = req.params.combinationId;
			let query = `DELETE FROM schema_combination WHERE schema_combination_id = ${utils.Esc(combinationId)}`;
			utils.ExecuteAction(res, query, () => {
				let query = `DELETE FROM schema_combination_sequence WHERE schema_combination_id = ${utils.Esc(combinationId)}`;
				utils.ExecuteAction(res, query, () => {
					let query = `DELETE FROM schema_combination_data WHERE schema_combination_id = ${utils.Esc(combinationId)}`;
					utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully deleted'}));
				});
			});
		},

		getCombinationData: async (req, res) => {
			const combinationDataId = req.params.combinationDataId;
			utils.ExecuteAction(res, `SELECT * from schema_combination_data where schema_combination_data_id = ${utils.Esc(combinationDataId)}`, rows => {
				res.status(200).json(rows);
			});
		},

		editCombinationData: async (req, res) => {
			const combinationDataId = req.params.combinationDataId;
			const { dataName, placeholder } = req.body;
			let query = `UPDATE schema_combination_data SET field_name = '${utils.Esc(dataName)}', field_placeholder = '${utils.Esc(placeholder)}' WHERE schema_combination_data_id = ${utils.Esc(combinationDataId)}`;
			utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully inserted'}));
		},

		copyCombinationData: async (req, res) => {
			const combinationDataId = req.params.combinationDataId;
			utils.ExecuteAction(res, `SELECT * from schema_combination_data where schema_combination_data_id = ${utils.Esc(combinationDataId)}`, rows => {
				const data = rows[0];
				let query = `INSERT INTO schema_combination_data (schema_combination_id, field_name, field_placeholder) VALUES (${utils.Esc(data.schema_combination_id)}, '${utils.Esc(data.field_name)}', '${utils.Esc(data.field_placeholder)}')`;
				utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully inserted'}));
			})
		}
    };
};