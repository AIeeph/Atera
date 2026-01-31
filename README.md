# Atera – Online Game Store
## Project Description

Atera is a full-stack web application that simulates an online game store.  
The platform allows users to browse available games, view descriptions, and interact with dynamically loaded content from a cloud database.

The project demonstrates the integration of frontend and backend technologies, RESTful API design, database management, and cloud deployment.
## Live Demo

https://atera.onrender.com
## Technologies Used

### Frontend
- HTML
- CSS
- JavaScript
- Bootstrap

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas

### Tools
- GitHub
- Postman
- Render
## API Documentation

### Get all games
GET /api/games

Returns a list of all available games.

---

### Create a new game
POST /api/games

Requires authentication token.

Example body:

{
  "title": "Cyberpunk 2077",
  "price": 59.99,
  "image": "images/cyberpunk.jpg",
  "description": "Open-world action RPG"
}

---

### Delete a game
DELETE /api/games/:id

Removes a game from the database.
## How to Run Locally

1. Clone the repository:

git clone https://github.com/AIeeph/Atera.git

2. Navigate to the project folder:

cd YOUR_REPO

3. Install dependencies:

npm install

4. Create a .env file and add:

MONGODB_URI=your_mongodb_connection_string  
JWT_SECRET=your_secret_key  

5. Start the server:

node server.js

6. Open in browser:

http://localhost:3000
## Environment Variables

The following variables are required:

- MONGODB_URI
- JWT_SECRET
## Architecture

The application follows a three-tier architecture:

- Presentation Layer — frontend user interface  
- Application Layer — Express.js server  
- Data Layer — MongoDB cloud database  
## Author

Ernar Sadenov SE-2430
