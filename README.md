# Noi-Cocktail-Recipe
Self-Evaluation

I have learned how to build APIs, utilizing both basic and advanced features of MongoDB and Express. I tested my projects using both code-based testing and the Postman program. Additionally, I gained experience in setting up CI workflows. I focused on ensuring the security and quality of my APIs by implementing authentication and authorization mechanisms.

One of the most valuable aspects of this learning experience has been problem-solving within my projects. As I deploy this API within my company, I recognize the need to incorporate additional functionalities based on user feedback. Despite this, my current function is working well. I anticipate positive feedback from users and expect it will create values to users.

I am grateful for the challenge this opportunity presented. I am genuinely happy and proud of my achievements.

Thank you.

---------------------------------------------------------------------------------------------------------------------------------------------------

Proof of Concept and Update Breakdown

Finished
- Set up Project.
- Connection to Mongodb.
- Express server.
- Function Route for users, items and menu.
- Function Data Access Object (DAO) for user, item and menu.
- Set up schema for user, item and menu.
- Function Authentication and Authorization.
- Set up Middleware.
- Fast Test with Postman.
- All Testing code.(>80%)

On progress
- Prepare database and detail for presentation.
- Slides for presentation.

------------------------------------------------------------------------------------------------------------------------------------------------

Topic Proposal
1. A description of the scenario your project is operating in.
 - Purpose : The Cocktail Recipe API aims to provide users with a comprehensive database of cocktail recipes from Noi Thai restaurant. It serves as a one-stop platform for cocktail enthusiasts, bartenders and manager to access a wide range of recipes for both classic and innovative cocktails
 - Target Audience: This API targets Noi's employees, cocktail enthusiasts, and managers who want to integrate cocktail recipe functionality into their restaurant menus.
 - Functionality: Users can perform various actions through the API, including:

    - All user role can retrieve a list of present and past cocktails.
    - All user role can search for cocktails by name, ingredients.
    - All user role can access detailed information for each cocktail, including ingredients, mixing techniques and garnishes.
    - Manager and admin can add new and update cocktail recipes to the database.
    - Only admin can delete existing cocktail recipes.
    
2. A description of what problem your project seeks to solve.
  - My company has 8 restaurants. Every month, each restaurant has to create a new cocktail menu for the special drink of the month. We do not have a system to manage and store our data, so I created this project to help them in database management.
3. A description of what the technical components of your project will be, including: the routes, the data models, any external data sources you'll use, etc.
 - The API is built using modern web development technologies, such as Node.js for the server-side logic, Express.js for handling HTTP requests, MongoDB for storing recipe data, bcrypt library for securely storing passwords and JSON Web Tokens (JWT) for authentication and authorization. The route function will be as follows:
.
    - Login
        Sign-up: POST /auth/signup
        Login: POST /auth/login
        Change Password: PUT /auth/password
    - Items (requires authentication)
        Create: POST /items - restricted to users with the "admin" & "manager" role.
        Update: PUT /items/:id - restricted to users with the "admin & "manager" role.
        Delete: DELETE /items - restricted to users with the "admin" role.
        Get all items: GET /items - open to all users.
        Get specific item: GET /items/:id - open to all users.
        Get search item: GET/items/search - open to all users.
    - Menus (requires authentication)
        Create: POST /menus - restricted to users with the "admin" & "manager" role.
        Get all menus: GET /menus - return all the menus made by the manager making the request if not an admin user. If they are an admin user, it should return all menus in the DB.
        Get a menu: GET /menus/:id - return a menu with the items array containing the full item objects rather than just their _id. If the user is a manager user return a 404 if they did not place the menu. An admin user should be able to get any menu.
    - User entity:
        {
        "name": string;
        "password": string;
        "roles": [string];
        }
    - Items entity:
        {
        "name": string,
        "ingredients": [string],
        "mixing techniques": string,
        "garnish": string
        }
    - Menus entity:
        {
        userId: {
          type: ObjectId,ref: "users",
        },
        list: {
          type: [{ ObjectId, ref: "items" }],
        },
        total: { type: Number},
        }

4. Clear and direct call-outs of how you will meet the various project requirements.
Your project will require an Express API using:
* Authentication and Authorization
  - For authentication, user have to sign-up and sign-in for make a request.
  - For authorization, granting certain people permission to access certain data via 3 roles (user, manager, admin).
* 2 sets of CRUD routes (not counting authentication)
  - Items route.
  - Menus route.
* Indexes for performance and uniqueness when reasonable
  - Item's name will be a index.
* At least one of text search, aggregations, and lookups
  - Text search for ingredients and item's name.
* You may use external data providers (APIs) if you can get yourself free trial/tier access
  - Use data from my company.
* Routes should be fully tested (project test coverage > 80%)
  - Noted.


5. A timeline for what project components you plan to complete, week by week, for the remainder of the class. 
* Project Plan
  * Week 1
    - Planning.
    - Setup project.
    - Create authentication and authorization.
  * Week 2
    - Create DAO.
    - Create Routes.
    - Create Test.
  * Week 3
    - Add database.
    - Deployed onto a web server.
    - Prepare present.