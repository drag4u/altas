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

const API = new ApiController();

// COMMANDS
function CreateType()
{
	const form = document.getElementById('typeForm');
	if (!form.checkValidity()) {
		event.preventDefault();
		event.stopPropagation();
		form.classList.add('was-validated');
		return;
	}
	
	const formData = new FormData();
	formData.append("cocFile", document.getElementById("cocFile").files[0]);
	formData.append("cnitFile", document.getElementById("cnitFile").files[0]);
	formData.append("code", document.getElementById("typeCode").value);
	formData.append("name", document.getElementById("typeName").value);
	formData.append("versionColumns", document.getElementById("versionColumnAmount").value);
	formData.append("versionRows", document.getElementById("versionRowAmount").value);
	formData.append("variantColumns", document.getElementById("variantColumnAmount").value);
	formData.append("variantRows", document.getElementById("variantRowAmount").value);

	API.CreateType(formData, () => {
		$('#createTypeModal').modal('hide');
		UpdateTypeTable();
	});
}

function EditType()
{
	const form = document.getElementById('editTypeForm');
	if (!form.checkValidity()) {
		event.preventDefault();
		event.stopPropagation();
		form.classList.add('was-validated');
		return;
	}
	const formData = new FormData();
	formData.append("editCocFile", document.getElementById("editCocFile").files[0]);
	formData.append("editCNITFile", document.getElementById("editCNITFile").files[0]);
	formData.append("name", document.getElementById("editTypeName").value);
	formData.append("code", document.getElementById("editTypeCode").value);

	API.EditType(activeTypeData[0].type_id, formData, () => {
		$('#editTypeModal').modal('hide');
		UpdateTypeTable();
	});
}

function DeleteType()
{
	API.DeleteType(typeToBeDeleted, () => {
		$('#deleteTypeModal').modal('hide');
		UpdateTypeTable();
	});
}

function CreateMatrix()
{
	// calls bootstrap to validate fields
	const form = document.getElementById('matrixForm');
	if (!form.checkValidity()) {
		event.preventDefault();
		event.stopPropagation();
		form.classList.add('was-validated');
		return;
	}
	API.CreateMatrix(activeTypeData[0].type_id, GetMatrixDataOnCreation(true), () => {
		$('#createMatrixModal').modal('hide');
		UpdateMatrixTable(activeTypeData[0].type_id);
	});
}

function EditMatrix()
{
	// calls bootstrap to validate fields
	const form = document.getElementById('editMatrixForm');
	if (!form.checkValidity()) {
		event.preventDefault();
		event.stopPropagation();
		form.classList.add('was-validated');
		return;
	}

	API.EditMatrix(matrixBeingEdited, GetMatrixDataOnCreation(false), () => {
		$('#editMatrixModal').modal('hide');
		UpdateMatrixTable(activeTypeData[0].type_id);
	});
}

function CopyMatrix()
{
	API.CopyMatrix(activeTypeData[0].type_id, matrixToBeCopied, () => {
		$('#copyMatrixModal').modal('hide');
		UpdateMatrixTable(activeTypeData[0].type_id);
	});
}

function DeleteMatrix()
{
	API.DeleteMatrix(matrixToBeDeleted, () => {
		$('#deleteMatrixModal').modal('hide');
		UpdateMatrixTable(activeTypeData[0].type_id);
	});
}

// PAGE MANAGEMENT
function ShowTypePage() {
	$('#matrixPage').hide();
	$('#schemaPage').hide();
	$('#typePage').show();
	UpdateTypeTable(); // Refresh the type table if needed
}

function UpdateTypeTable()
{
	API.GetAllTypes(response => {
		if (response.length == 0) {
			$('#typeTableWarning').show();
		} else {
			$('#typeTableWarning').hide();
		}
		const tBody = document.getElementById("typeTable");
		tBody.innerHTML = "";
		let typeIndex = 1;
		response.forEach(row => {
			const tr = document.createElement("tr");
			tr.appendChild(document.createElement("td")).innerText = typeIndex;
			tr.appendChild(document.createElement("td")).innerText = escapeHtml(row.type_name);
			tr.appendChild(document.createElement("td")).innerText = escapeHtml(row.type_code);
			tr.appendChild(document.createElement("td")).innerText = `${row.variant_columns}st. ${row.variant_rows}eil.`;
			tr.appendChild(document.createElement("td")).innerText = `${row.version_columns}st. ${row.version_rows}eil.`;
			let fileLink = document.createElement('a');
			fileLink.href = `http://${location.hostname}:3000/files/${row.coc_file}`;
			fileLink.textContent = row.coc_file;
			fileLink.target = '_blank';
			let fileLink2 = document.createElement('a');
			fileLink2.href = `http://${location.hostname}:3000/files/${row.cnit_file}`;
			fileLink2.textContent = row.cnit_file;
			fileLink2.target = '_blank';
			tr.appendChild(document.createElement("td")).append(fileLink);
			tr.appendChild(document.createElement("td")).append(fileLink2);
			tr.appendChild(document.createElement("td")).innerHTML = `
				<button type="button" class="btn btn-sm btn-primary" onclick="ShowMatrixPage(${row.type_id})">Matricos</button>
				<button type="button" class="btn btn-sm btn-primary" onclick="ShowSchemaPage(${row.type_id})"">Schema</button>
				<button type="button" class="btn btn-sm btn-warning" onclick="ShowTypeEditModal(${row.type_id})">Redaguoti</button>
				<button type="button" class="btn btn-sm btn-warning" onclick="ShowTypeCopyModal(${row.type_id})">Kopijuoti</button>
				<button type="button" class="btn btn-sm btn-danger" onClick="ShowTypeDeleteModal(this, ${row.type_id})">Ištrinti</button>
			`;
			tBody.appendChild(tr);
			typeIndex++;
		});
	});
}

function DeleteCoCFile()
{
	let typeId = activeTypeData[0].type_id;
	API.DeleteCoCFile(typeId, () => {
		$('#editCocFile').val('');
		ShowTypeEditModal(typeId, () => {});
	});
}

function DeleteCNITFile()
{
	let typeId = activeTypeData[0].type_id;
	API.DeleteCNITFile(typeId, () => {
		$('#editCNITFile').val('');
		ShowTypeEditModal(typeId, () => {});
	});
}

