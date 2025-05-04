// Get references
const placeTable = document.getElementById('placeTable').getElementsByTagName('tbody')[0];

// Load places from server
async function loadPlaces() {
  try {
    const response = await fetch('http://localhost:3000/places');
    const places = await response.json();

    placeTable.innerHTML = '';
    places.forEach(place => {
      const row = placeTable.insertRow();

      row.insertCell(0).innerText = place.name;
      row.insertCell(1).innerText = place.nearestmetro;
      row.insertCell(2).innerText = place.distancefrommetro;
      row.insertCell(3).innerText = place.pricerange;

      const linkCell = row.insertCell(4);
      const link = document.createElement('a');
      link.href = place.googlelink;
      link.target = '_blank';
      link.innerText = place.googlelink;
      linkCell.appendChild(link);

      const imageCell = row.insertCell(5);
      const image = document.createElement('a');
      image.href = place.image_url;
      image.target = '_blank';
      image.innerText = place.image_url;
      imageCell.appendChild(image);
    });
  } catch (err) {
    console.error('Failed to load places:', err);
  }
}

// Add place handler
document.getElementById('addPlaceForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  try {
    const res = await fetch('http://localhost:3000/places', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (res.ok) {
      alert('Place added successfully');
      form.reset();
      loadPlaces();
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (err) {
    console.error('Add failed:', err);
    alert('Server error while adding place.');
  }
});

// Update place handler
document.getElementById('updatePlaceForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData();

  formData.append('name', document.getElementById('updateName').value);
  formData.append('nearestmetro', document.getElementById('newnearestmetro').value);
  formData.append('distancefrommetro', document.getElementById('newdistancefrommetro').value);
  formData.append('pricerange', document.getElementById('newpricerange').value);
  formData.append('googlelink', document.getElementById('newgooglelink').value);

  const imageInput = document.getElementById('newimage');
  if (imageInput.files.length > 0) {
    formData.append('image', imageInput.files[0]);
  }

  try {
    const res = await fetch('http://localhost:3000/places', {
      method: 'PUT',
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      alert('Place updated successfully');
      form.reset();
      loadPlaces();
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (err) {
    console.error('Update failed:', err);
    alert('Server error while updating place.');
  }
});


// Delete place handler
document.getElementById('deletePlaceForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const name = document.getElementById('deleteName').value;

  try {
    const res = await fetch('http://localhost:3000/places', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    const msg = await res.text();
    if (res.ok) {
      alert(msg);
      e.target.reset();
      loadPlaces();
    } else {
      alert(`Error: ${msg}`);
    }
  } catch (err) {
    console.error('Delete failed:', err);
    alert('Server error while deleting place.');
  }
});

// Load places on page load
document.addEventListener('DOMContentLoaded', loadPlaces);
