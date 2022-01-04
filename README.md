# 🏕️ YelpCamp 🏕️

YelpCamp is a web app where registered users can create and review campgrounds.

Check it out here: https://secret-plateau-48638.herokuapp.com/

## Tech Stack

- NodeJS, Express, MongoDB and Bootstrap 5.
- PassportJS to handle authentication.

## Features

- Visitors can view listed campgrounds (and their reviews, ratings etc.)
- Visitors can create an account.
- Registered users can create, read/view, update and delete their own campground reviews.
- Users can upload multiple images for each campground they submit.
- Error handling both on server-side and client-side implemented.

### Homepage

<img src="./screenshots/homepage.png" width="600">
<img src="./screenshots/homepage_m.png" height="500">

### Campgrounds Index

<img src="./screenshots/index.png" width="600">
<img src="./screenshots/index_m.png" width="300">

### Register User

<img src="./screenshots/register_m.png" width="300">

### Submit New Campground

- Subsequently, users can only update/delete their own campgrounds and not others'.

<img src="./screenshots/new_campground.png" width="600">

<img src="./screenshots/new_campground_static_success.png" width="600">

<img src="./screenshots/view_hogwarts.png" width="600">

### Review Campground + Star Rating

<img src="./screenshots/hogwarts_pre_star.png" width="600">
<img src="./screenshots/hogwarts_post_star.png" width="600">

### Server-Side Error Handling

- Using postman to try to circumvent client-side error handling. Middleware check if the requests are valid and authorized (using JOI).

<img src="./screenshots/server_side_validation.png" width="600">

### Client-Side Error Handling

<img src="./screenshots/error_registered.png" width="500">

<img src="./screenshots/error_incorrect.png" width="500">

<img src="./screenshots/success_login.png" width="500">
