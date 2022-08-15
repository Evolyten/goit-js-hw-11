import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import throttle from "lodash.throttle";

const refs = {
  galleryWrapEl: document.querySelector(".gallery"),
  userPick: document.querySelector("#search-form"),
  inputEl:document.querySelector('input'),
  searchBtnEL: document.querySelector(".search"),
  loadBtnEl: document.querySelector('.load-more')
}

function createOptions(request, counter) {
  return new URLSearchParams({
  key: '29134975-55176222cb40c79fbb9ec0121',
  q: request,
  image_type: "photo",
  safesearch: "true",
  page: counter,
  per_page:40
})
}

async function fetchPhoto(callback){
  const url = `https://pixabay.com/api/?${callback}`
  const fetchImg = await fetch(url)
  const k = await fetchImg.json()
  return k
}

const variables = {
  page: 1,
  totalCase: 0,
  functionCounter:1,
}

refs.searchBtnEL.addEventListener('click',pickThePhoto)
window.addEventListener('scroll',throttle(scrollAddItem,200))

function scrollAddItem() {
  const documentRect = document.documentElement.getBoundingClientRect()
  if (documentRect.bottom < document.documentElement.clientHeight + 150) {
    loadMore()  
    
  }

}

let gallery = new SimpleLightbox('.gallery a',{close:true})
gallery.on('show.simplelightbox', function () { });

async function loadMore() {
  variables.page += 1
  let k = createOptions(refs.inputEl.value,variables.page).toString()
  const UserChoice = await fetchPhoto(k)
  const l = await UserChoice.hits
  createGalleryMarkup(l)
  gallery.refresh()
   smothScroll(2)
  variables.totalCase += l.length
  if (UserChoice.totalHits <= variables.totalCase&&variables.functionCounter===1) {
    Notiflix.Notify.info(`We're sorry, but you've reached the end of search results.`);
    variables.functionCounter+=1
  }
}


async function pickThePhoto(e) {
  e.preventDefault()
  let userPick = refs.inputEl.value
  refs.galleryWrapEl.textContent = ""
  variables.functionCounter=1
  if (userPick == "") {
    return Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
  }
  variables.page=1
  let k = createOptions(userPick,variables.page).toString()
  const UserChoice = await fetchPhoto(k)
  const l = await UserChoice.hits
  if (l.length <1) {
    Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');

  } else {
    Notiflix.Notify.success(`Hooray! We found ${UserChoice.totalHits} images.`);
    variables.totalCase = l.length
    createGalleryMarkup(l)
    gallery.refresh()
    if (UserChoice.totalHits > variables.totalCase) {
       smothScroll(1)
    } else {
      Notiflix.Notify.info(`We're sorry, but you've reached the end of search results.`);
    }
    }
    
  }

function smothScroll(mulltiplie) {
  
  const { height: cardHeight } = document
  .querySelector(".gallery")
  .firstElementChild.getBoundingClientRect();

window.scrollBy({
  top: cardHeight * mulltiplie,
  behavior: "smooth",
});
}
function createGalleryMarkup(obj) {
  let k = obj.map(n =>`<div class="photo-card">
   <a href="${n.webformatURL}">
  <img src="${n.webformatURL}" alt="${n.tag}" loading="lazy" width="250" height="150"/>
   </a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${n.likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${n.views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${n.comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${n.downloads}
    </p>
  </div>
</div>`
  ).join("")
return refs.galleryWrapEl.insertAdjacentHTML("beforeend", k)
}


