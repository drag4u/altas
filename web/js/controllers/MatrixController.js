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

function UpdateMatrixTable(typeId)
{
	const tBody = document.getElementById("matrixTable");
	tBody.innerHTML = "";
	$('#matrixTableWarning').html(`<div class="spinner-border text-secondary" role="status"></div>`);
	$('#matrixTableWarning').show();
	API.GetAllMatrices(typeId, response => {
		if (response.length == 0) {
			$('#matrixTableWarning').html("<h3>Sąrašas tuščias</h3>");
			$('#matrixTableWarning').show();
		} else {
			$('#matrixTableWarning').hide();
		}
		const rowData = OrderMatricData(response);
		typeMatrixData = rowData;

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
	
	const tds = []

	const table = document.createElement("table");
	for (let i = 0; i < rowAmount; i++) {
		tds.push([]);
		const tr = document.createElement("tr");
		for (let j = 0; j < columnAmount; j++) {
			tds[i][j] = document.createElement("td");
			tds[i][j].classList.add("matrixInput");
			tr.appendChild(tds[i][j]);
		}
		table.appendChild(tr);
	}

	matrixValues.forEach(row => {
		if (row.version_variant == versionVariant) {
			tds[row.row][row.column].innerHTML = row.value;
		}
	});

	// remove empty rows backwards
	for (let i = rowAmount - 1; i >= 0; i--) {
		let empty = true;
		for (let j = 0; j < columnAmount; j++) {
			if (tds[i][j].innerHTML != '') {
				empty = false;
				break;
			}
		}
		if (empty) {
			table.deleteRow(i);
		}
	}

	return table.outerHTML;
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