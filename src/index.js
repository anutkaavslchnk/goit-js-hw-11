import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

let page = 1;
let inputValue = '';

refs.form.addEventListener('submit', handleSearch);
refs.loadMoreBtn.addEventListener('click', loadMoreImages);

async function handleSearch(event) {
  event.preventDefault();
  const { searchQuery } = event.currentTarget.elements;
  inputValue = searchQuery.value;

  try {
    clearGallery();
    page = 1;

    const { images, totalHits } = await fetchAndRenderImages(inputValue, page);

    if (!images || images.length === 0) {
      showInfoNotification('Sorry, there are no images matching your search query. Please try again.');
      return;
    }

    showInfoNotification(`Hooray! We found ${totalHits} images.`);

    setupLightbox();
    toggleLoadMoreButton(totalHits, images.length);
  } catch (error) {
    console.error('Error fetching images:', error);
    showErrorNotification('Oops! Something went wrong. Please try again.');
  }
}

async function loadMoreImages() {
  page++;
  const { images, totalHits } = await fetchAndRenderImages(inputValue, page);

  setupLightbox();
  toggleLoadMoreButton(totalHits, images.length);
}
let totalPages = 0;
async function fetchAndRenderImages(query, page) {
  const { images, totalHits, total } = await fetchImages(query, page);
  totalPages = total; // Set the value of totalPages
  renderImages(images);
  return { images, totalHits, total };
}



async function fetchImages(query, page) {
  const BASE_URL = 'https://pixabay.com/api/';
  const API_KEY = '39990980-f895d922cee723816e646b78f';

  const params = new URLSearchParams({
    key: API_KEY,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: 40,
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  const data = await response.json();

  if (data.hits) {
    return { images: data.hits, totalHits: data.totalHits };
  } else {
    return { images: [], totalHits: 0 };
  }
}

function renderImages(images) {
  const markup = images
    .map(
      (image) => `
     
        <div class="photo-card">
        <a href="${image.largeImageURL}" data-lightbox="gallery">
          <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
          </a>
          </div>
            <p class="info-item">
              <b>Likes:</b> ${image.likes}
            </p>
            <p class="info-item">
              <b>Views:</b> ${image.views}
            </p>
            <p class="info-item">
              <b>Comments:</b> ${image.comments}
            </p>
            <p class="info-item">
              <b>Downloads:</b> ${image.downloads}
            </p>
      
    
    `
    )
    .join('');

  refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function clearGallery() {
  refs.gallery.innerHTML = '';
}
let lightbox;
function setupLightbox() {
  if (lightbox) {
    lightbox.refresh(); 
  } else {
    lightbox = new SimpleLightbox('.gallery a', {});
  }
  
}

function toggleLoadMoreButton(totalHits, currentImagesCount) {
  const imagesPage = 40; 
  const totalPages = Math.ceil(totalHits / imagesPage);

  if (page >= totalPages) {
    refs.loadMoreBtn.style.display = 'none';
    showInfoNotification("You've reached the end of search results.");
  } else {
    refs.loadMoreBtn.style.display = 'block';
  }
}




function showInfoNotification(message) {
  Notiflix.Notify.info(message);
}

function showErrorNotification(message) {
  Notiflix.Notify.failure(message);
}
