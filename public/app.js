// Event listeners for button actions and field changes
document.getElementById('submit-btn').addEventListener('click', saveEntry);
document.getElementById('export-btn').addEventListener('click', exportCSV);
document.getElementById('final-test-result').addEventListener('change', toggleLinkageSection);
document.getElementById('first-response').addEventListener('change', toggleOraquickSDSection);

// Set the maximum date for the date-of-service field to today
function setMaxDate() {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("date-of-service").setAttribute("max", today);
}

window.addEventListener("DOMContentLoaded", () => {
    loadMetadata();
    setMaxDate();
});

function loadMetadata() {
    const metadata = JSON.parse(localStorage.getItem('metadata'));
    if (metadata) {
        document.getElementById('facility').value = metadata.facility;
        document.getElementById('provider-name').value = metadata.providerName;
        document.getElementById('provider-contact').value = metadata.providerContact;
        document.getElementById('metadata-section').style.display = 'none';
    }
}

// Validate contact number to allow only digits and spaces
function validateContactNumber() {
    const input = document.getElementById('provider-contact');
    input.value = input.value.replace(/[^0-9 ]/g, ''); // Allow only numbers and spaces
}

function nextSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => section.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

function previousSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => section.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

// Show linkage section only when final test result is New Positive
function toggleLinkageSection() {
    const finalTestResult = document.getElementById('final-test-result').value;
    document.getElementById('linkage-section').style.display = finalTestResult === 'New Positive' ? 'block' : 'none';
}

// Show or hide Oraquick and SD Bioline fields based on First Response
function toggleOraquickSDSection() {
    const firstResponse = document.getElementById('first-response').value;
    const oraquickSdSection = document.getElementById('oraquick-sd-section');
    
    // Display Oraquick and SD Bioline fields only for specific First Response values
    if (firstResponse === 'RI' || firstResponse === 'RII' || firstResponse === 'RI&RII') {
        oraquickSdSection.style.display = 'block';
        document.getElementById('oraquick').setAttribute('required', 'true');
        document.getElementById('sd-bioline').setAttribute('required', 'true');
    } else {
        oraquickSdSection.style.display = 'none';
        document.getElementById('oraquick').value = '';
        document.getElementById('sd-bioline').value = '';
        document.getElementById('oraquick').removeAttribute('required');
        document.getElementById('sd-bioline').removeAttribute('required');
    }
}

// Generate a unique linkage ID based on name, sex, date of service, and a random number
function generateLinkageID(name, sex, date) {
    const randomDigits = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
    const datePart = date.replace(/-/g, ''); // Remove dashes from date
    return `${name.slice(0, 2).toUpperCase()}${sex.charAt(0).toUpperCase()}${datePart}${randomDigits}`;
}

function saveEntry() {
    const serialNumber = parseInt(document.getElementById('serial-number').value);
    const dateOfService = document.getElementById('date-of-service').value;
    const age = parseInt(document.getElementById('age').value);
    const providerContact = document.getElementById('provider-contact');

    // Sequential validation of fields with alerts
    if (isNaN(serialNumber) || serialNumber < 1) {
        alert("Please enter a valid Serial Number (must be a positive integer).");
        document.getElementById('serial-number').focus();
        return;
    }

    if (!dateOfService || new Date(dateOfService) > new Date()) {
        alert("Please enter a valid Date of Service Delivery (cannot be a future date).");
        document.getElementById('date-of-service').focus();
        return;
    }

    if (!providerContact.checkValidity()) {
        alert("Please enter a valid Contact Number for the Provider (format: 024 344 7788).");
        providerContact.focus();
        return;
    }

    if (isNaN(age) || age < 1 || age > 150) {
        alert("Please enter a valid Age (between 1 and 150).");
        document.getElementById('age').focus();
        return;
    }

    // Retrieve existing entries or initialize an empty array
    let entries = JSON.parse(localStorage.getItem('entries')) || [];

    // Create new entry object
    const entry = {
        facility: document.getElementById('facility').value,
        providerName: document.getElementById('provider-name').value,
        providerContact: providerContact.value,
        serialNumber: serialNumber,
        dateOfService: dateOfService,
        clientName: document.getElementById('client-name').value,
        address: document.getElementById('address').value,
        age: age,
        sex: document.getElementById('sex').value,
        preTestInfo: document.getElementById('pre-test-info').value,
        testingPoint: document.getElementById('testing-point').value,
        typeOfClient: document.getElementById('type-of-client').value,
        firstResponse: document.getElementById('first-response').value,
        oraquick: document.getElementById('oraquick').value,
        sdBioline: document.getElementById('sd-bioline').value,
        finalTestResult: document.getElementById('final-test-result').value,
        postTestCounseling: document.getElementById('post-test-counseling').value,
        linkedToCare: document.getElementById('linked-to-care').value,
        folderNumber: document.getElementById('folder-number').value,
        comments: document.getElementById('comments').value,
    };

    // Add new entry to entries array and save to local storage
    entries.push(entry);
    localStorage.setItem('entries', JSON.stringify(entries));

    alert("Entry saved!");

    // Clear form fields for a new entry
    document.querySelectorAll('input, select, textarea').forEach(field => field.value = '');
    
    // Reset Oraquick and SD Bioline fields if necessary
    toggleOraquickSDSection();

    // Reset metadata fields if needed
    loadMetadata();

    // Return to the Testing section for the next entry
    nextSection('testing-section');
}

function exportCSV() {
    const entries = JSON.parse(localStorage.getItem('entries')) || [];
    if (entries.length === 0) {
        alert("No data to export");
        return;
    }

    // Generate CSV header from entry keys
    const headers = Object.keys(entries[0]);
    const csvContent = [headers.join(',')];

    // Generate rows for each entry
    entries.forEach(entry => {
        const row = headers.map(header => `"${entry[header] || ''}"`); // Handle missing fields gracefully
        csvContent.push(row.join(','));
    });

    // Create CSV file and download
    const csvData = new Blob([csvContent.join('\n')], { type: 'text/csv' });
    const csvUrl = URL.createObjectURL(csvData);
    const link = document.createElement('a');
    link.href = csvUrl;
    link.download = 'HIV_Testing_Register.csv';
    link.click();
}
