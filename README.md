# Fullstack blogging app

This is my first fullstack project based on course I followed on Udemy called [Learn JavaScript: Full-stack from scratch](https://www.udemy.com/certificate/UC-49ddb7d8-1a5c-4083-8938-c74cd2e41ca7/).

It is a blogging platform where users can follow each others and thus have a personalized feed of posts.

![Feed](https://raw.githubusercontent.com/jkgithubrep/fullstack_blogging_app/master/screenshots/feed.png?token=AIYJVRDFGTA3LPPSGHNOMETAYXU6G)

## Table of content

1. [Stack](#stack)
2. [Features](#features)
3. [Overall architecture](#architecture)
4. [Install](#install)

## <a name="stack"></a>Stack

The backend is in [**Node.js**](https://nodejs.org/en/) with the [**Express**](https://expressjs.com/) framework. The frontend is handled with [**EJS**](https://ejs.co/) templating system. Data are stored in a [**mongoDB**](https://www.mongodb.com/) database. The code architecture follows the **MVC** pattern. The app is deployed on [**Heroku**](https://www.heroku.com/).

## <a name="features"></a>Features

- **User management** using sessions ([`express-session`](https://www.npmjs.com/package/express-session)) and JWT.
- **User-generated content** (with markdown syntax).
- **Flash messages** for an enhanced user experience.
- **Live search**.
- **Live form validation**.
- **Embedded chat system**.

## <a name="architecture"></a>Overall architecture

- `router.js`: all the routes handled in the application
- `apiRouter.js`: routes specific to the api
- `app.js`: connect all the middlewares
- `db.js`: connection to the database.
- Implement an MVC architecture with `models`, `controllers` and `views` folders.

## <a name="install"></a>Install

```
$ npm start
```

Then, go to `localhost:3000`.
