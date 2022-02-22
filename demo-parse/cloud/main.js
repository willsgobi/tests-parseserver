const Product = Parse.Object.extend('Product')
const Brand = Parse.Object.extend('Brand')
const Session = Parse.Object.extend('Session')

Parse.Cloud.define("hello", (request) => {
  const name = request.params.name;
  return(`Hello world from ${name} from CloudCode VS!`);
});

Parse.Cloud.define("create-product", async (request) => {
  const product = new Product();
  const params = request.params;

  const brand = new Brand();
  brand.id = params.brand;

  product.set("name", params.name);
  product.set("price", params.price);
  product.set("stock", params.stock);
  product.set("brand", brand);
  product.set("isSelling", params.isSelling);

  const savedProduct = await product.save(null, { useMasterKey: true });

  return savedProduct;
});

Parse.Cloud.define("change-price", async (request) => {
  const product = new Product();

  product.id = request.params.id;
  product.set("price", request.params.price)

  const savedProduct = await product.save(null, { useMasterKey: true });
  return savedProduct;
})

Parse.Cloud.define("delete-product", async (request) => {
  const product = new Product();

  product.id = request.params.id;
  
  await product.destroy({ useMasterKey: true });
  return "Produto excluído com sucesso!";
})

Parse.Cloud.define("get-product", async (request) => {
  if(request.params.id === null) throw "produto não encontrado"

  const query = new Parse.Query("Product")
  query.include("brand")
  const product = await query.get(request.params.id, {useMasterKey: true})

  
  const json = product.toJSON();

  return {
    "name": json.name,
    "price": json.price,
    "stock": json.stock,
    "brand": json.brand.name
  };
});

Parse.Cloud.define("list-products", async (request) => {
  const page = request.params.page;
  const query = new Parse.Query("Product")
  // query.greaterThanOrEqualTo("price", 300)
  // query.lessThanOrEqualTo("price", 5000)

  // query.descending("stock")

  query.limit(2)
  query.skip(page * 2)
  const produtcs = await query.find({useMasterKey: true});

  return produtcs.map((p) => {
    p = p.toJSON();

    return {
      name: p.name,
      price: p.price,
      stock: p.stock
    }
  });
});

Parse.Cloud.define("sign-up", async (request) => {
  const user = new Parse.User();
  user.set("username", request.params.email)
  user.set("email", request.params.email)
  user.set("password", request.params.password)
  user.set("name", request.params.name)

  const savedUser = await user.signUp(null, {useMasterKey: true})
  return savedUser;
})

Parse.Cloud.define("get-current-user", async (request) => {
  return request.user;
})

Parse.Cloud.define("login", async (request) => {
  const user = await Parse.User.logIn(request.params.email, request.params.password)

  return user;
})

Parse.Cloud.define("logout", async (request) => {
  var query = new Parse.Query(Parse.Session)
  query.equalTo("user", request.user)
  var currentSession = await query.find({useMasterKey: true})
  const session = new Session();
  session.id = currentSession.id
  
  await session.destroy({ useMasterKey: true });
  
  return "deleted";
})