import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// genre mapping object to display podcast shows genres
// this mapping will help with filtering
const genreMapping = {
  1: 'Personal Growth',
  2: 'Investigative Journalism',
  3: 'History',
  4: 'Comedy',
  5: 'Entertainment',
  6: 'Business',
  7: 'Fiction',
  8: 'News',
  9: 'Kids and Family'
};

//HomePage component
function HomePage() {
  const [previews, setPreviews] = useState([]);
  const [filteredPreviews, setFilteredPreviews] = useState([]);
  const [filterOption, setFilterOption] = useState("none");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("none");
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null); // Added error state
  const [showDetails, setShowDetails] = useState(false); // Added showDetails state
  const navigate = useNavigate();

  //fetching data from API
  useEffect(() => {
    setLoading(true); // Set loading to true before fetching data for loading state
    fetch("https://podcast-api.netlify.app/shows")
      .then((res) => res.json())
      .then((data) => {
        setPreviews(data);
        setFilteredPreviews(data);
        setLoading(false); // Set loading to false after data is fetched
        setShowDetails(data.length > 0); // Check if shows are available
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setError(error.message); // Set error message
        setLoading(false); // Set loading to false even if there's an error
      });
  }, []);



// useEffect hook runs the provided function after rendering, and only re-runs if dependencies change.
useEffect(() => {
  // Check if searchTerm is empty (after trimming) and selectedGenre is "none".
  if (searchTerm.trim() === "" && selectedGenre === "none") {
    // If both conditions are true, set filtered previews to the original previews array.
    setFilteredPreviews(previews);
  } else {
    // Otherwise, filter the previews based on searchTerm and selectedGenre.
    const searchResults = previews.filter(show => {
      // Check if the show's title matches the searchTerm (case insensitive).
      const matchesSearch = show.title.toLowerCase().includes(searchTerm.toLowerCase());
      // Check if the selected genre is "none" or the show's genres include the selected genre.
      const matchesGenre = selectedGenre === "none" || (show.genres && show.genres.includes(parseInt(selectedGenre)));
      // Return true if both conditions are met, thus including the show in the searchResults.
      return matchesSearch && matchesGenre;
    });
    // Update the filteredPreviews state with the search results.
    setFilteredPreviews(searchResults);
  }
// Dependencies array for useEffect, it will re-run the effect if any of these values change.
}, [searchTerm, selectedGenre, previews]);


  //same function in favourites to sort previews
  const sortPreviews = (previews) => {
    switch (filterOption) {
      case "titleAsc":
        return [...previews].sort((a, b) => a.title.localeCompare(b.title));
      case "titleDesc":
        return [...previews].sort((a, b) => b.title.localeCompare(a.title));
      case "dateAsc":
        return [...previews].sort((a, b) => new Date(a.updated) - new Date(b.updated));
      case "dateDesc":
        return [...previews].sort((a, b) => new Date(b.updated) - new Date(a.updated));
      default:
        return previews;
    }
  };

  const handleFavouritesClick = () => {
    navigate('/favorites');
  };

  // Navigate to details page where you will play the sound
  const handleMoreInfoClick = (showId) => {
    navigate(`/showdetails/${showId}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can add more logic here if needed
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!showDetails) {
    return <div>No shows available.</div>;
  }

  return (
    <main className="main-content">
      <div className="flex justify-between items-center mb-4">
        <div>
          <label htmlFor="filterOption" className="mr-2 font-semibold">Sort By:</label>
          <select
            id="filterOption"
            className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
          >
            <option value="none">None</option>
            <option value="titleAsc">Title A-Z</option>
            <option value="titleDesc">Title Z-A</option>
            <option value="dateAsc">Oldest First</option>
            <option value="dateDesc">Newest First</option>
          </select>
        </div>
        <div>
          <label htmlFor="genreFilter" className="mr-2 font-semibold">Filter By Genre:</label>
          <select
            id="genreFilter"
            className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="none">All Genres</option>
            {Object.entries(genreMapping).map(([id, title]) => (
              <option key={id} value={id}>{title}</option>
            ))}
          </select>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="w-full md:w-96 sm:w-80 px-4 py-2 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {sortPreviews(filteredPreviews).map((preview) => (
          <div key={preview.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4">
              <img className="w-full h-auto md:h-auto sm:h-auto object-cover rounded" src={preview.image} alt={preview.title} />
              <h3 className="text-xl font-semibold mt-2">{preview.title}</h3>
              <button 
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-4 mx-2 rounded" 
                onClick={() => handleMoreInfoClick(preview.id)}
              >
                More Info
              </button>
              <p className="text-gray-700">Seasons: {preview.seasons}</p>
              <p className="text-gray-700">Genres: {preview.genres && preview.genres.map(id => genreMapping[id]).join(', ')}</p>
              <p className="text-gray-700">Last Updated: {preview.updated ? new Date(preview.updated).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default HomePage;
