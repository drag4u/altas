let typeToBeDeleted = null;
let matrixBeingEdited = null;
let typeMatrixData = null;
let matrixToBeDeleted = null;
let matrixToBeCopied = null;
let activeTypeData = null;
let activeSchemaValue = null;

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
	formData.append("name", document.getElementById("editTypeName").value);

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
		response.forEach(row => {
			const tr = document.createElement("tr");
			tr.appendChild(document.createElement("td")).innerText = row.type_id;
			tr.appendChild(document.createElement("td")).innerText = row.type_name;
			tr.appendChild(document.createElement("td")).innerText = `${row.version_columns}st. ${row.version_rows}eil.`;
			tr.appendChild(document.createElement("td")).innerText = `${row.variant_columns}st. ${row.variant_rows}eil.`;
			let fileLink = document.createElement('a');
			fileLink.href = `http://${location.hostname}:3000/files/${row.coc_file}`;
			fileLink.textContent = row.coc_file;
			fileLink.target = '_blank';
			tr.appendChild(document.createElement("td")).append(fileLink);
			tr.appendChild(document.createElement("td")).innerHTML = `
				<div class="btn-group" role="group">
					<button type="button" class="btn btn-sm btn-success" onclick="ShowMatrixPage(${row.type_id})">Matricos</button>
					<button type="button" class="btn btn-sm btn-primary" onclick="ShowSchemaPage(${row.type_id})"">Schema</button>
				</div>
				<div class="btn-group" role="group">
					<button type="button" class="btn btn-sm btn-warning" onclick="ShowTypeEditModal(${row.type_id})"">Redaguoti</button>
					<button type="button" class="btn btn-sm btn-secondary" disabled>Kopijuoti</button>
					<button type="button" class="btn btn-sm btn-danger" onClick="ShowTypeDeleteModal(this, ${row.type_id})">Ištrinti</button>
				</div>
			`;
			tBody.appendChild(tr);
		});
	});
}

function ShowTypeEditModal(typeId, callback)
{
	API.GetType(typeId, typeData => {
		activeTypeData = typeData;
		$('#editTypeModal').modal('show');
		document.getElementById("editTypeName").value = typeData[0].type_name;
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
		$('#editSchemaModal').modal('show');
	});
}

function UpdateSchemaDataTable(schemaId, callback)
{
	API.GetSchemaData(schemaId, response => {
		console.log('response');
		console.log(response);
		const tBody = document.getElementById("schemaEditTable");
		tBody.innerHTML = "";
		Object.keys(response).forEach( dataId => {
			const tr = document.createElement("tr");
			tr.appendChild(document.createElement("td")).innerHTML = response[dataId].placeholder;
			tr.appendChild(document.createElement("td")).innerHTML = response[dataId].data;
			tr.appendChild(document.createElement("td")).innerHTML = `
				<div class="btn-group" role="group">
					<button type="button" class="btn btn-sm btn-success" onClick="ShowEditMatrixModal(${dataId})">Redaguoti</button>
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
		UpdateSchemaDataTable(activeSchemaValue, () => {});
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
		UpdateSchemaDataTable(activeSchemaValue, () => {
			$('#newSchemaPlaceholder').removeClass('is-valid').val('');
			$('#newSchemaData').removeClass('is-valid').val('');
		})
	});
}

function ShowTypeDeleteModal(target, id)
{
	target.parentNode.parentElement.parentElement.classList.add("table-danger");
	setTimeout(() => target.parentNode.parentElement.parentElement.classList.remove("table-danger"), 6000);
	typeToBeDeleted = id;
	$('#deleteTypeModal').modal('show');
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
	API.GetType(typeId, typeData => {
		matrixHeader = document.getElementById("schemaHeader");
		matrixHeader.innerText = `"${typeData[0].type_name}" schema:`;
		activeTypeData = typeData;
		$('#typePage').hide();
		$('#schemaPage').show();
		
		API.GetSchema(typeId, response => {
			$('#schemaVersionMatrixBody')[0].innerHTML = '';
			$('#schemaVariantMatrixBody')[0].innerHTML = '';
			$('#schemaVersionMatrixHead tr')[0].innerHTML = '';
			$('#schemaVariantMatrixHead tr')[0].innerHTML = '';

			console.log(response);

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
						cell.innerHTML = `
							<button type="button" class="btn btn-sm btn-success" style="width: 50px;" data-value-id="${schemaId}" onClick="ShowEditSchemaModal(${schemaId})">
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
						cell.innerHTML = `
							<button type="button" class="btn btn-sm btn-success" style="width: 50px;" data-value-id="${schemaId}" onClick="ShowEditSchemaModal(${schemaId})">
								${columndata.unique_matrix_value}
							</button>
						`;
					}
					row.appendChild(cell);
				}
				$('#schemaVariantMatrixBody').append(row);
			}
		});
	});
}

function GetAmountOfRowsToRender(data, versionVariant)
{
	let max = 0;
	const filteredData = data.filter(c => c.version_variant == versionVariant);
	filteredData.forEach(row => {
		if (row.column > max)
		{
			max = row.column;
		}
	});
	return max + 1;
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
		Object.keys(rowData).forEach( matrixId => {
			const tr = document.createElement("tr");
			tr.appendChild(document.createElement("td")).innerText = matrixId;
			tr.appendChild(document.createElement("td")).innerHTML = CreateMatrixDivTable(rowData[matrixId], 0);
			tr.appendChild(document.createElement("td")).innerHTML = CreateMatrixDivTable(rowData[matrixId], 1);
			tr.appendChild(document.createElement("td")).innerText = 0;
			tr.appendChild(document.createElement("td")).innerHTML = `
				<div class="btn-group" role="group">
					<button type="button" class="btn btn-sm btn-success" onClick="ShowEditMatrixModal(${matrixId})">Redaguoti</button>
					<button type="button" class="btn btn-sm btn-warning" onClick="ShowMatrixCopyModal(this, ${matrixId})">Kopijuoti</button>
					<button type="button" class="btn btn-sm btn-danger" onClick="ShowMatrixDeleteModal(this, ${matrixId})">Ištrinti</button>
				</div>
			`;
			tBody.appendChild(tr);
		});
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
	
	console.log(matrixValues);
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

UpdateTypeTable();