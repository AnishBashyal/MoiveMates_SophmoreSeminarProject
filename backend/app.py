from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import requests, os

load_dotenv()

app = Flask(__name__)
CORS(app)


# TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_API_KEY = ""
GENRE_MAPPING = {}  

def fetch_genres():
    """Fetch genres from TMDb and populate GENRE_MAPPING."""
    global GENRE_MAPPING
    tmdb_genre_url = f"https://api.themoviedb.org/3/genre/movie/list?api_key={TMDB_API_KEY}&language=en-US"
    response = requests.get(tmdb_genre_url)
    
    if response.status_code == 200:
        genre_data = response.json()
        GENRE_MAPPING = {genre['id']: genre['name'] for genre in genre_data["genres"]}
    else:
        print("Failed to fetch genres from TMDb")

@app.route('/top_movies', methods=['GET'])
def get_top_movies():
        
    tmdb_url = f"https://api.themoviedb.org/3/movie/popular?api_key={TMDB_API_KEY}&language=en-US&page=1"
    
    response = requests.get(tmdb_url)
    
    if response.status_code == 200:
        tmdb_data = response.json()
        movies = []

        for movie in tmdb_data["results"]:
            movie_data = {
                "id": movie["id"],
                "title": movie["title"],
                "genre_ids": movie["genre_ids"],
                "rating": movie.get("vote_average"),
                "poster": f"https://image.tmdb.org/t/p/original{movie['poster_path']}", 
                "synopsis": movie.get("overview", "No synopsis available")
            }
            movies.append(movie_data)

        return jsonify(movies)
    else:
        return jsonify({"error": "Failed to fetch data from TMDb"}), response.status_code


@app.route('/search_movies', methods=['GET'])
def search_movies():
   
    fetch_genres()
    print(GENRE_MAPPING)
    query = request.args.get('query', '')
    genre = request.args.get('genre', '')  
    year = request.args.get('year', '')
    rating = request.args.get('rating', '')

    genre_id = [id for id, name in GENRE_MAPPING.items() if name.lower() in genre.lower()]
    genre_id = genre_id[0] if genre_id else ''  

    if query:
        tmdb_url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&language=en-US&query={query}"
    else:
        tmdb_url = f"https://api.themoviedb.org/3/discover/movie?api_key={TMDB_API_KEY}&language=en-US"

    # Append filters directly to the URL
    if year:
        tmdb_url += f"&primary_release_year={year}"
    if genre_id:
        tmdb_url += f"&with_genres={genre_id}"
    if rating:
        tmdb_url += f"&vote_average.gte={rating}"

    response = requests.get(tmdb_url)
    
    if response.status_code == 200:
        tmdb_data = response.json()
        movies = [
            {
                "id": movie["id"],
                "title": movie["title"],
                "genres": [GENRE_MAPPING.get(genre_id, "Unknown") for genre_id in movie["genre_ids"]],  
                "rating": movie.get("vote_average"),
                "poster": f"https://image.tmdb.org/t/p/w500{movie['poster_path']}" if movie.get("poster_path") else "https://via.placeholder.com/300x450",
                "synopsis": movie.get("overview", "No synopsis available")
            }
            for movie in tmdb_data.get("results", [])
            if not query or (not rating or movie.get("vote_average", 0) >= float(rating))  
        ]
        
        return jsonify(movies)
    else:
        return jsonify({"error": "Failed to fetch data from TMDb"}), response.status_code
    
app.run(debug=True)
