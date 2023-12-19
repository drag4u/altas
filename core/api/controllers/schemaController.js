module.exports = (logger, database, utils) => {
    return {
        getSchema: async (req, res) => {
			const typeId = req.params.typeId;
			
			utils.ExecuteAction(res, `SELECT * from schema_values where type_id = ${typeId}`, rows => {
				res.status(200).json(rows);
			});
        },

		getSchemaData: async (req, res) => {
			const valueId = req.params.valueId;
			
			utils.ExecuteAction(res, `SELECT * from schema_data where schema_value_id = ${valueId}`, rows => {
				res.status(200).json(rows);
			});
		},

		createSchemaData: async (req, res) => {
			const valueId = req.params.valueId;
			const { placeholder, data } = req.body;
			let query = `INSERT INTO schema_data (schema_value_id, placeholder, data) VALUES (${valueId}, '${placeholder}', '${data}')`;
			
			utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully inserted'}));
        },

		deleteSchemaData: async (req, res) => {
			const dataId = req.params.dataId;
			let query = `DELETE FROM schema_data WHERE schema_data_id = ${dataId}`;
			utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully deleted'}));
		}
    };
};