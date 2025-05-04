document.addEventListener('DOMContentLoaded', async () => {
    const cardsContainer = document.getElementById('cards');
  
    try {
      const res = await fetch('http://localhost:3000/places');
      const places = await res.json();
  
      // Clear any existing cards
      cardsContainer.innerHTML = '';
  
      places.forEach(place => {
        const card = document.createElement('div');
        card.className = 'card';
  
        const imgLink = document.createElement('a');
        imgLink.href = place.image_url.startsWith('/Imgs') ? place.image_url : `Imgs/${place.image_url}`;
        imgLink.target = '_blank';

        const img = document.createElement('img');
        img.src = imgLink.href;
        img.alt = place.name;

        imgLink.appendChild(img);
        card.appendChild(imgLink);
  
        const title = document.createElement('h4');
        title.textContent = place.name;
        card.appendChild(title);
  
        const cost = document.createElement('p');
        cost.textContent = `Cost: ${place.pricerange}`;
        card.appendChild(cost);
  
        const metro = document.createElement('p');
        metro.textContent = `Metro: ${place.nearestmetro}`;
        card.appendChild(metro);
  
        const distance = document.createElement('p');
        distance.textContent = `Proximity: ${place.distancefrommetro}`;
        card.appendChild(distance);
  
        const link = document.createElement('a');
        link.href = place.googlelink;
        link.textContent = 'Google Link';
        link.target = '_blank';
        card.appendChild(link);
  
        cardsContainer.appendChild(card);
      });
  
    } catch (err) {
      console.error('Error loading cards:', err);
      cardsContainer.innerHTML = '<p>Error loading places. Please try again later.</p>';
    }
  });