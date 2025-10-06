# Forum API

> This is an API for forums where users can view/create posts/questions with different topics and categories, can like/dislike publications, follow them and add to favorites, follow other users and receive notifications.

![API in work](/readme_image.png)

Documentation with full application description and its usage is [here](https://docs.google.com/document/d/1c1-a_iFDRsBamcnFS83DbiQK_2cRXP7lHmKClwQCkfo/edit?usp=sharing).

## What you need to do first

### Required stack

* npm
* Node.js
* MySQL

### Create database

To initialize database in project directory:

```
mysql -u root < db.sql
```

To load test data (password: *securepass*):

```
mysql -u BekkaMushko -p < data.sql
```

### Initialise the project

```
npm install
```

It will innit the project and install required dependencies (`Express`, `MySQL2`, `JSON Web Token`, `Nodemailer`, `Multer`).

## How to run the app

```
npm start
```

For beginning, log in as **admin** with email *admin@example.com* and password *1234567890*
