// Homepage interactions for filtering, saved trips and sample itinerary previews.
// Keep lightweight interactions local until booking and newsletter services are connected.
const toast = document.getElementById('toast');
let toastTimer;

// Show a brief, accessible confirmation after a user action.
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// Reapply all active filters whenever the search or saved-trip control changes.
let showSavedOnly = false;

function applyTripFilters() {
  const region = document.getElementById('destinationSelect').value;
  const season = document.getElementById('monthSelect').value;
  const style = document.getElementById('styleSelect').value;
  const cards = document.querySelectorAll('.tour-card');
  let visibleCount = 0;

  cards.forEach((card) => {
    const regions = card.dataset.region.split(',');
    const seasons = card.dataset.seasons.split(',');
    const styles = card.dataset.styles.split(',');
    const matchesRegion = region === 'all' || regions.includes(region);
    const matchesSeason = season === 'all' || seasons.includes(season);
    const matchesStyle = style === 'all' || styles.includes(style);
    const matchesSaved = !showSavedOnly || savedJourneys.has(card.dataset.itineraryId);
    const matchesSearch = matchesRegion && matchesSeason && matchesStyle && matchesSaved;

    card.hidden = !matchesSearch;
    if (matchesSearch) visibleCount += 1;
  });

  const emptyState = document.getElementById('noTrips');
  emptyState.hidden = visibleCount > 0;

  // Explain whether no results come from the current filters or an empty saved list.
  if (visibleCount === 0 && showSavedOnly && savedJourneys.size === 0) {
    emptyState.textContent = 'No saved journeys yet. Use the heart on a tour card to save one.';
  } else if (visibleCount === 0 && showSavedOnly) {
    emptyState.textContent = 'No saved journeys match these filters. Clear filters or switch off Saved trips.';
  } else if (visibleCount === 0) {
    emptyState.textContent = 'No journeys match these filters. Try a different destination, season or travel style.';
  }

  const resultCount = document.getElementById('tripResultCount');
  if (showSavedOnly) {
    const resultLabel = visibleCount === 1 ? 'journey' : 'journeys';
    resultCount.textContent = `Showing ${visibleCount} saved ${resultLabel}`;
  } else {
    resultCount.textContent = `Showing ${visibleCount} of ${cards.length} sample journeys`;
  }
}

document.getElementById('tripSearch').addEventListener('submit', (event) => {
  event.preventDefault();
  applyTripFilters();
  document.getElementById('tours').scrollIntoView({ behavior: 'smooth' });
});

// Update results as soon as a filter changes; submit remains available for keyboard and assistive-technology users.
document.querySelectorAll('#tripSearch select').forEach((select) => {
  select.addEventListener('change', applyTripFilters);
});

// Keep each preview clearly illustrative until real trip data is connected.
const sampleItineraries = {
  'savannah-safari': {
    destination: 'Kenya · Africa',
    title: 'Savannahs, safari & the Maasai Mara',
    duration: '10 days · Wildlife & nature',
    route: 'Nairobi → Maasai Mara → Lake Nakuru → Nairobi',
    stops: ['Arrive and settle in Nairobi', 'Explore the Maasai Mara with a local guide', 'Continue to the Rift Valley and Lake Nakuru', 'Return to Nairobi']
  },
  'japan-journey': {
    destination: 'Japan · Asia',
    title: 'A taste of Japan: Tokyo, Kyoto & Osaka',
    duration: '9 days · Culture & history',
    route: 'Tokyo → Kyoto → Osaka',
    stops: ['Discover Tokyo neighbourhoods and food markets', 'Travel to Kyoto for temples and traditional streets', 'Finish in Osaka with time to explore its food scene']
  },
  'italian-coast': {
    destination: 'Italy · Europe',
    title: 'Italian coastlines & timeless cities',
    duration: '9 days · Food & culture',
    route: 'Rome → Florence → Cinque Terre → Venice',
    stops: ['Begin among Rome’s historic landmarks', 'Explore Florence and its Renaissance heritage', 'Spend time along the Ligurian coast', 'End in Venice']
  },
  'peru-adventure': {
    destination: 'Peru · South America',
    title: 'Inca trails & the Sacred Valley',
    duration: '11 days · Nature & culture',
    route: 'Lima → Cusco → Sacred Valley → Machu Picchu',
    stops: ['Arrive in Lima and sample local cuisine', 'Explore Cusco and adjust to the altitude', 'Visit the Sacred Valley', 'Continue to Machu Picchu']
  }
};