function ShowTypeEditModal(typeId, callback)
{
	API.GetType(typeId, typeData => {
		activeTypeData = typeData;
		$('#editTypeModal').modal('show');
		document.getElementById("editTypeName").value = typeData[0].type_name;
		document.getElementById("editTypeCode").value = typeData[0].type_code;
		document.getElementById("editCoCFileLabel").innerText = typeData[0].coc_file;
		document.getElementById("editCNITFileLabel").innerText = typeData[0].cnit_file;
		$('#CoCDeleteButton').attr('disabled', typeData[0].coc_file == null);
		$('#CNITDeleteButton').attr('disabled', typeData[0].cnit_file == null);
		$('#editTypeVersion').prop("checked", false);
		$('#editTypeVariant').prop("checked", false);
		ActivateTypeMatrixEditor(true);
		let varCol = activeTypeData[0].variant_columns;
		let varRow = activeTypeData[0].variant_rows;
		let verCol = activeTypeData[0].version_columns;
		let verRow = activeTypeData[0].version_rows;

		// this populates the versionMatrix with the correct amount of inputs
		let versionMatrix = document.getElementById("editTypeVersionMatrix");
		versionMatrix.innerHTML = "";
		for (let i = 0; i < verRow; i++) {
			let row = document.createElement("div");
			//row.classList.add("row");
			row.style.paddingBottom = "5px";
			row.style.width = ((verCol * 72) + 30) + "px";
			for (let j = 0; j < verCol; j++) {
				let input = document.createElement("input");
				input.style.width = "70px";
				input.style.marginRight = "2px";
				input.type = "text";
				input.disabled = true;
				input.style.display = "inline-block";
				input.style.border = "solid 1px #d0d0d0";
				input.style.borderRadius = "2px";
				$(input).attr("data-row", i);
				$(input).attr("data-col", j);
				row.appendChild(input);
			}
			versionMatrix.appendChild(row);
		}

		let variantMatrix = document.getElementById("editTypeVariantMatrix");
		variantMatrix.innerHTML = "";
		for (let i = 0; i < varRow; i++) {
			let row = document.createElement("div");
			row.style.paddingBottom = "5px";
			row.style.width = ((varCol * 72) + 30) + "px";
			for (let j = 0; j < varCol; j++) {
				let input = document.createElement("input");
				input.style.width = "70px";
				input.disabled = true;
				input.style.marginRight = "2px";
				input.type = "text";
				input.style.display = "inline-block";
				input.style.border = "solid 1px #d0d0d0";
				input.style.borderRadius = "2px";
				$(input).attr("data-row", i);
				$(input).attr("data-col", j);
				row.appendChild(input);
			}
			variantMatrix.appendChild(row);
		}

		API.GetAllMatrices(typeId, response =>
		{
			let orderedMatrices = OrderMatricData(response);
			const matrixIDs = Object.keys(orderedMatrices);
			if (matrixIDs.length > 0)
			{
				const firstMatrix = orderedMatrices[matrixIDs[0]];
				firstMatrix.forEach(row => {
					if (row.version_variant == 0) {
						$(`#editTypeVersionMatrix input[data-row=${row.row}][data-col=${row.column}]`).val(row.value);
					} else {
						$(`#editTypeVariantMatrix input[data-row=${row.row}][data-col=${row.column}]`).val(row.value);
					}
				});
			}
			callback?.();
		});
	});
}

function ShowEditSchemaModal(schemaId)
{
	activeSchemaValue = schemaId;
	UpdateSchemaDataTable(schemaId, () => {
		const schemaData = activeSchemaData.filter(c => c.schema_value_id == schemaId)[0];

		const name = `Schemos redagavimas: [${schemaData.version_variant == 0 ? 'Versijų' : 'Variantų'} matrica, ${schemaData.column + 1} stulpelis, "${schemaData.unique_matrix_value}" reikšmė]`;
		$('#editSchemaModal .modal-header .modal-title')[0].innerHTML = name;
		$('#editSchemaModal').modal('show');
		$('#schemaNessasaryCheckbox').off('change', SaveSchemaValueNecessity);
		$('#schemaNessasaryCheckbox').on('change', SaveSchemaValueNecessity);
		$('#schemaNessasaryCheckbox').prop('checked', schemaData.necessary == 0 );
	});
}

function SaveSchemaValueNecessity() {
	API.UpdateSchemaNecessity(activeSchemaValue, this.checked ? 0 : 1, () => {
		ShowSchemaPage(schemasTypeId);
	});
}

function UpdateSchemaDataTable(schemaId, callback)
{
	API.GetSchemaData(schemaId, response => {
		const tBody = document.getElementById("schemaEditTable");
		tBody.innerHTML = "";
		Object.keys(response).forEach( dataId => {
			const tr = document.createElement("tr");
			$(tr).attr("data-value-id", response[dataId].schema_data_id);
			tr.appendChild(document.createElement("td")).innerHTML = escapeHtml(response[dataId].placeholder);
			tr.appendChild(document.createElement("td")).innerHTML = escapeHtml(response[dataId].data);
			tr.appendChild(document.createElement("td")).innerHTML = `
				<div class="btn-group" role="group">
					<button type="button" class="btn btn-sm btn-warning" onClick="EditSchemaData(${response[dataId].schema_data_id})">Redaguoti</button>
					<button type="button" class="btn btn-sm btn-danger" onClick="DeleteSchemaData(${response[dataId].schema_data_id})">Ištrinti</button>
				</div>
			`;
			tBody.appendChild(tr);
		});
		callback();
		$('#editSchemaModal').modal('show');
	});
}

function DeleteSchemaData(dataId)
{
	API.DeleteSchemaData(dataId, () => {
		ShowSchemaPage(schemasTypeId);
		UpdateSchemaDataTable(activeSchemaValue, () => {});
	});

}

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

function EditSchemaData(dataId)
{
	if (schemaDataIdBeingEdited != null)
		CancelSchemaDataRow(schemaDataIdBeingEdited);
	schemaDataIdBeingEdited = dataId;
	const tds = $(`[data-value-id="${dataId}"] td`);
	const placeholder = tds[0].innerText;
	const data = tds[1].innerText;
	previousSchemaDataRowsPlaceholderValue = placeholder;
	previousSchemaDataRowsDataValue = data;
	const button1 = $(tds[2]).find('button')[0];
	const button2 = $(tds[2]).find('button')[1];
	tds[0].innerHTML = `
		<div class="form-floating">
			<input type="text" style="height: 30px; min-height: 38px; padding: 0px 0px 0px 10px;" class="form-control form-control-sm" id="editSchemaPlaceholder" value="${escapeHtml(placeholder)}" required>
		</div>
	`;
	tds[1].innerHTML = `
		<div class="form-floating">
			<input type="text" style="height: 30px; min-height: 38px; padding: 0px 0px 0px 10px;" class="form-control form-control-sm" id="editSchemaData" value="${escapeHtml(data)}" required>
		</div>
	`;
	button1.innerText = 'Išsaugoti';
	button2.innerText = 'Atšaukti';
	button1.classList.remove('btn-warning');
	button1.classList.add('btn-success');
	button1.attributes.onclick.value = `SaveSchemaDataRow(${dataId})`;
	button2.attributes.onclick.value = `CancelSchemaDataRow(${dataId})`;
}

function CancelSchemaDataRow(dataId)
{
	schemaDataIdBeingEdited = null;
	const tds = $(`[data-value-id="${dataId}"] td`);
	const button1 = $(tds[2]).find('button')[0];
	const button2 = $(tds[2]).find('button')[1];
	tds[0].innerHTML = previousSchemaDataRowsPlaceholderValue;
	tds[1].innerHTML = previousSchemaDataRowsDataValue;
	button1.innerText = 'Redaguoti';
	button2.innerText = 'Ištrinti';
	button1.classList.remove('btn-success');
	button1.classList.add('btn-warning');
	button1.attributes.onclick.value = `EditSchemaData(${dataId})`;
	button2.attributes.onclick.value = `DeleteSchemaData(${dataId})`;
}

