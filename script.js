// Déclaration des constantes et variables globales
const apikey = "e9993a5d";
const url = `http://www.omdbapi.com/`;
const searchButton = document.getElementById('search-button');
const filtersDiv = document.getElementById('filters');
const filterNameButton = document.getElementById('filter-name');
const filterYearButton = document.getElementById('filter-year');
const searchInput = document.getElementById('search-text');
const moviesGrid = document.getElementById('movies-grid');
let lastQuery = {};

// Affiche le message de bienvenue et cache les filtres au chargement de la page
window.onload = function() {
   const welcome = document.getElementById('welcome');
   welcome.classList.remove('hidden');
   filtersDiv.classList.add('hidden');
};

// Gère le clic sur le bouton de recherche
// Input : searchTerm (string)
// Output : Affiche les résultats de recherche triés par nom
searchButton.onclick = async function() {
   e.preventDefault();
   const searchTerm = searchInput.value;
   if (searchTerm) {
       const welcome = document.getElementById('welcome');
       welcome.classList.add('hidden');
       filtersDiv.classList.remove('hidden');
       await getMovies(searchTerm);
       sortBy('Name');
   }
};

// Gère le clic sur le bouton de tri par nom
filterNameButton.onclick = async function() {
   e.preventDefault();
   filterNameButton.disabled = true;
   filterYearButton.disabled = false;
   await sortBy('Name');
};

// Gère le clic sur le bouton de tri par année
filterYearButton.onclick = async function() {
   e.preventDefault();
   filterYearButton.disabled = true;
   filterNameButton.disabled = false;
   await sortBy('Year');
};

// Récupère les films correspondant à la recherche par nom
// Input : search (string)
// Output : Tableau des résultats de recherche
function getMovies(search) {
   return fetch(`${url}?apikey=${apikey}&s=${search}`)
       .then(res => res.json())
       .then(data => {
           if (data.Response === "True") {
               lastQuery = data.Search;
               fillGrid(data.Search);
               return data.Search;
           } else {
               document.getElementById('movies-grid').innerHTML =
                   "<p>No movie found</p>";
               return [];
           }
       })
       .catch(error => {
           console.error('Error:', error);
           document.getElementById('movies-grid').innerHTML =
               "<p>An error has ocurred</p>";
           return {};
       });
}

// Récupère les détails d'un film à partir de son ID
// Input : ID du film (string)
// Output : Détails du film
function getMovieByID(id){
   return fetch(`${url}?apikey=${apikey}&i=${id}`).then(res => res.json()).then(data => {
       if (data.Response === "True") {
           return data;
       } else {
           throw new Error('Movie not found');
       }
   });
}

// Affiche la grille des résultats de recherche sur la page
// Input : Tableau des résultats de recherche
// Output : Mise à jour de l'affichage de la grille
function fillGrid(movies) {
   const movieDivs = movies.map(element => `
       <div class="movie-card" id="${element.imdbID}">
           <p>Loading...</p>
       </div>`
   ).join('');
   moviesGrid.innerHTML = movieDivs;
   movies.forEach(element => {
       fillGridDetails(element.imdbID);
   });
   return movies;
}

// Affiche les détails d'un film dans sa carte
// Input : ID du film (string)
// Output : Mise à jour de l'affichage de la carte du film
async function fillGridDetails(movieID){
   const movieCard = document.getElementById(movieID);
   movieCard.innerHTML = ''; // Vide la carte avant d'ajouter les détails
   const element = await getMovieByID(movieID);
   movieCard.innerHTML = `
       <div class="movie-card" id="${element.imdbID}">
           <a href="https://www.imdb.com/title/${element.imdbID}/" target="_blank">
               <img src="${element.Poster !== "N/A" ? element.Poster : './placeholder.jpg'}" alt="${element.Title}">
           </a>
           <h3 class="movie-info">${element.Title}</h3>
           <p class="movie-year">${element.Year}</p>
           <p class="movie-plot">${element.Plot}</p><br>
           <div>
               <p class="movie-rating">
                   <img src="./imdblogo.png" alt="IMDb Logo" style="width: 10%; height: 10%;"/>
                   IMDb Rating: ${element.Ratings.find(rating => rating.Source === "Internet Movie Database")?.Value || "N/A"}
               </p>
           </div>
       </div>
   `;
}

// Trie les résultats de recherche selon le critère spécifié
// Input : Critère de tri (string)
// Output : Mise à jour de l'affichage de la grille
async function sortBy(filter) {
   let sortedQuery = {};
   switch (filter) {
       case 'Name':
           sortedQuery = lastQuery.sort((a, b) => {
               if (a.Title < b.Title) {
                   return -1;
               }
               if (a.Title > b.Title) {
                   return 1;
               }
               return 0;
           });
           break;
       case 'Year':
           sortedQuery = lastQuery.sort((a, b) => {
               if (a.Year < b.Year) {
                   return -1;
               }
               if (a.Year > b.Year) {
                   return 1;
               }
               return 0;
           });
           break;
       case 'Rating':
           throw new Error('Not Yet Implemented');
   };
   await fillGrid(sortedQuery);
}