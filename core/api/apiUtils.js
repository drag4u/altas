class ApiUtils
{
	constructor(logger, database)
	{
		this.logger = logger;
		this.database = database;
	}

	ExecuteAction(res, query, successCallback)
	{
		this.logger.info("executing query: " + query);
		this.database.all(query, (err, rows) => {
			if (err)
			{
				this.logger.error("Getting database error: " + err);
				res.status(500).json({error: 'Database error'});
			} else {
				successCallback(rows);
			}
		});
	}

	UpdateTypeSchema(res, typeId, callback)
	{
		this.ExecuteAction(res, `SELECT * FROM schema_values WHERE type_id = ${typeId}`, schema_rows => {
			console.log("SCHEMA ROWS: ", schema_rows);
			this.ExecuteAction(res, `SELECT * from matrix where type_id = ${typeId}`, matrix_rows => {
				let query = `SELECT * FROM matrix_value WHERE matrix_id IN (`;
				matrix_rows.forEach(row => {
					query += `${row.matrix_id},`;
				});
				query = query.slice(0, -1);
				query += `);`;
				this.ExecuteAction(res, query, value_rows => {
					this.ExecuteAction(res, `SELECT * FROM type where type_id = ${typeId}`, typeData => {
						let schemaData = this.PrepareSchemaData(value_rows, typeData);
						schemaData = this.RemoveAlreadyExisting(schemaData, schema_rows);
						console.log("schema data: ", schemaData);

						var atLeastOneRowExists = false;
						let query = `INSERT INTO schema_values (type_id, version_variant, column, unique_matrix_value, nessesary) VALUES `;
						for (let i = 0; i < schemaData.versionMatrix.length; i++) {
							for (let j = 0; j < schemaData.versionMatrix[i].length; j++) {
								atLeastOneRowExists = true;
								const dataRow = schemaData.versionMatrix[i];
								query += `(${typeId}, 0, ${i}, "${dataRow[j]}", 1),`;
							}
						}
						for (let i = 0; i < schemaData.variantMatrix.length; i++) {
							for (let j = 0; j < schemaData.variantMatrix[i].length; j++) {
								atLeastOneRowExists = true;
								const dataRow = schemaData.variantMatrix[i];
								query += `(${typeId}, 1, ${i}, "${dataRow[j]}", 1),`;
							}
						}
						query = query.slice(0, -1);
						query += `;`;
						if (atLeastOneRowExists)
						{
							this.ExecuteAction(res, query, () => {
								callback()
							});
						} else {
							console.log('No new rows needed to be inserted int othe schema');
							callback();
						}
					});
				});
			});
		});
	}

	PrepareSchemaData(matrixData, activeTypeData)
	{
		console.log(matrixData);
		console.log(activeTypeData);
		const schemeData = {
			versionMatrix: [],
			variantMatrix: []
		};
		const versionColumns = activeTypeData[0].version_columns;
		const variantColumns = activeTypeData[0].variant_columns;
		for (let i = 0; i < versionColumns; i++) {
			schemeData.versionMatrix.push(this.GetRepeatingValues(matrixData, 0, i));
		}
		for (let i = 0; i < variantColumns; i++) {
			schemeData.variantMatrix.push(this.GetRepeatingValues(matrixData, 1, i));
		}
		console.log(schemeData);
		return schemeData;
	}

	GetRepeatingValues(matrixData, versionVariant, column)
	{
		const uniqueValues = [];
		for (let i = 0; i < matrixData.length; i++) {
			const row = matrixData[i];
			if (row.version_variant == versionVariant && row.column == column) {
				if (row.value != '' && uniqueValues.indexOf(row.value) == -1) {
					uniqueValues.push(row.value);
				}
			}
		}
		return uniqueValues;
	}

	RemoveAlreadyExisting(schemaData, schemaRows)
	{
		console.log(schemaData, schemaRows);

		const newSchemaData = {
			versionMatrix: Array.from(Array(schemaData.versionMatrix.length), () => new Array()),
			variantMatrix: Array.from(Array(schemaData.variantMatrix.length), () => new Array())
		};
		for (let i = 0; i < schemaData.versionMatrix.length; i++) {
			for (let j = 0; j < schemaData.versionMatrix[i].length; j++) {
				const value = schemaData.versionMatrix[i][j];
				if (!this.SchemaRowExists(schemaRows, 0, i, value)) {
					newSchemaData.versionMatrix[i].push(value);
				}
			}
		}
		for (let i = 0; i < schemaData.variantMatrix.length; i++) {
			for (let j = 0; j < schemaData.variantMatrix[i].length; j++) {
				const value = schemaData.variantMatrix[i][j];
				if (!this.SchemaRowExists(schemaRows, 1, i, value)) {
					newSchemaData.variantMatrix[i].push(value);
				}
			}
		}
		console.log("new schema data: ", newSchemaData);
		return newSchemaData;
	}

	SchemaRowExists(schemaRows, versionVariant, column, value)
	{
		for (let i = 0; i < schemaRows.length; i++) {
			const row = schemaRows[i];
			if (row.version_variant == versionVariant && row.column == column && row.unique_matrix_value == value) {
				return true;
			}
		}
		return false;
	}
}

module.exports = 
{
	ApiUtils
}