function SaveSchemaDataRow(dataId)
{
	schemaDataIdBeingEdited = null;
	let abort = false;
	if ($('#editSchemaPlaceholder').val() == '')
	{
		abort = true;
		$('#editSchemaPlaceholder').removeClass('is-valid').addClass('is-invalid');
	} else {
		$('#editSchemaPlaceholder').removeClass('is-invalid').addClass('is-valid');
	}
	if ($('#editSchemaData').val() == '')
	{
		abort = true;
		$('#editSchemaData').removeClass('is-valid').addClass('is-invalid');
	} else {
		$('#editSchemaData').removeClass('is-invalid').addClass('is-valid');
	}
	if (abort)
		return;
	API.EditSchemaData(dataId, $('#editSchemaPlaceholder').val(), $('#editSchemaData').val(), () => {
		UpdateSchemaDataTable(activeSchemaValue, () => {
			$('#editSchemaPlaceholder').removeClass('is-valid').val('');
			$('#editSchemaData').removeClass('is-valid').val('');
		})
	});
}

function AddSchemaData()
{
	let abort = false;
	if ($('#newSchemaPlaceholder').val() == '')
	{
		abort = true;
		$('#newSchemaPlaceholder').removeClass('is-valid').addClass('is-invalid');
	} else {
		$('#newSchemaPlaceholder').removeClass('is-invalid').addClass('is-valid');
	}
	if ($('#newSchemaData').val() == '')
	{
		abort = true;
		$('#newSchemaData').removeClass('is-valid').addClass('is-invalid');
	} else {
		$('#newSchemaData').removeClass('is-invalid').addClass('is-valid');
	}
	if (abort)
		return;
	API.CreateSchemaData(activeSchemaValue, $('#newSchemaPlaceholder').val(), $('#newSchemaData').val(), () => {
		ShowSchemaPage(schemasTypeId);
		UpdateSchemaDataTable(activeSchemaValue, () => {
			$('#newSchemaPlaceholder').removeClass('is-valid').val('');
			$('#newSchemaData').removeClass('is-valid').val('');
		})
	});
}

function ShowTypeDeleteModal(target, id)
{
	target.parentNode.parentElement.classList.add("table-danger");
	setTimeout(() => target.parentNode.parentElement.classList.remove("table-danger"), 6000);
	typeToBeDeleted = id;
	$('#deleteTypeModal').modal('show');
}

function ShowTypeCopyModal(id)
{
	$('#typeCopySubmitButton').attr('onclick', `CopyType(${id})`);
	$('#copyTypeModal').modal('show');
}

function CopyType(id)
{
	API.CopyType(id, () => {
		$('#copyTypeModal').modal('hide');
		UpdateTypeTable();
	});
}

function ShowMatrixPage(typeId) {
	API.GetType(typeId, typeData => {
		matrixHeader = document.getElementById("matrixHeader");
		matrixHeader.innerText = `Tipo "${typeData[0].type_name}" matricų sąrašas`;
		activeTypeData = typeData;
		$('#typePage').hide();
		$('#matrixPage').show();
		UpdateMatrixTable(typeId);
	});
}

function ShowSchemaPage(typeId) {
	schemasTypeId = typeId;
	API.GetType(typeId, typeData => {
		matrixHeader = document.getElementById("schemaHeader");
		matrixHeader.innerText = `"${typeData[0].type_name}" schema:`;
		activeTypeData = typeData;
		$('#typePage').hide();
		$('#schemaPage').show();
		
		API.GetSchema(typeId, response => {
			activeSchemaData = response;
			$('#schemaVersionMatrixBody')[0].innerHTML = '';
			$('#schemaVariantMatrixBody')[0].innerHTML = '';
			$('#schemaVersionMatrixHead tr')[0].innerHTML = '';
			$('#schemaVariantMatrixHead tr')[0].innerHTML = '';


			for (let k = 0; k < activeTypeData[0].version_columns; k++) {
				$('#schemaVersionMatrixHead tr').append(`<th scope="col">${k + 1} st.</th>`);
			}
			
			for (let i = 0; i < GetAmountOfRowsToRender(response, 0); i++) {
				const row = document.createElement("tr");
				for (let j = 0; j < activeTypeData[0].version_columns; j++) {
					const cell = document.createElement("td");
					
					const columndata = response.filter(c => c.version_variant == 0 && c.column == j)[i];
					if (columndata != undefined)
					{
						const schemaId = columndata.schema_value_id;
						let dataClass = columndata.necessary ? 'btn-danger' : 'btn-success';
						API.GetSchemaData(schemaId, response => {
							if (response.length > 0)
								dataClass = 'btn-success';
							$(cell).find('button').removeClass('btn-secondary').addClass(dataClass);
						});
						cell.innerHTML = `
							<button type="button" class="btn btn-sm btn-secondary" style="width: 50px;" data-value-id="${schemaId}" onClick="ShowEditSchemaModal(${schemaId})">
								${columndata.unique_matrix_value}
							</button>
						`;
					}
					row.appendChild(cell);
				}
				$('#schemaVersionMatrixBody').append(row);
			}
			
			for (let k = 0; k < activeTypeData[0].variant_columns; k++) {
				$('#schemaVariantMatrixHead tr').append(`<th scope="col">${k + 1} st.</th>`);
			}
			
			for (let i = 0; i < GetAmountOfRowsToRender(response, 1); i++) {
				const row = document.createElement("tr");
				for (let j = 0; j < activeTypeData[0].variant_columns; j++) {
					const cell = document.createElement("td");
					
					const columndata = response.filter(c => c.version_variant == 1 && c.column == j)[i];
					if (columndata != undefined)
					{
						const schemaId = columndata.schema_value_id;
						let dataClass = columndata.necessary ? 'btn-danger' : 'btn-success';
						API.GetSchemaData(schemaId, response => {
							if (response.length > 0)
								dataClass = 'btn-success';
							$(cell).find('button').removeClass('btn-secondary').addClass(dataClass);
						});
						cell.innerHTML = `
							<button type="button" class="btn btn-sm btn-secondary" style="width: 50px;" data-value-id="${schemaId}" onClick="ShowEditSchemaModal(${schemaId})">
								${columndata.unique_matrix_value}
							</button>
						`;
					}
					row.appendChild(cell);
				}
				$('#schemaVariantMatrixBody').append(row);
			}
		});

		UpdateCombinationTable();
	});
	API.GetSchemaFields(typeId, response => {
		const tBody = document.getElementById("schemaFieldBody");
		tBody.innerHTML = "";
		Object.keys(response).forEach( fieldId => {
			const tr = document.createElement("tr");
			$(tr).attr("schema-field-data-id", response[fieldId].schema_field_id);
			tr.appendChild(document.createElement("td")).innerHTML = escapeHtml(response[fieldId].field_name);
			tr.appendChild(document.createElement("td")).innerHTML = escapeHtml(response[fieldId].field_placeholder);
			tr.appendChild(document.createElement("td")).innerHTML = `
				<button type="button" class="btn btn-sm btn-warning" onClick="ShowSchemaFieldEditModal(${response[fieldId].schema_field_id})">Redaguoti</button>
				<button type="button" class="btn btn-sm btn-danger" onClick="ShowSchemaFieldDeleteModal(this, ${response[fieldId].schema_field_id})">Ištrinti</button>
			`;
			tBody.appendChild(tr);
		});
	});
}

