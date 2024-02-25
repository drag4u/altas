const fs = require('fs');

class ApiUtils
{
	constructor(logger, database)
	{
		this.logger = logger;
		this.database = database;
	}
	
	Esc(input) {
		const str = typeof input === 'string' ? input : input.toString();
		return str
			.replace(/\\/g, "\\\\") // Escapes backslashes
			.replace(/'/g, "''");
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

	ExecuteMultiple(res, query, successCallback)
	{
		this.logger.info("executing query: " + query);
		this.database.exec(query, (err, rows) => {
			if (err)
			{
				this.logger.error("Getting database error: " + err);
				res.status(500).json({error: 'Database error'});
			} else {
				successCallback(rows);
			}
		});
	}

	DeleteFileIfNotUsed(res, fileName)
	{
		if (fileName == null)
			return;
		this.ExecuteAction(res, `SELECT * FROM type WHERE coc_file = '${this.Esc(fileName)}' OR cnit_file = '${this.Esc(fileName)}'`, rows => {
			if (rows.length == 0) {
				fs.unlink(`./data/files/${fileName}`, err => {
					if (err)
						this.logger.error("Error deleting file: " + err);
				});
			}
		});
	}

	UpdateTypeSchema(res, typeId, callback)
	{
		this.ExecuteAction(res, `SELECT * FROM schema_values WHERE type_id = ${this.Esc(typeId)}`, schema_rows => {
			console.log("SCHEMA ROWS: ", schema_rows);
			this.ExecuteAction(res, `SELECT * from matrix where type_id = ${this.Esc(typeId)}`, matrix_rows => {
				if (matrix_rows.length == 0) {
					this.ExecuteAction(res, `delete from schema_values where type_id = ${this.Esc(typeId)}`, () => {
						callback();
					});
				} else {
					let query = `SELECT * FROM matrix_value WHERE matrix_id IN (`;
					matrix_rows.forEach(row => {
						query += `${this.Esc(row.matrix_id)},`;
					});
					query = query.slice(0, -1);
					query += `);`;
					this.ExecuteAction(res, query, value_rows => {
						this.ExecuteAction(res, `SELECT * FROM type where type_id = ${this.Esc(typeId)}`, typeData => {
							let originalSchemaData = this.PrepareSchemaData(value_rows, typeData);
							let schemaData = this.RemoveAlreadyExisting(originalSchemaData, schema_rows);
							console.log("schema data: ", schemaData);

							var atLeastOneRowExists = false;
							let query = `INSERT INTO schema_values (type_id, version_variant, column, unique_matrix_value, necessary) VALUES `;
							for (let i = 0; i < schemaData.versionMatrix.length; i++) {
								for (let j = 0; j < schemaData.versionMatrix[i].length; j++) {
									atLeastOneRowExists = true;
									const dataRow = schemaData.versionMatrix[i];
									query += `(${this.Esc(typeId)}, 0, ${this.Esc(i)}, "${this.Esc(dataRow[j])}", 1),`;
								}
							}
							for (let i = 0; i < schemaData.variantMatrix.length; i++) {
								for (let j = 0; j < schemaData.variantMatrix[i].length; j++) {
									atLeastOneRowExists = true;
									const dataRow = schemaData.variantMatrix[i];
									query += `(${this.Esc(typeId)}, 1, ${this.Esc(i)}, "${this.Esc(dataRow[j])}", 1),`;
								}
							}
							query = query.slice(0, -1);
							query += `;`;

							let THIS = this;
							function Continue()
							{
								var toDelete = THIS.GetValueIdsToDelete(originalSchemaData, schema_rows);
								if (toDelete.length == 0){
									callback();
									return;
								}
								let deleteQuery = 'DELETE FROM schema_values WHERE schema_value_id IN (';
								toDelete.forEach(id => {
									deleteQuery += `${THIS.Esc(id)},`;
								});
								deleteQuery = deleteQuery.slice(0, -1);
								deleteQuery += `);`;
								THIS.ExecuteAction(res, deleteQuery, () => {
									callback();
								});
							}

							if (atLeastOneRowExists)
							{
								this.ExecuteAction(res, query, () => {
									Continue();
								});
							} else {
								console.log('No new rows needed to be inserted into the schema');
								Continue();
							}
						});
					});
				}
			});
		});
	}

	GetValueIdsToDelete(schemaData, schemaRows)
	{
		const idsToDelete = [];
		for (let i = 0; i < schemaRows.length; i++) {
			const row = schemaRows[i];
			if (row.version_variant == 0) {
				if (schemaData.versionMatrix[row.column].indexOf(row.unique_matrix_value) == -1) {
					idsToDelete.push(row.schema_value_id);
				}
			} else {
				if (schemaData.variantMatrix[row.column].indexOf(row.unique_matrix_value) == -1) {
					idsToDelete.push(row.schema_value_id);
				}
			}
		}
		return idsToDelete;
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

module.exports = ApiUtils;