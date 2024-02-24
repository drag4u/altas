// Global State
let typeToBeDeleted = null;
let matrixBeingEdited = null;
let typeMatrixData = null;
let matrixToBeDeleted = null;
let matrixToBeCopied = null;
let activeTypeData = null;
let activeSchemaValue = null;
let activeSchemaData = null;
let schemasTypeId = null;
let previousSchemaDataRowsPlaceholderValue = null;
let previousSchemaDataRowsDataValue = null;
let schemaDataIdBeingEdited = null;
let schemaFieldToBeDeleted = null;
let schemaDataBeingCopied = null;
let combinationDataToDelete = null;
let activeSchemaCombinations = null;
let activelyEditedCombination = null;
let cocActiveCombinations = null;

const API = new ApiController();

function escapeHtml(unsafe)
{
	const str = typeof unsafe === 'string' ? unsafe : unsafe.toString();
    return str
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
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

setTimeout(() => UpdateTypeTable(), 1);