function ShowSchemaFieldDeleteModal(target, id)
{
	target.parentNode.parentElement.classList.add("table-danger");
	setTimeout(() => target.parentNode.parentElement.classList.remove("table-danger"), 6000);
	schemaFieldToBeDeleted = id;
	$('#deleteSchemaFieldModal').modal('show');
}

function DeleteSchemaField()
{
	API.DeleteSchemaField(schemaFieldToBeDeleted, () => {
		$('#deleteSchemaFieldModal').modal('hide');
		ShowSchemaPage(schemasTypeId);
	});
}

function GetAmountOfRowsToRender(data, versionVariant)
{
	let columnsAmount = {}
	const filteredData = data.filter(c => c.version_variant == versionVariant);
	filteredData.forEach(row => {
		if (Object.keys(columnsAmount).indexOf(row.column.toString()) == -1)
		{
			columnsAmount[row.column] = 1;
		} else {
			columnsAmount[row.column]++;
		}
	});
	let result = 0;
	Object.keys(columnsAmount).forEach(key => {
		if (columnsAmount[key] > result)
			result = columnsAmount[key];
	});
	return result;
}

function UpdateMatrixTable(typeId)
{
	API.GetAllMatrices(typeId, response => {
		if (response.length == 0) {
			$('#matrixTableWarning').show();
		} else {
			$('#matrixTableWarning').hide();
		}
		const rowData = OrderMatricData(response);
		typeMatrixData = rowData;

		const tBody = document.getElementById("matrixTable");
		tBody.innerHTML = "";
		let matrixIndex = 1;
		Object.keys(rowData).forEach( matrixId => {
			const tr = document.createElement("tr");
			tr.appendChild(document.createElement("td")).innerText = matrixIndex;
			tr.appendChild(document.createElement("td")).innerText = escapeHtml(activeTypeData[0].type_name);
			tr.appendChild(document.createElement("td")).innerHTML = CreateMatrixDivTable(rowData[matrixId], 1);
			tr.appendChild(document.createElement("td")).innerHTML = CreateMatrixDivTable(rowData[matrixId], 0);
			tr.appendChild(document.createElement("td")).innerText = GetCombinations(rowData[matrixId]);
			tr.appendChild(document.createElement("td")).innerHTML = `
				<div class="btn-group" role="group">
					<button type="button" class="btn btn-sm btn-success" onClick="ShowEditMatrixModal(${matrixId})">Redaguoti</button>
					<button type="button" class="btn btn-sm btn-warning" onClick="ShowMatrixCopyModal(this, ${matrixId})">Kopijuoti</button>
					<button type="button" class="btn btn-sm btn-danger" onClick="ShowMatrixDeleteModal(this, ${matrixId})">Ištrinti</button>
				</div>
			`;
			tBody.appendChild(tr);
			matrixIndex++;
		});
	});
}

function GetCombinations(matrixData)
{
	let totalAmount = 1;
	for(let i = 0; i < activeTypeData[0].version_columns; i++)
	{
		totalAmount *= matrixData.filter(c => c.version_variant == 0 && c.column == i && c.value != '').length;
	}
	for(let i = 0; i < activeTypeData[0].variant_columns; i++)
	{
		totalAmount *= matrixData.filter(c => c.version_variant == 1 && c.column == i && c.value != '').length;
	}
	return totalAmount;
}

function ShowSchemaFieldModal() {
	$('#createSchemaFieldsModal').modal('show');
}

function ShowSchemaCombinationModal() {
	$('#createSchemaCombinationModal').modal('show');
	API.GetSchema(activeTypeData[0].type_id, response => {
		$('#schemaCombinationVersionSelects').html('');
		for (let i = 0; i < activeTypeData[0].version_columns; i++) {
			let selectElement = document.createElement('select');
			$(selectElement).addClass('form-select').addClass('form-select-sm').addClass('customSelect').addClass('versionSelect' + i);
			$(selectElement).append(`<option value="-1">-</option>`);
			response.filter(c => c.version_variant == 0 && c.column == i).forEach(row => {
				$(selectElement).append(`<option value="${escapeHtml(row.schema_value_id)}">${escapeHtml(row.unique_matrix_value)}</option>`);
			});
			$('#schemaCombinationVersionSelects').append(selectElement);
		}
		$('#schemaCombinationVersionSelects').width(activeTypeData[0].version_columns * 94);

		$('#schemaCombinationVariantSelects').html('');
		for (let i = 0; i < activeTypeData[0].variant_columns; i++) {
			let selectElement = document.createElement('select');
			$(selectElement).addClass('form-select').addClass('form-select-sm').addClass('customSelect').addClass('variantSelect' + i);
			$(selectElement).append(`<option value="-1">-</option>`);
			response.filter(c => c.version_variant == 1 && c.column == i).forEach(row => {
				$(selectElement).append(`<option value="${escapeHtml(row.schema_value_id)}">${escapeHtml(row.unique_matrix_value)}</option>`);
			});
			$('#schemaCombinationVariantSelects').append(selectElement);
		}
		$('#schemaCombinationVariantSelects').width(activeTypeData[0].variant_columns * 94);
	});
}

function EditCombination(combinationId)
{
	activelyEditedCombination = combinationId;
	$('#editSchemaCombinationModal').modal('show');
	const combinationData = activeSchemaCombinations.filter(c => c.schema_combination_id == combinationId)[0];
	$('#schemaEditCombinationName').val(combinationData.combination_name);

	API.GetSchema(activeTypeData[0].type_id, response => {
		$('#editSchemaCombinationVersionSelects').html('');
		for (let i = 0; i < activeTypeData[0].version_columns; i++) {
			let selectElement = document.createElement('select');
			$(selectElement).addClass('form-select').addClass('form-select-sm').addClass('customSelect').addClass('versionSelect' + i);
			$(selectElement).append(`<option value="-1">-</option>`);
			response.filter(c => c.version_variant == 0 && c.column == i).forEach(row => {
				const combinationMatch = combinationData.sequence.filter(c => c.schema_value_id == row.schema_value_id);
				let option = document.createElement('option');
				
				if (combinationMatch.length > 0)
				{
					$(option).attr('selected','selected');
				}
				option.value = escapeHtml(row.schema_value_id);
				option.innerText = escapeHtml(row.unique_matrix_value);
				$(selectElement).append(option);
			});
			$('#editSchemaCombinationVersionSelects').append(selectElement);
		}
		$('#editSchemaCombinationVersionSelects').width(activeTypeData[0].version_columns * 94);

		$('#editSchemaCombinationVariantSelects').html('');
		for (let i = 0; i < activeTypeData[0].variant_columns; i++) {
			let selectElement = document.createElement('select');
			$(selectElement).addClass('form-select').addClass('form-select-sm').addClass('customSelect').addClass('variantSelect' + i);
			$(selectElement).append(`<option value="-1">-</option>`);
			response.filter(c => c.version_variant == 1 && c.column == i).forEach(row => {
				const combinationMatch = combinationData.sequence.filter(c => c.schema_value_id == row.schema_value_id);
				let option = document.createElement('option');
				
				if (combinationMatch.length > 0)
				{
					$(option).attr('selected','selected');
				}
				option.value = escapeHtml(row.schema_value_id);
				option.innerText = escapeHtml(row.unique_matrix_value);
				$(selectElement).append(option);
			});
			$('#editSchemaCombinationVariantSelects').append(selectElement);
		}
		$('#editSchemaCombinationVariantSelects').width(activeTypeData[0].variant_columns * 94);
	});
}

