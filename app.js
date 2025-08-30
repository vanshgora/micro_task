const DB_NAME = "DELIVERY-DB";
const RELATION_NAME = "SHIPMENT-TABLE";
const BASE_URL = "http://api.login2explore.com:5577";
const TOKEN = "90934912|-31949249423183635|90959865";

const shipmentForm = document.getElementById('shipmentForm');
const shipmentNoInput = document.getElementById('shipmentNo');

const descriptionInput = document.getElementById('description');
const sourceInput = document.getElementById('source');
const destinationInput = document.getElementById('destination');
const shippingDateInput = document.getElementById('shippingDate');
const expectedDeliveryDateInput = document.getElementById('expectedDeliveryDate');
const saveBtn = document.getElementById('saveBtn');
const updateBtn = document.getElementById('updateBtn');
const resetBtn = document.getElementById('resetBtn');
const messageDiv = document.getElementById('message');

document.addEventListener('DOMContentLoaded', function () {
    shipmentNoInput.focus();
    disableFormFields();
});

function disableFormFields() {
    descriptionInput.disabled = true;
    sourceInput.disabled = true;
    destinationInput.disabled = true;
    shippingDateInput.disabled = true;
    expectedDeliveryDateInput.disabled = true;
    saveBtn.disabled = true;
    updateBtn.disabled = true;
    resetBtn.disabled = true;

    saveBtn.classList.add('opacity-50', 'cursor-not-allowed');
    updateBtn.classList.add('opacity-50', 'cursor-not-allowed');
    resetBtn.classList.add('opacity-50', 'cursor-not-allowed');
}

function enableFormFields() {
    descriptionInput.disabled = false;
    sourceInput.disabled = false;
    destinationInput.disabled = false;
    shippingDateInput.disabled = false;
    expectedDeliveryDateInput.disabled = false;
    resetBtn.disabled = false;
    resetBtn.classList.remove('opacity-50', 'cursor-not-allowed');
}

function showMessage(message, type = 'info') {
    messageDiv.textContent = message;
    messageDiv.className = 'mt-4 text-center font-medium p-2 rounded-md ';

    if (type === 'error') {
        messageDiv.classList.add('bg-red-100', 'text-red-700');
    } else if (type === 'success') {
        messageDiv.classList.add('bg-green-100', 'text-green-700');
    } else {
        messageDiv.classList.add('bg-blue-100', 'text-blue-700');
    }

    messageDiv.classList.remove('hidden');

    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 3000);
}

function validateForm() {
    const fields = [
        shipmentNoInput,
        descriptionInput,
        sourceInput,
        destinationInput,
        shippingDateInput,
        expectedDeliveryDateInput
    ];

    for (let field of fields) {
        if (!field.value.trim()) {
            showMessage(`Please fill in the ${field.labels[0].textContent}`, 'error');
            field.focus();
            return false;
        }
    }

    const shippingDate = new Date(shippingDateInput.value);
    const expectedDate = new Date(expectedDeliveryDateInput.value);

    if (expectedDate <= shippingDate) {
        showMessage('Expected delivery date must be after shipping date', 'error');
        expectedDeliveryDateInput.focus();
        return false;
    }

    return true;
}

async function checkRecordExists(shipmentNo) {
    try {
        const response = await fetch(`${BASE_URL}/api/irl`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "dbName": DB_NAME,
                "relationName": RELATION_NAME,
                "record": {
                    "shipmentNo": shipmentNo
                },
                "token": TOKEN
            })
        });

        const data = await response.json();
        return data.status === 200 && data.data !== null;
    } catch (error) {
        console.error('Error checking record:', error);
        showMessage('Error connecting to database', 'error');
        return false;
    }
}

async function getRecord(shipmentNo) {
    try {
        const response = await fetch(`${BASE_URL}/api/irl`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "dbName": DB_NAME,
                "relationName": RELATION_NAME,
                "record": {
                    "shipmentNo": shipmentNo
                },
                "token": TOKEN
            })
        });

        const data = await response.json();
        return data.status === 200 ? data.data : null;
    } catch (error) {
        console.error('Error fetching record:', error);
        showMessage('Error fetching data from database', 'error');
        return null;
    }
}

async function saveRecord(record) {
    try {
        const response = await fetch(`${BASE_URL}/api/iml`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "dbName": DB_NAME,
                "relationName": RELATION_NAME,
                "record": record,
                "token": TOKEN
            })
        });

        const data = await response.json();
        return data.status === 200;
    } catch (error) {
        console.error('Error saving record:', error);
        showMessage('Error saving data to database', 'error');
        return false;
    }
}

async function updateRecord(record) {
    try {
        const response = await fetch(`${BASE_URL}/api/irl/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "dbName": DB_NAME,
                "relationName": RELATION_NAME,
                "record": record,
                "token": TOKEN
            })
        });

        const data = await response.json();
        return data.status === 200;
    } catch (error) {
        console.error('Error updating record:', error);
        showMessage('Error updating data in database', 'error');
        return false;
    }
}

shipmentNoInput.addEventListener('blur', async function () {
    const shipmentNo = this.value.trim();

    if (!shipmentNo) {
        showMessage('Please enter a Shipment No.', 'error');
        return;
    }

    const exists = await checkRecordExists(shipmentNo);

    if (exists) {
        const record = await getRecord(shipmentNo);

        if (record) {
            shipmentNoInput.disabled = true;
            descriptionInput.value = record.description || '';
            sourceInput.value = record.source || '';
            destinationInput.value = record.destination || '';
            shippingDateInput.value = record.shippingDate || '';
            expectedDeliveryDateInput.value = record.expectedDeliveryDate || '';

            enableFormFields();
            updateBtn.disabled = false;
            updateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            descriptionInput.focus();

            showMessage('Record found. You can update the details.');
        }
    } else {
        enableFormFields();
        saveBtn.disabled = false;
        saveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        descriptionInput.focus();

        showMessage('New shipment. Please fill in the details.');
    }
});

saveBtn.addEventListener('click', async function () {
    if (!validateForm()) return;

    const record = {
        shipmentNo: shipmentNoInput.value.trim(),
        description: descriptionInput.value.trim(),
        source: sourceInput.value.trim(),
        destination: destinationInput.value.trim(),
        shippingDate: shippingDateInput.value,
        expectedDeliveryDate: expectedDeliveryDateInput.value
    };

    const success = await saveRecord(record);

    if (success) {
        showMessage('Shipment record saved successfully!', 'success');
        shipmentForm.reset();
        disableFormFields();
        shipmentNoInput.disabled = false;
        shipmentNoInput.focus();
    } else {
        showMessage('Failed to save shipment record', 'error');
    }
});
updateBtn.addEventListener('click', async function () {
    if (!validateForm()) return;

    const record = {
        shipmentNo: shipmentNoInput.value.trim(),
        description: descriptionInput.value.trim(),
        source: sourceInput.value.trim(),
        destination: destinationInput.value.trim(),
        shippingDate: shippingDateInput.value,
        expectedDeliveryDate: expectedDeliveryDateInput.value
    };

    const success = await updateRecord(record);

    if (success) {
        showMessage('Shipment record updated successfully!', 'success');
        shipmentForm.reset();
        disableFormFields();
        shipmentNoInput.disabled = false;
        shipmentNoInput.focus();
    } else {
        showMessage('Failed to update shipment record', 'error');
    }
});

resetBtn.addEventListener('click', function () {
    shipmentForm.reset();
    disableFormFields();
    shipmentNoInput.disabled = false;
    shipmentNoInput.focus();
    showMessage('Form has been reset');
});