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
		}
    };
};