function EditSchemaCombination ()
{
	const form = document.getElementById('schemaCombinationEditingForm');
	if (!form.checkValidity()) {
		event.preventDefault();
		event.stopPropagation();
		form.classList.add('was-validated');
		return;
	}
	
	const name = $('#schemaEditCombinationName').val();

	const variantValues = $('#editSchemaCombinationVariantSelects select').toArray().map(c => c.value);
	const versionValues = $('#editSchemaCombinationVersionSelects select').toArray().map(c => c.value);

	// calculate how many values in variantValues are not '-1'
	const variantValuesAmount = variantValues.filter(c => c != '-1').length;
	const versionValuesAmount = versionValues.filter(c => c != '-1').length;
	
	if (variantValuesAmount + versionValuesAmount < 2)
	{
		$('#editCombinationError').show();
		$('#editCombinationError')[0].innerText = 'Klaida: Kombinacijos reikšmės turi būti pasirinktos bent iš dviejų stulpelių!';
		return;
	} else {
		$('#editCombinationError').hide();
	}
	// extract values from variantValues that are not "-1"
	const variantValuesFiltered = variantValues.filter(c => c != '-1');
	const versionValuesFiltered = versionValues.filter(c => c != '-1');
	// combine these into a single array
	const combinationValues = variantValuesFiltered.concat(versionValuesFiltered);

	API.EditSchemaCombination(activelyEditedCombination, { name, combinationValues }, response => {
		console.log(response);
		$('#editSchemaCombinationModal').modal('hide');
		UpdateCombinationTable();
	});
}

function CreateSchemaCombination()
{
	const form = document.getElementById('schemaCombinationCreationForm');
	if (!form.checkValidity()) {
		event.preventDefault();
		event.stopPropagation();
		form.classList.add('was-validated');
		return;
	}

	const name = $('#schemaNewCombinationName').val();

	const variantValues = $('#schemaCombinationVariantSelects select').toArray().map(c => c.value);
	const versionValues = $('#schemaCombinationVersionSelects select').toArray().map(c => c.value);

	// calculate how many values in variantValues are not '-1'
	const variantValuesAmount = variantValues.filter(c => c != '-1').length;
	const versionValuesAmount = versionValues.filter(c => c != '-1').length;
	
	if (variantValuesAmount + versionValuesAmount < 2)
	{
		$('#newCombinationError').show();
		$('#newCombinationError')[0].innerText = 'Klaida: Kombinacijos reikšmės turi būti pasirinktos bent iš dviejų stulpelių!';
		return;
	} else {
		$('#newCombinationError').hide();
	}
	// extract values from variantValues that are not "-1"
	const variantValuesFiltered = variantValues.filter(c => c != '-1');
	const versionValuesFiltered = versionValues.filter(c => c != '-1');
	// combine these into a single array
	const combinationValues = variantValuesFiltered.concat(versionValuesFiltered);

	API.CreateSchemaCombination(activeTypeData[0].type_id, { name, combinationValues }, response => {
		console.log(response);
		$('#createSchemaCombinationModal').modal('hide');
		UpdateCombinationTable();
	});
}

SaveSchemaCombinationData = (dataId) => {
	const form = document.getElementById('schemaCombinationDataEditForm');
	if (!form.checkValidity()) {
		event.preventDefault();
		event.stopPropagation();
		form.classList.add('was-validated');
		return;
	}
	const dataName = $('#schemaCombinationDataEditName').val();
	const dataPlaceholder = $('#schemaCombinationPlaceholderEdit').val();

	API.EditSchemaCombinationData(dataId, dataName, dataPlaceholder, () => {
		$('#editSchemaCombinationDataModal').modal('hide');
		UpdateCombinationTable();
	});
}

function UpdateCombinationTable()
{
	API.GetSchemaCombinations(activeTypeData[0].type_id, response => {
		activeSchemaCombinations = response;
		const tBody = document.getElementById("schemaCombinationsBody");
		tBody.innerHTML = "";
		response.forEach(combination => {
			console.log(combination);
			const tr = document.createElement("tr");
			$(tr).attr("combination-id", combination.schema_combination_id);
			$(tr).addClass("table-info");
			tr.appendChild(document.createElement("td")).innerHTML = escapeHtml(combination.combination_name);
			tr.appendChild(document.createElement("td"));
			tr.appendChild(document.createElement("td"));
			tr.appendChild(document.createElement("td")).innerHTML = `
				<div class="btn-group" role="group">
					<button type="button" class="btn btn-sm btn-success" onClick="AddDataToCombination(${combination.schema_combination_id})">Pridėti duomenis</button>
					<button type="button" class="btn btn-sm btn-warning" onClick="EditCombination(${combination.schema_combination_id})" >Redaguoti</button>
					<button type="button" class="btn btn-sm btn-warning" onClick="ShowCopyCombinationModal(${combination.schema_combination_id})">Kopijuoti</button>
					<button type="button" class="btn btn-sm btn-danger" onClick="ShowDeleteCombinationModal(${combination.schema_combination_id})">Ištrinti</button>
				</div>
			`;
			tBody.appendChild(tr);
			combination.data.forEach(data => {
				const tr = document.createElement("tr");
				$(tr).attr("data-value-id", data.schema_combination_data_id);
				tr.appendChild(document.createElement("td"));
				tr.appendChild(document.createElement("td")).innerHTML = escapeHtml(data.field_name);
				tr.appendChild(document.createElement("td")).innerHTML = escapeHtml(data.field_placeholder);
				tr.appendChild(document.createElement("td")).innerHTML = `
					<div class="btn-group" role="group">
						<button type="button" class="btn btn-sm btn-warning" onClick="EditSchemaCombinationData(${data.schema_combination_data_id})">Redaguoti</button>
						<button type="button" class="btn btn-sm btn-warning" onClick="CopySchemaCombinationData(${data.schema_combination_data_id})">Kopijuoti</button>
						<button type="button" class="btn btn-sm btn-danger" onClick="DeleteSchemaCombinationData(${data.schema_combination_data_id})">Ištrinti</button>
					</div>
				`;
				tBody.appendChild(tr);
			});
		});
	});
}

function ShowDeleteCombinationModal(combinationId)
{
	$('#deleteCombinationSubmit').attr('onclick', `DeleteCombination(${combinationId})`);
	$('#deleteCombinationModal').modal('show');
}

function ShowCopyCombinationModal(combinationId)
{
	$('#combinationCopySubmitButton').attr('onclick', `CopyCombination(${combinationId})`);
	$('#copyCombinationModal').modal('show');
}

