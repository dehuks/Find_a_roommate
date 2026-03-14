const url = "https://pneumococcal-ternately-deedra.ngrok-free.dev/api/roommates/";
// Just fetching without token to see if it's 401 or 500
fetch(url).then(res => res.text()).then(console.log).catch(console.error);
