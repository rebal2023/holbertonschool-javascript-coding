#!/usr/bin/node

const request = require('request');

const movieId = process.argv[2];

const url = `https://swapi.dev/api/films/${movieId}/`;

request(url, (error, response, body) => {
  if (error) {
    console.error('Error:', error);
  } else if (response.statusCode !== 200) {
    console.error('Unexpected status code:', response.statusCode);
  } else {
    const movie = JSON.parse(body);
    const characters = movie.characters;
    const characterRequests = characters.map(characterUrl => {
      return new Promise((resolve, reject) => {
        request(characterUrl, (charError, charResponse, charBody) => {
          if (charError) {
            reject(charError);
          } else if (charResponse.statusCode !== 200) {
            reject(new Error(`Unexpected status code: ${charResponse.statusCode}`));
          } else {
            const character = JSON.parse(charBody);
            resolve(character.name);
          }
        });
      });
    });
    Promise.all(characterRequests)
      .then(characterNames => {
        characterNames.forEach(name => console.log(name));
      })
      .catch(err => {
        console.error('Error fetching characters:', err);
      });
  }
});