function DeleteCombination(combinationId)
{
	API.DeleteSchemaCombination(combinationId, () => {
		$('#deleteCombinationModal').modal('hide');
		UpdateCombinationTable();
	});
}

function CopyCombination(combinationId)
{
	API.CopySchemaCombination(combinationId, () => {
		$('#copyCombinationModal').modal('hide');
		UpdateCombinationTable();
	});
}

function CopySchemaCombinationData(dataId)
{
	$('#combinationDataCopySubmitButton').attr('onclick', `CopyCombinationData(${dataId})`);
	$('#copyCombinationDataModal').modal('show');
}

function CopyCombinationData(dataId)
{
	API.CopySchemaCombinationData(dataId, () => {
		$('#copyCombinationDataModal').modal('hide');
		UpdateCombinationTable();
	});
}

function DeleteSchemaCombinationData(dataId)
{
	combinationDataToDelete = dataId;
	$('#deleteCombinationDataModal').modal('show');
}

function DeleteCombinationData()
{
	API.DeleteSchemaCombinationData(combinationDataToDelete, () => {
		$('#deleteCombinationDataModal').modal('hide');
		UpdateCombinationTable();
	});
}

function EditSchemaCombinationData(dataId)
{
	API.GetSchemaCombinationData(dataId, response => {
		console.log(response[0]);
		$('#schemaCombinationDataEditName').val(response[0].field_name);
		$('#schemaCombinationPlaceholderEdit').val(response[0].field_placeholder);
		$('#editSchemaCombinationDataSubmit').attr('onclick', `SaveSchemaCombinationData(${dataId})`);
		$('#editSchemaCombinationDataModal').modal('show');
	});
}

function ShowTypeDeleteModal(target, id)
{
	target.parentNode.parentElement.classList.add("table-danger");
	setTimeout(() => target.parentNode.parentElement.classList.remove("table-danger"), 6000);
	typeToBeDeleted = id;
	$('#deleteTypeModal').modal('show');
}

function AddDataToCombination(combinationId)
{
	$('#createSchemaCombinationDataSubmit').attr('onclick', `CreateSchemaCombinationData(${combinationId})`);
	$('#createSchemaCombinationDataModal').modal('show');
}

function CreateSchemaCombinationData(combinationId)
{
	const form = document.getElementById('schemaCombinationDataForm');
	if (!form.checkValidity()) {
		event.preventDefault();
		event.stopPropagation();
		form.classList.add('was-validated');
		return;
	}

	const dataName = $('#schemaCombinationDataName').val();
	const dataPlaceholder = $('#schemaCombinationPlaceholder').val();

	API.CreateSchemaCombinationData(combinationId, dataName, dataPlaceholder, () => {
		$('#createSchemaCombinationDataModal').modal('hide');
		UpdateCombinationTable();
	});
}

function ShowSchemaFieldEditModal(fieldId) {
	$('#editSchemaFieldsModal').modal('show');
	API.GetSchemaField(fieldId, response => {
		$('#schemaFieldEditName').val(response[0].field_name);
		$('#schemaFieldEditPlaceholder').val(response[0].field_placeholder);
	});
	$('#editSchemaFieldSubmit').attr('onclick', `EditSchemaField(${fieldId})`);
}

function EditSchemaField(fieldId) {
	// calls bootstrap to validate fields
	const form = document.getElementById('schemaFieldEditForm');
	if (!form.checkValidity()) {
		event.preventDefault();
		event.stopPropagation();
		form.classList.add('was-validated');
		return;
	}
	API.EditSchemaField(fieldId, $('#schemaFieldEditName').val(), $('#schemaFieldEditPlaceholder').val(), () => {
		$('#editSchemaFieldsModal').modal('hide');
		ShowSchemaPage(schemasTypeId);
	});
}

function ShowGenerateCoCModal()
{
	$('#cocGenerateModal').modal('show');
	API.GetAllTypes(response => {
		$('#cocTypeSelect').html('');
		response.forEach(type => {
			$('#cocTypeSelect').append(`<option value="${escapeHtml(type.type_id)}">${escapeHtml(type.type_name)}</option>`);
		});
		$('#cocTypeSelect').off('change').on('change', function() {
			API.GetSchemaFields(this.value, fields => {
				$('#cocCustomFieldHolder').html('');
				let index = 0;
				fields.forEach(field => {
					$('#cocCustomFieldHolder').append(`
						<div class="input-group mb-1">
							<span class="input-group-text" id="customFieldAddon${index}">${escapeHtml(field.field_name)}</span>
							<input type="text" class="form-control" id="customField${index}" aria-describedby="customFieldAddon${index}">
						</div>
					`);
					index++;
				});
			});
			API.GetType(this.value, typeData => {
				if (typeData[0].coc_file == null)
				{
					$('#CoCFileWarning').show();
					$('#cocGenerateButton').attr('disabled', true);
				} else {
					$('#CoCFileWarning').hide();
					$('#cocGenerateButton').attr('disabled', false );
				}
				API.GetSchema(this.value, response => {
					$('#cocVersionSelects').html('');
					for (let i = 0; i < typeData[0].version_columns; i++) {
						let selectElement = document.createElement('select');
						$(selectElement).addClass('form-select').addClass('form-select-sm').addClass('customSelect').addClass('versionSelect' + i);
						response.filter(c => c.version_variant == 0 && c.column == i).forEach(row => {
							$(selectElement).append(`<option value="${escapeHtml(row.schema_value_id)}">${escapeHtml(row.unique_matrix_value)}</option>`);
						});
						$('#cocVersionSelects').append(selectElement);
					}
					$('#cocVersionSelects').width(typeData[0].version_columns * 94);

					$('#cocVariantSelects').html('');
					for (let i = 0; i < typeData[0].variant_columns; i++) {
						let selectElement = document.createElement('select');
						$(selectElement).addClass('form-select').addClass('form-select-sm').addClass('customSelect').addClass('variantSelect' + i);
						response.filter(c => c.version_variant == 1 && c.column == i).forEach(row => {
							$(selectElement).append(`<option value="${escapeHtml(row.schema_value_id)}">${escapeHtml(row.unique_matrix_value)}</option>`);
						});
						$('#cocVariantSelects').append(selectElement);
					}
					$('#cocVariantSelects').width(typeData[0].variant_columns * 94);
				});
			});
		}).trigger('change');
	});
}

function ShowGenerateCNITModal()
{
	$('#cnitGenerateModal').modal('show');
	API.GetAllTypes(response => {
		$('#cnitTypeSelect').html('');
		response.forEach(type => {
			$('#cnitTypeSelect').append(`<option value="${escapeHtml(type.type_id)}">${escapeHtml(type.type_name)}</option>`);
		});
		$('#cnitTypeSelect').off('change').on('change', function() {
			API.GetType(this.value, typeData => {
				if (typeData[0].cnit_file == null)
				{
					$('#CNITFileWarning').show();
					$('#cnitGenerateButton').attr('disabled', true);
				} else {
					$('#CNITFileWarning').hide();
					$('#cnitGenerateButton').attr('disabled', true );
				}
			});
		}).trigger('change');
	});
}


