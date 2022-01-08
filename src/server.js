const express = require("express");

const fs = require("fs"); // file system
const path = require("path");

const morgan = require("morgan");

const Joi = require("joi");

/*On formate les données pour qu'elles soient exploitables */
const pathProductsJSON = path.join(__dirname, "./data/products.json");

const products = JSON.parse(fs.readFileSync(pathProductsJSON).toString()); // string json --> objet js

/*On crée le serveur express et on utilise express.json*/
const app = express();

app.use(express.json());

app.use(morgan("combined"));


/*------------ Les requêtes GET ------------------*/

app.get("", (req, res) => {
  // res==>response
  console.log("requête entrante sur la homepage");
  res.send("Homepage");
});

app.get("/api/products", (req, res) => {
  res.status(200).send(products);
});

/*Sur Postman, pour ajouter un élément :

  -Dans la partie API :
  
    -> Cliquez sur "Body", puis sur cochez "raw"
    
    -> En cliquant sur "text", choissez "JSON"
    
    ->Choississez la méthode "Post" puis cliquez sur le bouton "send"
*/

/*------------ La requête POST ------------------*/

app.post("/api/products", (req, res) => {
  const product = req.body;

  product.id = products[products.length - 1].id + 1;

  products.push(product);

  res.status(201).send(products);
});

/*------------ La requête DELETE ------------------*/

app.delete("/api/products/:id", (req, res) => {
  //On récupère l'id de l'élément de la requête
  const id = parseInt(req.params.id);

  /*On le recherche avec la méthode find et on
  stocke le résultat dans la variable product*/

  const product = products.find((product) => {
    return product.id === id;
  });

  /*Si la méthode find ne trouve rien*/
  if (!product) {
    return res.status(404).send(`Product with id = ${id} does not exist!`);
  }

  /*Sinon on stocke dans idx l'index du produit*/
  const idx = products.indexOf(product);

  /*On enlève le produit d'indice idx de la liste products*/
  products.splice(idx, 1);

  /*Dans la réponse on renvoie le produit et le status 200*/
  res.status(200).send(product);
});

/*------------ La requête PUT ------------------*/

/*Le verbe "put" permet d'updater*/ 

app.put("/api/products/:id", (req, res) => {

  /*Comme d'habitude on stocke l'id et on fait la recherche*/ 

  const id = parseInt(req.params.id);

  const product = products.find((product) => {
    return product.id === id
  })

  /*Si erreur 404*/ 

  if(!product) {
    return res.status(404).send(`Product with id = ${id} does not exist!`)
  }

  /*Sinon, on stocke la requête dans la variable body*/ 

  const body = req.body;

  /*On utilise la classe Joi pour formater un 
  schéma que le body de la requête doit suivre */

  const schema = Joi.object({

    title: Joi.string(),
    price: Joi.number(),
    description: Joi.string(),
    category: Joi.string(),
    image: Joi.string(),
   
    rating: {
        rate: Joi.number(),
        count: Joi.number()
    }
  })

  /*On vérifie si le body de la requête
  obéit au schéma*/ 

  /*On déstructure également 
  la propriété "error" de l'objet schema*/ 
  
  const { error } = schema.validate(body)

  /*Si on détecte une erreur dans la requête*/ 
  if(error) {
    res.status(400).send(`Bad Request!\n${error.details[0].message}`)
  }
  
  /*Si la requête est acceptée, on fait une boucle
  pour modifier les infos (propriétés) du produit
  qui doivent être modifiées*/ 

  for(let property in req.body) {
    product[property] = req.body[property]
  }

  /*Ensuite on envoie le produit modifié au client */
  res.status(200).send(product);
  
    
  
})

/*------------ La requête GET pour
un article en particulier ------------------*/

/*On détaile un id dans l'URL*/ 

app.get("/api/products/:id", (req, res) => {
  
  /*On récupère l'id */
  const id = parseInt(req.params.id);

  /*On cherche le produit*/ 
  const product = products.find((product) => {
    return product.id === id
  })

  /*Si on ne trouve pas le produit*/ 
  if(!product) {
    return res.status(404).send(`Product with id = ${id} does not exist!`)
  }

  /*Si tout va bien on envoie le produit choisi */

  res.status(200).send(product)
}) 

/*----------- Fin des requêtes -------------- */

console.log(products);

/*On écoute l'app sur le port 3000 ou 
le port de l'environnement*/

app.listen(process.env.PORT || 3000, () =>
  console.log("Listening on port 3000...")
);
