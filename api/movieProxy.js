import dotenv from "dotenv";
dotenv.config();

export default async function handler(req, res) {
  const { query } = req.query;

  const apiKey = process.env.MOVIE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  const url = query
    ? `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&api_key=${apiKey}`
    : `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${apiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: "TMDB API error" });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch from TMDB" });
  }
}