function CreateSchemaField()
{
	const form = document.getElementById('schemaFieldForm');
	if (!form.checkValidity()) {
		event.preventDefault();
		event.stopPropagation();
		form.classList.add('was-validated');
		return;
	}
	API.CreateSchemaField(activeTypeData[0].type_id, $('#schemaFieldName').val(), $('#schemaFieldPlaceholder').val(), () => {
		$('#schemaFieldName').val('');
		$('#schemaFieldPlaceholder').val('');
		$('#createSchemaFieldsModal').modal('hide');
		ShowSchemaPage(activeTypeData[0].type_id);
	});
}

function ShowCreateMatrixModal() {
	$('#createMatrixModal').modal('show');
	let varCol = activeTypeData[0].variant_columns;
	let varRow = activeTypeData[0].variant_rows;
	let verCol = activeTypeData[0].version_columns;
	let verRow = activeTypeData[0].version_rows;

	// this populates the versionMatrix with the correct amount of inputs
	let versionMatrix = document.getElementById("versionMatrix");
	versionMatrix.innerHTML = "";
	for (let i = 0; i < verRow; i++) {
		let row = document.createElement("div");
		//row.classList.add("row");
		row.style.paddingBottom = "5px";
		row.style.width = ((verCol * 72) + 30) + "px";
		for (let j = 0; j < verCol; j++) {
			let input = document.createElement("input");
			if (i == 0) {
				input.required = true;
				input.classList.add("form-control");
				input.classList.add("form-control-sm");
				input.style.borderColor = "#767676";
			}
			input.style.width = "70px";
			input.style.marginRight = "2px";
			input.type = "text";
			input.style.display = "inline-block";
			$(input).attr("data-row", i);
			$(input).attr("data-col", j);
			row.appendChild(input);
		}
		versionMatrix.appendChild(row);
	}
	// this populates the versionMatrix with the correct amount of inputs
	let variantMatrix = document.getElementById("variantMatrix");
	variantMatrix.innerHTML = "";
	for (let i = 0; i < varRow; i++) {
		let row = document.createElement("div");
		//row.classList.add("row");
		row.style.paddingBottom = "5px";
		row.style.width = ((varCol * 72) + 30) + "px";
		for (let j = 0; j < varCol; j++) {
			let input = document.createElement("input");
			if (i == 0) {
				input.required = true;
				input.classList.add("form-control");
				input.classList.add("form-control-sm");
				input.style.borderColor = "#767676";
			}
			input.style.width = "70px";
			input.style.marginRight = "2px";
			input.type = "text";
			input.style.display = "inline-block";
			$(input).attr("data-row", i);
			$(input).attr("data-col", j);
			row.appendChild(input);
		}
		variantMatrix.appendChild(row);
	}
	AddArrowButtonSupport('#versionMatrix');
	AddArrowButtonSupport('#variantMatrix');

	$(`#versionMatrix input`).each((key, value) => {
		value.addEventListener('paste', handlePaste);
	});

	$(`#variantMatrix input`).each((key, value) => {
		value.addEventListener('paste', handlePaste);
	});
}

function ShowEditMatrixModal(id) {
	$('#editMatrixModal').modal('show');
	matrixBeingEdited = id;
	let varCol = activeTypeData[0].variant_columns;
	let varRow = activeTypeData[0].variant_rows;
	let verCol = activeTypeData[0].version_columns;
	let verRow = activeTypeData[0].version_rows;

	// this populates the versionMatrix with the correct amount of inputs
	let versionMatrix = document.getElementById("editVersionMatrix");
	versionMatrix.innerHTML = "";
	for (let i = 0; i < verRow; i++) {
		let row = document.createElement("div");
		//row.classList.add("row");
		row.style.paddingBottom = "5px";
		row.style.width = ((verCol * 72) + 30) + "px";
		for (let j = 0; j < verCol; j++) {
			let input = document.createElement("input");
			if (i == 0) {
				input.required = true;
				input.classList.add("form-control");
				input.classList.add("form-control-sm");
				input.style.borderColor = "#767676";
			}
			input.style.width = "70px";
			input.style.marginRight = "2px";
			input.type = "text";
			input.style.display = "inline-block";
			$(input).attr("data-row", i);
			$(input).attr("data-col", j);
			row.appendChild(input);
		}
		versionMatrix.appendChild(row);
	}
	let matrixData = typeMatrixData[id];
	matrixData.forEach(row => {
		if (row.version_variant == 0) {
			$(`#editVersionMatrix input[data-row=${row.row}][data-col=${row.column}]`).val(row.value);
		}
	});
	// this populates the versionMatrix with the correct amount of inputs
	let variantMatrix = document.getElementById("editVariantMatrix");
	variantMatrix.innerHTML = "";
	for (let i = 0; i < varRow; i++) {
		let row = document.createElement("div");
		//row.classList.add("row");
		row.style.paddingBottom = "5px";
		row.style.width = ((varCol * 72) + 30) + "px";
		for (let j = 0; j < varCol; j++) {
			let input = document.createElement("input");
			if (i == 0) {
				input.required = true;
				input.classList.add("form-control");
				input.classList.add("form-control-sm");
				input.style.borderColor = "#767676";
			}
			input.style.width = "70px";
			input.style.marginRight = "2px";
			input.type = "text";
			input.style.display = "inline-block";
			$(input).attr("data-row", i);
			$(input).attr("data-col", j);
			row.appendChild(input);
		}
		variantMatrix.appendChild(row);
	}
	matrixData.forEach(row => {
		if (row.version_variant == 1) {
			$(`#editVariantMatrix input[data-row=${row.row}][data-col=${row.column}]`).val(row.value);
		}
	});
	AddArrowButtonSupport('#editVersionMatrix');
	AddArrowButtonSupport('#editVariantMatrix');

	$(`#editVersionMatrix input`).each((key, value) => {
		value.addEventListener('paste', handlePaste);
	});

	$(`#editVariantMatrix input`).each((key, value) => {
		value.addEventListener('paste', handlePaste);
	});
}

function handlePaste(e) {
    e.preventDefault();

    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData('Text');

    Papa.parse(pastedData, {
        complete: function(results) {
            fillFormFields(e.target, results.data[0]);
        }
    });
}

function fillFormFields(startInput, data) {
	const inputs = $(startInput).parent().parent().find('input').toArray();
	let index = inputs.indexOf(startInput);
    data.forEach(cell => {
		if (inputs[index]) {
			inputs[index].value = cell;
			index++;
		}
	});
}

function AddArrowButtonSupport(id)
{
	document.querySelectorAll(id + ' input').forEach(input => {
		input.addEventListener('keydown', function(e) {
			const allowedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
			if (!allowedKeys.includes(e.key)) {
				return;
			}
	
			const currentRow = parseInt(this.getAttribute('data-row'));
			const currentCol = parseInt(this.getAttribute('data-col'));
			let newRow = currentRow, newCol = currentCol;
	
			switch (e.key) {
				case 'ArrowLeft':
					newCol = Math.max(currentCol - 1, 0);
					break;
				case 'ArrowRight':
					newCol = currentCol + 1;
					break;
				case 'ArrowUp':
					newRow = Math.max(currentRow - 1, 0);
					break;
				case 'ArrowDown':
					newRow = currentRow + 1;
					break;
			}
	
			const nextInput = document.querySelector(`${id} input[data-row="${newRow}"][data-col="${newCol}"]`);
			if (nextInput) {
				nextInput.focus();
			}
		});
	});
}

