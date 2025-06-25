/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import { useDebounce } from "react-use"
import { BeatLoader } from "react-spinners"
import Search from "./components/Search"
import MovieCard from "./components/MovieCard"
import { updateSearch } from "./appwrite"

const API_BASE_URL = "https://api.themoviedb.org/3"

const API_KEY = import.meta.env.VITE_TMDB_API_KEY

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

function App() {

  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [debounceSearch, setDebounceSearch] = useState('')

  useDebounce(() => {
    setDebounceSearch(searchTerm)
  }, 500, [searchTerm])

  const fetchMovies = async (query) => {
    setIsLoading(true)
    setErrorMessage("")
      try {
        const endPoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`
        const response = await fetch(endPoint, API_OPTIONS)

        if(!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json()

        if(data.Response === "false") {
          setErrorMessage(data.Error || "Error fetching movies. Please try again later.");
        }

        setMovieList(data.results || [])

        if(query && data.results.length > 0) {
          await updateSearch(query, data.results[0])
        }

      } catch (error) {
        console.error("Error fetching movies:", error);
        setErrorMessage("Error fetching movies. Please try again later.");
      } finally {
        setIsLoading(false)
      }
  }
  
  useEffect(() => {
    fetchMovies(debounceSearch);
  }, [debounceSearch]);
  

  return (
    <main>
      <div className='pattern'/>
      <div className='wrapper'>
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle</h1>

        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>

        <section className='all-movies'>
            <h2 className="mt-[40px]">All Movies</h2>
            
            {
              isLoading ? (
                <BeatLoader color="#fff" />
              ) : errorMessage ? (
                <p className="text-red-500">{errorMessage}</p>
              ) : (
                <ul>
                   {
                    movieList.map((movie) => (
                      <MovieCard key={movie.id} movie={movie}/>
                    ))
                   }
                </ul>
              )
            }
        </section>

      </div>
    </main>
  )
}

export default App
