const MAX_PAGES = 5;
let currentPage = 1;
let pokemons = [];

const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty();

  let startPage = Math.max(currentPage - 2, 1);
  let endPage = Math.min(startPage + 4, numPages);

  if (endPage - startPage < 4) {
    startPage = Math.max(endPage - 4, 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    let buttonClass = i === currentPage ? 'btn-primary active' : 'btn-primary';
    $('#pagination').append(`
      <button class="btn ${buttonClass} page ml-1 numberedButtons" value="${i}">${i}</button>
    `);
  }

  // Add Next and Previous buttons
  $('#pagination').prepend(`
    <button class="btn btn-primary ml-1" id="prevButton">Previous</button>
  `);

  $('#pagination').append(`
    <button class="btn btn-primary ml-1" id="nextButton">Next</button>
  `);

  // Disable Next and Previous buttons if on first or last page
  if (currentPage === 1) {
    $('#prevButton').prop('disabled', true);
  } else if (currentPage === numPages) {
    $('#nextButton').prop('disabled', true);
  }
};


const paginate = async () => {
  const pageSize = 10;
  const selectedPokemons = pokemons.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  $('#pokeCards').empty();
  for (const pokemon of selectedPokemons) {
    const res = await axios.get(pokemon.url);
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}>
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
      </div>  
    `);
  }
};

const displayPokemonCount = (total, displayed) => {
  $('#pokemonCount').html(`Total Pokémon: ${total} | Displayed: ${displayed}`);
};

const setup = async () => {
  $('#pokeCards').empty();

  const response = await axios.get(
    'https://pokeapi.co/api/v2/pokemon?offset=0&limit=810'
  );
  pokemons = response.data.results;

  const numPages = Math.ceil(pokemons.length / 10);
  paginate();
  updatePaginationDiv(currentPage, numPages);
  displayPokemonCount(pokemons.length, 10);

  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName');
    const res = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
    );
    const types = res.data.types.map((type) => type.type.name);

    $('.modal-body').html(`
      <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
                <div>
                  <h3>Abilities</h3>
                  <ul>
                    ${res.data.abilities
                      .map((ability) => `<li>${ability.ability.name}</li>`)
                      .join('')}
                  </ul>
                </div>
        
                <div>
                  <h3>Stats</h3>
                  <ul>
                    ${res.data.stats
                      .map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`)
                      .join('')}
                  </ul>
                </div>
              </div>
        
              <h3>Types</h3>
              <ul>
                ${types.map((type) => `<li>${type}</li>`).join('')}
              </ul>
            `);
        
            $('.modal-title').html(`
            <h2>${res.data.name.toUpperCase()}</h2>
            <h5>${res.data.id}</h5>
          `);
        });
        
        $('body').on('click', '.numberedButtons', async function (e) {
          currentPage = Number(e.target.value);
          paginate();
          updatePaginationDiv(currentPage, numPages);
        });
        
        // Next button event listener
        $('body').on('click', '#nextButton', function () {
          if (currentPage < numPages) {
            currentPage++;
            paginate();
            updatePaginationDiv(currentPage, numPages);
            $('#prevButton').show(); // Show Previous button
          }
        
          if (currentPage === numPages) {
            $('#nextButton').hide(); // Hide Next button
          }
        });
        
        // Previous button event listener
        $('body').on('click', '#prevButton', function () {
          if (currentPage > 1) {
            currentPage--;
            paginate();
            updatePaginationDiv(currentPage, numPages);
            $('#nextButton').show(); // Show Next button
          }
        
          if (currentPage === 1) {
            $('#prevButton').hide(); // Hide Previous button
          }
        });
        
        };
        
        $(document).ready(setup);