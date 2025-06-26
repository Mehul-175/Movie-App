import { useState, useEffect } from "react"
import { useDebounce } from "react-use"
import { BeatLoader } from "react-spinners"
import Search from "./components/Search"
import MovieCard from "./components/MovieCard"
import { getTrendingMovies, updateSearch } from "./appwrite"

// const API_BASE_URL = "https://api.themoviedb.org/3"

// const API_KEY = import.meta.env.VITE_TMDB_API_KEY

// const API_OPTIONS = {
//   method: 'GET',
//   headers: {
//     accept: 'application/json',
//     Authorization: `Bearer ${API_KEY}`
//   }
// };

function App() {

  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [debounceSearch, setDebounceSearch] = useState('')
  const [trendingMovies, setTrendingMovie] = useState([])

  useDebounce(() => {
    setDebounceSearch(searchTerm)
  }, 500, [searchTerm])

 const fetchMovies = async (query) => {
  setIsLoading(true);
  setErrorMessage("");
  try {
    // Use your backend proxy API instead of TMDB directly
    const endPoint = query
      ? `/api/movieProxy?query=${encodeURIComponent(query)}`
      : `/api/movieProxy`;

    const response = await fetch(endPoint);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      setErrorMessage("No movies found. Please try another search.");
    }

    setMovieList(data.results || []);

    if (query && data.results.length > 0) {
      await updateSearch(query, data.results[0]);
    }

  } catch (error) {
    console.error("Error fetching movies:", error);
    setErrorMessage("Error fetching movies. Please try again later.");
  } finally {
    setIsLoading(false);
  }
};

 const loadTrendingMovies = async () => {
  try {
    const Movies = await getTrendingMovies();
    setTrendingMovie(Movies);
  } catch (error) {
    console.error("Error fetching trending movies:", error);
  }
 }

  
  useEffect(() => {
    fetchMovies(debounceSearch);
  }, [debounceSearch]);
  
   useEffect(() => {
    loadTrendingMovies();
   }, [])

  return (
    <main>
      <div className="pattern"/>

      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>

          {isLoading ? (
            <BeatLoader color="#fff" />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
