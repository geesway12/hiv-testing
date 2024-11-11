// Event listeners for buttons and dropdowns
document.getElementById('submit-btn').addEventListener('click', saveEntry);
document.getElementById('export-btn').addEventListener('click', exportCSV);
document.getElementById('final-test-result').addEventListener('change', toggleLinkageSection);
document.getElementById('first-response').addEventListener('change', toggleOraquickSDSection);

// Set the maximum date for the date-of-service field to today
function setMaxDate() {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("date-of-service").setAttribute("max", today);
}

// Initialize the maximum date on page load
window.addEventListener("DOMContentLoaded", setMaxDate);

// Generate a unique ID based on the date of service and a random number
function generateUniqueId() {
    const dateOfService = document.getElementById('date-of-service').value.replace(/-/g, ''); // YYYYMMDD format
    const randomDigits = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
    return `${dateOfService}${randomDigits}`;
}

// Show or hide the Linkage section based on Final Test Result and First Response
function toggleLinkageSection() {
    const finalTestResult = document.getElementById('final-test-result').value;
    const firstResponse = document.getElementById('first-response').value;
    
    const linkageSection = document.getElementById('linkage-section');
    if ((firstResponse === 'RI' || firstResponse === 'RII' || firstResponse === 'RI&RII') &&
        (finalTestResult === 'New Positive' || finalTestResult === 'Known Positive' || finalTestResult === 'Inconclusive')) {
        linkageSection.style.display = 'block';
        document.getElementById('linked-to-care').setAttribute('required', 'true');
        document.getElementById('folder-number').setAttribute('required', 'true');
    } else {
        linkageSection.style.display = 'none';
        document.getElementById('linked-to-care').value = '';
        document.getElementById('folder-number').value = '';
        document.getElementById('linked-to-care').removeAttribute('required');
        document.getElementById('folder-number').removeAttribute('required');
    }
}

// Show or hide Oraquick and SD Bioline fields based on First Response
function toggleOraquickSDSection() {
    const firstResponse = document.getElementById('first-response').value;
    const oraquickSdSection = document.getElementById('oraquick-sd-section');
    
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

// Function to navigate to the next section
function nextSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => section.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

// Function to navigate to the previous section
function previousSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => section.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

// Save the current entry to local storage and reset form
function saveEntry() {
    const entry = {
        id: generateUniqueId(),
        serialNumber: document.getElementById('serial-number').value,
        dateOfService: document.getElementById('date-of-service').value,
        clientName: document.getElementById('client-name').value,
        address: document.getElementById('address').value,
        age: document.getElementById('age').value,
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

    let entries = JSON.parse(localStorage.getItem('entries')) || [];
    entries.push(entry);
    localStorage.setItem('entries', JSON.stringify(entries));

    alert("Entry saved!");

    // Reset form fields for the next entry
    resetForm();

    // Return to the first section for a new entry
    nextSection('block-1');
}

// Function to clear all form fields and reset any displayed sections
function resetForm() {
    document.querySelectorAll('input, select, textarea').forEach(field => field.value = '');

    // Set the date max value again after reset
    setMaxDate();

    // Hide all sections and display the first section
    document.querySelectorAll('.section').forEach(section => section.style.display = 'none');
    document.getElementById('block-1').style.display = 'block';

    // Reset required fields based on initial conditions
    document.getElementById('oraquick-sd-section').style.display = 'none';
    document.getElementById('linkage-section').style.display = 'none';
}

// Export the stored entries as a CSV file
function exportCSV() {
    const entries = JSON.parse(localStorage.getItem('entries')) || [];
    if (entries.length === 0) {
        alert("No data to export");
        return;
    }

    // Prompt for facility name for file naming
    const facility = prompt("Enter the facility name for export:");
    if (!facility) {
        alert("Export canceled. Facility name is required.");
        return;
    }

    // Generate CSV content
    const headers = Object.keys(entries[0]);
    const csvContent = [headers.join(',')];
    entries.forEach(entry => {
        const row = headers.map(header => `"${entry[header] || ''}"`);
        csvContent.push(row.join(','));
    });

    // Generate CSV filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = `HIV-testing_${facility}_${date}.csv`;

    // Create CSV file and download
    const csvData = new Blob([csvContent.join('\n')], { type: 'text/csv' });
    const csvUrl = URL.createObjectURL(csvData);
    const link = document.createElement('a');
    link.href = csvUrl;
    link.download = filename;
    link.click();
}
