const tableBody = document.querySelector('#devices-body');
const form = document.querySelector('#device-form');
const message = document.querySelector('#message');

function ShowMessage(text) {
  message.textContent = text;
}

function AddDeviceRow(device) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><a href="/api/devices/${device._id}">${device.name}</a></td>
    <td>${device.room}</td>
    <td>${device.status}</td>
    <td>${device.battery}%</td>
  `;
  tableBody.appendChild(row);
}

async function LoadDevices() {
  tableBody.innerHTML = '';
  const response = await fetch('/api/devices');
  const devices = await response.json();
  devices.forEach(AddDeviceRow);
  ShowMessage(`Loaded ${devices.length} device(s).`);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const device = {
    name: formData.get('name'),
    room: formData.get('room'),
    status: formData.get('status'),
    battery: Number(formData.get('battery'))
  };

  const response = await fetch('/api/devices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(device)
  });

  if (!response.ok) {
    const error = await response.json();
    ShowMessage(error.error || 'Could not add device.');
    return;
  }

  form.reset();
  await LoadDevices();
});

LoadDevices().catch(error => ShowMessage(error.message));