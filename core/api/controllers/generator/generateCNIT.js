const fs = require('fs');
const path = require('path');
const XlsxTemplate = require('xlsx-template');

function GetAllCombinations(matrixRows, schemaValues, callback)
{
	const orderedData = OrderMatricData(matrixRows);
    ReplaceOrderedDataWithSchemaValues(orderedData, schemaValues);
    let allCombinations = [];
    Object.keys(orderedData).forEach(matrixId => allCombinations.push(...GenerateCombinations(orderedData[matrixId])));
    callback(allCombinations);
}

function OrderMatricData(matrixRows)
{
	const rowData = {};
	matrixRows.forEach(row => {
		if (Object.keys(rowData).indexOf(row.matrix_id + '') == -1) {
			rowData[row.matrix_id] = [];
		}
		rowData[row.matrix_id].push(row);
	});
	return rowData;
}

function ReplaceOrderedDataWithSchemaValues(orderedData, schemaValues)
{
    Object.keys(orderedData).forEach(matrixId => {
        orderedData[matrixId].forEach(row => {
            if (row.value != '')
            {
                const value = schemaValues.filter(schemaValue => {
                    if (
                        schemaValue.version_variant == row.version_variant && 
                        schemaValue.column == row.column &&
                        schemaValue.unique_matrix_value == row.value
                    ){
                        return true;
                    }
                    return false;
                })
                row.value = value[0].schema_value_id;
            }
        });
    });
}

function GenerateCombinations(matrixData) {
    // Determine the highest column index for versions and variants
    let maxVersionColumn = 0;
    let maxVariantColumn = 0;

    matrixData.forEach(item => {
        if (item.version_variant === 0) {
            maxVersionColumn = Math.max(maxVersionColumn, item.column);
        } else if (item.version_variant === 1) {
            maxVariantColumn = Math.max(maxVariantColumn, item.column);
        }
    });

    // Initialize arrays to hold values for each column
    let versionValues = Array.from({ length: maxVersionColumn + 1 }, () => new Set());
    let variantValues = Array.from({ length: maxVariantColumn + 1 }, () => new Set());

    // Populate the Sets with values from matrixData
    matrixData.forEach(item => {
        if (item.version_variant === 0 && item.value !== '') {
            versionValues[item.column].add(item.value);
        } else if (item.version_variant === 1 && item.value !== '') {
            variantValues[item.column].add(item.value);
        }
    });

    // Convert Sets to Arrays for easier manipulation
    versionValues = versionValues.map(set => Array.from(set));
    variantValues = variantValues.map(set => Array.from(set));

    // Generate all combinations for versions and variants
    const versionCombinations = GenerateAllCombinations(versionValues);
    const variantCombinations = GenerateAllCombinations(variantValues);

    // Combine version and variant combinations into the result array
    const result = variantCombinations.map(variantCombo => {
        return versionCombinations.map(versionCombo => ({
            variant: variantCombo,
            version: versionCombo
        }));
    }).flat();

    return result;
}

function GenerateAllCombinations(valuesArrays, index = 0, result = [], current = []) {
    if (index === valuesArrays.length) {
        result.push([...current]);
        return;
    }

    for (let value of valuesArrays[index]) {
        current[index] = value;
        GenerateAllCombinations(valuesArrays, index + 1, result, current);
    }

    if (index === 0) return result;
}

function FormPlaceholderData(allCombinations, schemaDataValues, combinationSequences, combinationData, typeData, schemaValues, callback) {
    const combinations = {};
    combinationSequences.forEach(sequence => {
        if (!combinations[sequence.schema_combination_id]) {
            combinations[sequence.schema_combination_id] = { sequence: [], data: [] };
        }
        combinations[sequence.schema_combination_id].sequence.push(sequence.schema_value_id);
    });
    combinationData.forEach(data => {
        combinations[data.schema_combination_id].data.push(data);
    });
    

    var allData = { altas: [] };
    allCombinations.forEach(combination => {
        const tableRow = {};
        combination.variant.forEach(variant => {
            schemaDataValues.filter(schemaValue => schemaValue.schema_value_id == variant).forEach(schemaValue => {
                tableRow[schemaValue.placeholder] = schemaValue.data;
            });
        });
        combination.version.forEach(version => {
            schemaDataValues.filter(schemaValue => schemaValue.schema_value_id == version).forEach(schemaValue => {
                tableRow[schemaValue.placeholder] = schemaValue.data;
            });
        });
        Object.keys(combinations).forEach(key => {
            combinationData = combinations[key];
            if (combinationData.sequence.every(value => combination.variant.includes(value) || combination.version.includes(value))) {
                combinationData.data.forEach(data => {
                    tableRow[data.field_placeholder] = data.field_name;
                });
            }
        });
        tableRow['type'] = typeData.type_name;
        tableRow['typeNumber'] = typeData.type_code;
        tableRow['variant'] = SchemaValuesToString(combination.variant, schemaValues);
        tableRow['version'] = SchemaValuesToString(combination.version, schemaValues);
        allData.altas.push(tableRow);
    });

    callback(allData);
}