function ShowMatrixCopyModal(target, id)
{
	target.parentNode.parentElement.parentElement.classList.add("table-warning");
	setTimeout(() => target.parentNode.parentElement.parentElement.classList.remove("table-warning"), 6000);
	matrixToBeCopied = id;
	$('#copyMatrixModal').modal('show');
}

function ShowMatrixDeleteModal(target, id)
{
	target.parentNode.parentElement.parentElement.classList.add("table-danger");
	setTimeout(() => target.parentNode.parentElement.parentElement.classList.remove("table-danger"), 6000);
	matrixToBeDeleted = id;
	$('#deleteMatrixModal').modal('show');
}

// UTILS
function GetMatrixDataOnCreation(create)
{
	const data = [];
	let versionInputs = '';
	let variantInput = '';
	if (create)
	{
		versionInputs = '#versionMatrix input';
		variantInput = '#variantMatrix input';
	} else {
		versionInputs = '#editVersionMatrix input';
		variantInput = '#editVariantMatrix input';
	}
	$(versionInputs).each(function() {
		data.push({
			version_variant: 0,
			row: $(this).attr("data-row"),
			col: $(this).attr("data-col"),
			value: $(this).val()
		});
	});
	$(variantInput).each(function() {
		data.push({
			version_variant: 1,
			row: $(this).attr("data-row"),
			col: $(this).attr("data-col"),
			value: $(this).val()
		});
	});
	return data;
}

function CreateMatrixDivTable(matrixValues, versionVariant)
{
	const div = document.createElement("div");
	div.style.position = "relative";
	columnAmount = versionVariant == 0 ? activeTypeData[0].version_columns : activeTypeData[0].variant_columns;
	rowAmount = versionVariant == 0 ? activeTypeData[0].version_rows : activeTypeData[0].variant_rows;
	div.style.width = (40 * columnAmount)+ "px";
	div.style.height = (24 * rowAmount)+ "px";
	
	matrixValues.forEach(row => {
		if (row.version_variant == versionVariant) {
			let inputdiv = document.createElement("div");
			inputdiv.classList.add("matrixInput");
			inputdiv.innerHTML = row.value;
			inputdiv.style.position = "absolute";
			inputdiv.style.left = (40 * row.column) + "px";
			inputdiv.style.top = (20 * row.row) + "px";
			div.appendChild(inputdiv);
		}
	});
	return div.outerHTML;
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

function CopySchemaData()
{
	let rowArray = $('#schemaEditTable tr').toArray().map(value => {
		let children = $(value).find('td')
		return [children[0].innerHTML, children[1].innerHTML]
	});
	if (rowArray.length == 0)
	{
		alert('Nėra duomenų, kuriuos galima būtų nukopijuoti');
		return;
	}
	$('#SchemaDataPasteButton').attr('disabled', false);
	schemaDataBeingCopied = rowArray;
}

function PasteSchemaData()
{
	let amount = schemaDataBeingCopied.length;
	schemaDataBeingCopied.forEach(row => {
		API.CreateSchemaData(activeSchemaValue, row[0], row[1], () => {
			amount--;
			if (amount == 0)
			{
				ShowSchemaPage(schemasTypeId);
				UpdateSchemaDataTable(activeSchemaValue, () => {
					$('#newSchemaPlaceholder').removeClass('is-valid').val('');
					$('#newSchemaData').removeClass('is-valid').val('');
				});
			}
		});
	});
}

function CollectPlaceholderData(mainCallback)
{
	const typeId = $('#cocTypeSelect').val();
	let placeholderData = [];

	API.GetType(typeId, data => {
		let typeData = data[0];
		
		let variant = '';
		let version = '';
		$('#cocVariantSelects .customSelect option:selected').toArray().forEach(c => variant += $(c).text())
		$('#cocVersionSelects .customSelect option:selected').toArray().forEach(c => version += $(c).text())

		placeholderData.push({ placeholder: 'typeNumber', data: typeData.type_code});
		placeholderData.push({ placeholder: 'type', data: typeData.type_name})
		placeholderData.push({ placeholder: 'variant', data: variant});
		placeholderData.push({ placeholder: 'version', data: version})

		customInputFields = $('#cocCustomFieldHolder input')
		API.GetSchemaFields(typeId, data => {
			for(var i = 0; i != data.length; i++)
			{
				placeholderData.push({ placeholder: data[i].field_placeholder, data: customInputFields[i].value})
			}

			let variantValues = $('#cocVariantSelects .customSelect').toArray().map(c => c.value);
			let count = variantValues.length;
			let left = count;
			for (var i = 0; i != count; i++)
			{
				API.GetSchemaData(variantValues[i], data => {
					data.forEach(row => {
						placeholderData.push({ placeholder: row.placeholder, data: row.data})
					});
					left--;
					if (left == 0)
					{
						Continue();
					}
				});
			}
		})
	})

	function Continue()
	{
		let versionValues = $('#cocVersionSelects .customSelect').toArray().map(c => c.value);
		let count = versionValues.length;
		let left = count;
		for (var i = 0; i != count; i++)
		{
			API.GetSchemaData(versionValues[i], data => {
				data.forEach(row => {
					placeholderData.push({ placeholder: row.placeholder, data: row.data})
				});
				left--;
				if (left == 0)
				{
					ContinueFurther();
				}
			});
		}
	}

	function ContinueFurther()
	{
		console.log(placeholderData);
		API.GetSchemaCombinations(typeId, data => {
			let versionValues = $('#cocVersionSelects .customSelect').toArray().map(c => c.value);
			let variantValues = $('#cocVariantSelects .customSelect').toArray().map(c => c.value);
			data.forEach(combination => {
				let combinationMatch = combination.sequence.filter(c => versionValues.includes(c.schema_value_id.toString()) || variantValues.includes(c.schema_value_id.toString()));
				if (combinationMatch.length == combination.sequence.length)
				{
					combination.data.forEach(row => {
						placeholderData.push({ placeholder: row.field_placeholder, data: row.field_name})
					});
				}
			});
			mainCallback(placeholderData);
		});
	}
}

function GenerateCoC()
{
	const typeId = $('#cocTypeSelect').val();
	CollectPlaceholderData(placeholderData => {
		API.GenerateCoC(typeId, placeholderData, (response) => {
			if (response.error == undefined)
			{
				window.open("/files/" + response.fileName, "_blank");
			}
		});
	});
}

function CollectAndShowPlaceholderData()
{
	if ($('#dataCollapse').hasClass('show'))
	{
		$('#dataCollapseButton').click();
	} else {
		CollectPlaceholderData(placeholderData => {
			$('#placeholderDataPreview').html('');
			placeholderData.forEach(row => {
				// append table rows
				$('#placeholderDataPreview').append(`
					<tr>
						<td>${row.placeholder}</td>
						<td>$\{${row.placeholder}}</td>
						<td>${row.data}</td>
					</tr>
				`);
			});
			$('#dataCollapseButton').click();
		});
	}
}

UpdateTypeTable();