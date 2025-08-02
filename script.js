const upazilaRadios = document.getElementById('upazila-radios');
const unionSelect = document.getElementById('union-select');
const fsSelect = document.getElementById('fs-select');
const shgSelect = document.getElementById('shg-select');

let data = [];

window.addEventListener('DOMContentLoaded', () => {
  fetch('SHG Meeting Plan.csv')
    .then(response => response.text())
    .then(csvData => {
      data = parseCSV(csvData);
      populateUpazilas();
    });
});

function parseCSV(csvData) {
  const lines = csvData.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentline = lines[i].split(',');
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j] ? currentline[j].trim() : '';
    }
    result.push(obj);
  }
  return result;
}

function populateUpazilas() {
  upazilaRadios.innerHTML = '';
  const upazilas = [...new Set(data.map(item => item['Upazila']))];
  upazilas.forEach(upazila => {
    const div = document.createElement('div');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'upazila';
    radio.value = upazila;
    radio.id = `upazila-${upazila}`;
    const label = document.createElement('label');
    label.htmlFor = `upazila-${upazila}`;
    label.textContent = upazila;
    div.appendChild(radio);
    div.appendChild(label);
    upazilaRadios.appendChild(div);
  });
}

upazilaRadios.addEventListener('change', (e) => {
  const selectedUpazila = e.target.value;

  unionSelect.disabled = false;
  unionSelect.innerHTML = '<option value="">-- Select Union --</option>';
  const unions = [...new Set(data.filter(item => item['Upazila'] === selectedUpazila).map(item => item['Union']))];
  unions.forEach(union => {
    const option = document.createElement('option');
    option.value = union;
    option.textContent = union;
    unionSelect.appendChild(option);
  });

  fsRadios.innerHTML = '';
  shgSelect.disabled = true;
  shgSelect.innerHTML = '<option value="">-- Select SHG --</option>';
});

unionSelect.addEventListener('change', (e) => {
  const selectedUnion = e.target.value;
  const selectedUpazila = document.querySelector('input[name="upazila"]:checked').value;

  fsSelect.disabled = false;
  fsSelect.innerHTML = '<option value="">-- Select Responsible FS --</option>';
  const fses = [...new Set(data.filter(item => item['Upazila'] === selectedUpazila && item['Union'] === selectedUnion).map(item => item['Respective FS']))];
  fses.forEach(fs => {
    const option = document.createElement('option');
    option.value = fs;
    option.textContent = fs;
    fsSelect.appendChild(option);
  });

  shgSelect.disabled = true;
  shgSelect.innerHTML = '<option value="">-- Select SHG --</option>';
});

fsSelect.addEventListener('change', (e) => {
  const selectedFs = e.target.value;
  const selectedUpazila = document.querySelector('input[name="upazila"]:checked').value;
  const selectedUnion = unionSelect.value;

  // Enable and populate SHG select
  shgSelect.disabled = false;
  shgSelect.innerHTML = '<option value="">-- Select SHG --</option>';
  const shgs = [...new Set(data.filter(item => item['Upazila'] === selectedUpazila && item['Union'] === selectedUnion && item['Respective FS'] === selectedFs).map(item => item['SHG Name']))];
  shgs.forEach(shg => {
    const option = document.createElement('option');
    option.value = shg;
    option.textContent = shg;
    shgSelect.appendChild(option);
  });
});

shgSelect.addEventListener('change', (e) => {
  const selectedShg = e.target.value;
  const selectedUpazila = document.querySelector('input[name="upazila"]:checked').value;
  const selectedUnion = unionSelect.value;
  const selectedFs = fsSelect.value;

  const tallyFormContainer = document.getElementById('tally-form-container');
  const tallyIframe = document.getElementById('tally-iframe');

  const baseUrl = 'https://tally.so/r/mOMWLk';
  const params = {
    'Select Upazila': selectedUpazila,
    'Select Union': selectedUnion,
    'Responsible FS': selectedFs,
    'Select SHG': selectedShg
  };

  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  tallyIframe.src = `${baseUrl}?${queryString}`;
  tallyFormContainer.style.display = 'block';
});
