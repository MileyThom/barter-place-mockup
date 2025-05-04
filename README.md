# barter-place-mockup
a simple web application for LIS 4613 with Dr. Youssef

# purpose 
Barterplace is an application made to connect users who wish to trade for or with items they own for items other users own. 
users are able to make an account, make posts and view posts. 

# dependacies 
are listed in package.json and should be installed using the npm {package name} command. 

# running the application
First, initialize the MySQL database by running the sql script dbCreateSimplified. 
create a .env file containing sensative information for database connection
navigate to the project directory and run 'node app.js' 
this will start the server on your local host 
in your web browser go to http://localhost:3000 to use the application. 

# using the application 
users should initially create an account at http://localhost:3000/create-user.html this will add their account to the database and allow them to recieve security codes. 

once a user account is created, the user should go to http://localhost:3000/login.html and enter their username and password. they will recieve a security code allowing them to use the 
applications write and view functions.

to create a post, the user should http://localhost:3000/create.html and fill out the form. note that a security code is necessary to submit succesfully

to view their own posts. the user should go to http://localhost:3000/user.html and enter their security code. 

to view all, or filtered posts, the user should go to http://localhost:3000/view.html and enter their security code along with any filters they wish. 
