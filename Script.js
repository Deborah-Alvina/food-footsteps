// Get a reference to the table body
const placeTable = document.getElementById('placeTable').getElementsByTagName('tbody')[0];

// Display places
async function loadPlaces() {
  const response = await fetch('http://localhost:3000/places');
  const places = await response.json();
  
  // Clear the table before inserting new rows
  placeTable.innerHTML = '';

  // Insert each place into the table name, nearestmetro, 
  // distancefrommetro, pricerange, googlelink, status
  places.forEach(place => {
    const newRow = placeTable.insertRow();
    newRow.insertCell(0).innerText = place.name;
    newRow.insertCell(1).innerText = place.nearestmetro;
    newRow.insertCell(2).innerText = place.distancefrommetro;
    newRow.insertCell(3).innerText = place.pricerange;
    newRow.insertCell(4).innerText = place.googlelink;
    newRow.insertCell(5).innerText = place.status;
  });
}

// Fetch and display places on page load
document.addEventListener('DOMContentLoaded', loadPlaces);

// Add place
document.getElementById('addPlaceForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const nearestmetro = document.getElementById('nearestmetro').value;
    const distancefrommetro = document.getElementById('distancefrommetro').value;
    const pricerange = document.getElementById('pricerange').value;
    const googlelink = document.getElementById('googlelink').value;
    const status = document.getElementById('status').value;

    try {
      const response = await fetch('http://localhost:3000/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, nearestmetro, distancefrommetro, pricerange, googlelink, status })
      });

      if (!response.ok) {
        // If the response is not OK, throw an error with the response text
        const errorText = await response.text();
        throw new Error(errorText);
      }

      // Parse the response JSON (if any)
      const data = await response.json();
      console.log('place added successfully', data);

      loadPlaces(); // Refresh the places table (assuming loadplaces is a function to update the display)
      this.reset(); // Reset the form after successful submission
      
    } catch (error) {
      console.error('Error adding place:', error);
      alert(error.message); // Show the error message to the user
    }
});

  

// Update place
document.getElementById('updatePlaceForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const name = document.getElementById('updateName').value;
  const nearestmetro = document.getElementById('newnearestmetro').value;
  const distancefrommetro = document.getElementById('newdistancefrommetro').value;
  const pricerange = document.getElementById('newpricerange').value;
  const googlelink = document.getElementById('newgooglelink').value;
  const status = document.getElementById('newstatus').value;

  try {
    const response = await fetch('http://localhost:3000/places', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, nearestmetro, distancefrommetro, pricerange, googlelink, status })
    });

    if (!response.ok) {
      // If the response is not ok (status code is not 2xx)
      throw new Error(`Failed to update place: ${response.statusText}`);
    }

    const data = await response.json(); // You can check the message from the server
    console.log(data.message); // Log the success message from the server

    loadPlaces(); // Refresh the place table with updated data
    this.reset(); // Reset the form fields

  } catch (error) {
    console.error('Error updating place:', error);
    // Optionally, show an error message to the user
    alert('An error occurred while updating the place. Please try again.');
  }
});


  

// Delete place
document.getElementById('deletePlaceForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  
  const name = document.getElementById('deleteName').value;
  
  // Send the DELETE request to remove a place
  await fetch('http://localhost:3000/places', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  
  // Refresh the table after deleting a place
  loadPlaces(); 
  
  this.reset(); // Clear the form
});

// Initial load of places
loadPlaces();