// Populate the native dialog using text nodes from the selected sample route.
const itineraryDialog = document.getElementById('itineraryDialog');
document.querySelectorAll('.itinerary-trigger').forEach((button) => {
  button.addEventListener('click', () => {
    const itinerary = sampleItineraries[button.dataset.itineraryId];
    if (!itinerary) return;

    document.getElementById('itineraryDestination').textContent = itinerary.destination;
    document.getElementById('itineraryTitle').textContent = itinerary.title;
    document.getElementById('itineraryDuration').textContent = itinerary.duration;
    document.getElementById('itineraryRoute').textContent = itinerary.route;

    const stops = itinerary.stops.map((stop) => {
      const item = document.createElement('li');
      item.textContent = stop;
      return item;
    });
    document.getElementById('itineraryStops').replaceChildren(...stops);

    // Include the selected tour in the message opened by the visitor's mail app.
    const enquiryLink = document.getElementById('itineraryEnquiry');
    const enquiryDetails = new URLSearchParams({
      subject: `Enquiry about ${itinerary.title}`,
      body: [
        'Hello MAM Tours,',
        '',
        `I am interested in ${itinerary.title} (${itinerary.duration}).`,
        'Please share available dates, inclusions and current pricing.'
      ].join('\n')
    });
    enquiryLink.href = `mailto:hello@mamtours.com?${enquiryDetails.toString()}`;

    itineraryDialog.showModal();
  });
});

// Close with either button or by selecting the backdrop.
document.getElementById('closeItinerary').addEventListener('click', () => itineraryDialog.close());
document.getElementById('closeItineraryFooter').addEventListener('click', () => itineraryDialog.close());
itineraryDialog.addEventListener('click', (event) => {
  if (event.target === itineraryDialog) itineraryDialog.close();
});

// Restore saved journeys from this browser without sending data to a server.
const savedJourneysKey = 'mamTours.savedJourneys';

function readSavedJourneys() {
  try {
    const stored = JSON.parse(localStorage.getItem(savedJourneysKey) || '[]');
    return new Set(Array.isArray(stored) ? stored.filter((id) => typeof id === 'string') : []);
  } catch {
    return new Set();
  }
}

function writeSavedJourneys(savedJourneys) {
  try {
    localStorage.setItem(savedJourneysKey, JSON.stringify([...savedJourneys]));
    return true;
  } catch {
    return false;
  }
}

function setSavedState(button, isSaved) {
  button.textContent = isSaved ? '♥' : '♡';
  button.setAttribute('aria-pressed', String(isSaved));
  button.style.color = isSaved ? '#e45e57' : '#193932';
}

const savedJourneys = readSavedJourneys();
const savedTripsToggle = document.getElementById('savedTripsToggle');
const savedTripsCount = document.getElementById('savedTripsCount');

function updateSavedTripsControl() {
  savedTripsCount.textContent = String(savedJourneys.size);
  savedTripsToggle.setAttribute('aria-pressed', String(showSavedOnly));
}

updateSavedTripsControl();
applyTripFilters();

document.getElementById('clearTripSearch').addEventListener('click', () => {
  document.getElementById('tripSearch').reset();
  showSavedOnly = false;
  updateSavedTripsControl();
  applyTripFilters();
});

savedTripsToggle.addEventListener('click', () => {
  showSavedOnly = !showSavedOnly;
  updateSavedTripsControl();
  applyTripFilters();
});

document.querySelectorAll('.heart').forEach((button) => {
  const tourId = button.dataset.tourId;
  setSavedState(button, savedJourneys.has(tourId));

  button.addEventListener('click', () => {
    const shouldSave = !savedJourneys.has(tourId);
    if (shouldSave) {
      savedJourneys.add(tourId);
    } else {
      savedJourneys.delete(tourId);
    }

    setSavedState(button, shouldSave);
    updateSavedTripsControl();
    if (showSavedOnly) applyTripFilters();
    if (!writeSavedJourneys(savedJourneys)) {
      showToast('Browser storage is unavailable; this choice will not be remembered.');
      return;
    }
    showToast(shouldSave ? 'Journey saved for later' : 'Removed from saved journeys');
  });
});

// Newsletter feedback is local; this form does not store or send an address.
document.getElementById('newsletterForm').addEventListener('submit', (event) => {
  event.preventDefault();
  showToast('Thanks for your interest. Newsletter sign-up will be available soon.');
  event.target.reset();
});

// Keep the mobile menu state and its accessibility labels in sync.
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

function setMobileNavOpen(isOpen) {
  navLinks.classList.toggle('open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
}

menuToggle.addEventListener('click', () => {
  setMobileNavOpen(!navLinks.classList.contains('open'));
});

// Close the menu after navigation so it does not cover the destination section.
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMobileNavOpen(false));
});

// Escape closes the open menu and returns keyboard focus to its toggle.
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || !navLinks.classList.contains('open')) return;

  setMobileNavOpen(false);
  menuToggle.focus();
});

// Destination tiles preselect a region and run the same trip-search form.
document.querySelectorAll('.destination').forEach((link) => {
  link.addEventListener('click', () => {
    document.getElementById('destinationSelect').value = link.dataset.destination;
    document.querySelector('#tripSearch button').click();
  });
});
