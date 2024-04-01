# Nerdflix Demo

This is an open source Node JS Application that empowers users with different API capabilities with regards to a movie directory. 
The goal of this project is to display how Node when combine with Express JS can be a powerful tool when used combined, in regards to performance, practicality, scalability and code cleanliness/readability.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Focus and Trade-offs](#focus-and-trade-offs)
- [Libraries](#libraries)
- [Outro](#outro)

## Features
- Create: Users are able to create a movie that gets saved in a PostGres databse using the POST "/create" endpoint (requires request body with "title" (string), "description" (string), "year" (integer), "duration" in minutes (integer) and 1-5 "rating" (integer))
- Search: Users are able to search for a movie that has been added in the databse using the GET "/search" endpoint (requires request query param "title" (string))
- Like: Users are able to like/dislike a movie that has been added in the databse using the POST "/like" or POST "/like/:id" endpoints. The only difference in between them is that, the one which contains "id" as a parameter targets the movie and switches its boolean flag to true, whereas the other toggles it according to the latest searched movie (designed to work on web browser only)
- Update: Users are able to edit a searched movie that has been added in the databse using the POST "/edit" endpoint (requires request body with "id" (integer), "title" (string), "description" (string), "year" (integer), "duration" in minutes (integer) and 1-5 "rating" (integer)). Note: This should, ideally, be implemented as PATCH but for simplicity it has been set as POST
- Delete: Users are able to delete a searched movie that has been added in the databse using the DELETE "/delete/:id" endpoint

## Architecture
The architecture pattern applied in this project was RESTful, essentially. It can be potentially expanded using CLEAN architecture pattern if necessary.

## Installation
### GitHub
Since it's a public repository, it can simply be cloned from develop branch into your local directory using Git. Once cloned, Open VSCode (or your code editor of choice) and select the directory where the project was cloned to.

### Zip
Unzip the file in a directory (ideally in the designated projects folder of choice). Open your code editor and select the directory where the project was unzipped to.

## Focus and Trade-offs
### Focus
The primary focus of this project was the base architecture, the separation of the endpoints and database integration. With a solid foundation, applications are more likely to be scalable and maintainable in the foreseeable future.

### Trade-offs
Some trade-offs were in the realm of EJS UX/UI (which is arguably out of scope), unit testing and environment file setup. Priorities were shifted towards delivering functional features in order to leave room for scalability, proper database integration and such.

# Libraries
The following are the third party libraries used in this project:
- Express JS
- Postgres Database / PG
- EJS

# Outro
I'd like to share the resources I used during the development of this project:

- StackOverflow
- ChatGPT (mainly for EJS formatting and Express routing)
- Medium articles
- W3 Schools
- Mozilla HTTP