function SchemaValuesToString(variant, schemaValues) {
    let variantString = '';
    variant.forEach(value => {
        schemaValue = schemaValues.filter(schemaValue => schemaValue.schema_value_id == value)[0];
        variantString += schemaValue.unique_matrix_value;
    });
    return variantString;
}

function ProceedWithCNIT(placeholderData, cnitFileName, res) {
    const content = fs.readFileSync(path.join('./data/files', cnitFileName), 'binary');
    const template = new XlsxTemplate(content);

    let sheetNumber = 1;
    try {
        while (true) {
            template.substitute(sheetNumber, placeholderData);
            sheetNumber++;
        }
    } catch (error) {
        // Assuming error is thrown when no more sheets are available
        console.log(`Processed ${sheetNumber - 1} sheets.`, error.message);
    }

    // Generate the final Excel file
    const data = template.generate({ type: 'nodebuffer' });
    const filename = saveFile(data, cnitFileName, 'xlsx');
    console.log(filename);
    res.status(200).json({ fileName: filename });
}

function saveFile(data, originalFileName, extension) {
    const hash = generateRandomString(5);
    const filename = `${originalFileName.slice(0, -5)}-${hash}.${extension}`;
    fs.writeFileSync(path.join('./data/files/temporary', filename), data);
    return filename;
}

function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

module.exports = async function (req, res, utils) {
	const { typeId } = req.params;
	utils.ExecuteAction(res, `SELECT * FROM type where type_id = ${utils.Esc(typeId)}`, async typeData => {
		const fileName = typeData[0].cnit_file;
		matrixValueQuery = `
			SELECT * FROM matrix_value 
			WHERE matrix_id IN (
				SELECT matrix_id from matrix where type_id = ${utils.Esc(typeId)}
			)
		`;
		utils.ExecuteAction(res, matrixValueQuery, matrixRows => {
			schemaValuesQuery = `
				select schema_value_id, placeholder, data 
				from schema_data where schema_value_id in (
					select schema_value_id from schema_values where type_id = ${utils.Esc(typeId)}
				) order by schema_value_id;
			`;
			utils.ExecuteAction(res, schemaValuesQuery, schemaDataValues => {
				schemaCombinationSequenceQuery = `
					select * from schema_combination_sequence 
					where schema_combination_id in (
						select schema_combination_id from schema_combination where type_id = ${utils.Esc(typeId)}
					);
				`;
				utils.ExecuteAction(res, schemaCombinationSequenceQuery, combinationSequences => {
					combinationDataQuery = `
						select schema_combination_id, field_name, field_placeholder from schema_combination_data
						where schema_combination_id in (
							select schema_combination_id from schema_combination where type_id = ${utils.Esc(typeId)}
						);
					`;
					utils.ExecuteAction(res, combinationDataQuery, combinationData => {
						schemaValuesQuery = `select * from schema_values where type_id = ${utils.Esc(typeId)}`;
						utils.ExecuteAction(res, schemaValuesQuery, schemaValues => {
							GetAllCombinations(matrixRows, schemaValues, allCombinations => {
								utils.logger.info('All combinations:', allCombinations.length);
								FormPlaceholderData(allCombinations, schemaDataValues, combinationSequences, combinationData, typeData[0], schemaValues, placeholderData => {
									ProceedWithCNIT(placeholderData, fileName, res);
								});
							});
						});
					});
				});
			});
		});
	});
}