
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
			document.getElementById("newSchemaPlaceholder").focus();
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
			document.getElementById("newSchemaPlaceholder").focus();
		})
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

function SaveSchemaCombinationData(dataId){
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
				tr.appendChild(document.createElement("td")).innerHTML = escapeHtml(data.field_placeholder);
				tr.appendChild(document.createElement("td")).innerHTML = escapeHtml(data.field_name);
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