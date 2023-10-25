

//:-Data fetching through sql database:-----------------------------------------
const express = require("express");
const app = express();
const cors = require("cors");
const { Client } = require("pg");

app.use(express.json());
app.use(cors());

const client = new Client({
    user: "postgres",
    password: "Saleem@0786",
    database: "postgres",
    port: 5432,
    host: "db.kzusjuxduqlvldremfxg.supabase.co",
    ssl: { rejectUnauthorized: false },
});

client.connect(function (err) {
    if (err) {
        console.error("Error connecting to PostgreSQL:", err);
    } else {
        console.log("Connected to PostgreSQL");
    }
});

var port = process.env.PORT || 2410;
app.listen(port, () => console.log(`Node app listening on port ${port}`));


//fetching data through api from shops:-------------------------------------------
app.get("/shops", function (req, res) {
    let sql = "SELECT * FROM shops";
    client.query(sql, function (err, result) {
        if (err) res.status(404).send(err);
        else res.send(result.rows);
    })
})

app.post("/shops", function (req, res) {
    let body = req.body;
    let sql = "INSERT INTO shops(name, rent) VALUES($1, $2)";
    let values = [body.name, body.rent];
    client.query(sql, values, function (err, result) {
        if (err) res.status(404).send(err);
        else res.send("Data inserted successfully!!!");
    })
})


//fetching data through api from products:-------------------------------------------
app.get("/products", function (req, res) {
    let sql = "SELECT * FROM products";
    client.query(sql, function (err, result) {
        if (err) res.status(404).send(err);
        else res.send(result.rows);
    })
})

app.post("/products", function (req, res) {
    let body = req.body;
    let sql = "INSERT INTO products(productname, category, description) VALUES($1, $2, $3)";
    let values = [body.productname, body.category, body.description];
    client.query(sql, values, function (err, result) {
        if (err) res.status(404).send(err);
        else res.send("Data inserted successfully!!!");
    })
})

app.put("/products/:id", function (req, res) {
    let id = +req.params.id;
    let body = req.body;

    let sql = `UPDATE products SET category=$1, description=$2 WHERE productid=${id}`;
    let values = [body.category, body.description];

    client.query(sql, values, function (err, result) {
        if (err) res.status(404).send(err);
        else {
            if (result) {
                res.send("Data updated successfully!!!");
            } else {
                res.send("No items found !!!");
            }
        }
    })
})



//fetching data through api from purchases:-------------------------------------------
app.get("/purchases", function (req, res) {
    const shopFilter = req.query.shop;
    const productFilter = req.query.product;
    const sortCriteria = req.query.sort;

    let sql = "SELECT * FROM purchases";
    
    if (shopFilter || productFilter) {
        sql += " WHERE";
        if (shopFilter) {
            sql += ` shopid = '${shopFilter}'`;
        }
        if (shopFilter && productFilter) {
            sql += " AND";
        }
        if (productFilter) {
            sql += ` productid = '${productFilter}'`;
        }
    }

    if (sortCriteria) {
        // Check and add sorting options
        if (sortCriteria.includes("QtyAsc")) {
            sql += " ORDER BY quantity ASC";
        } else if (sortCriteria.includes("QtyDesc")) {
            sql += " ORDER BY quantity DESC";
        } else if (sortCriteria.includes("ValueAsc")) {
            sql += " ORDER BY (quantity * price) ASC";
        } else if (sortCriteria.includes("ValueDesc")) {
            sql += " ORDER BY (quantity * price) DESC";
        }
    }

    client.query(sql, function (err, result) {
        if (err) {
            res.status(404).send(err);
        } else {
            res.send(result.rows);
        }
    });
});


app.get("/purchases/shops/:id", function (req, res) {
    let id = +req.params.id;
    let sql = `SELECT * FROM purchases WHERE shopid = ${id}`;
    client.query(sql, function (err, result) {
        if (err) res.status(404).send(err);
        else res.send(result.rows);
    })
})

app.get("/purchases/products/:id", function (req, res) {
    let id = +req.params.id;
    let sql = `SELECT * FROM purchases WHERE productid = ${id}`;
    client.query(sql, function (err, result) {
        if (err) res.status(404).send(err);
        else res.send(result.rows);
    })
})

app.get("/totalpurchases/products/:id", function (req, res) {
    let id = +req.params.id;
    const sql = `SELECT COUNT(*) FROM purchases WHERE productid = ${id}`;
    client.query(sql, function (err, result) {
        if (err) res.status(404).send(err);
        res.send({ count: result.rows[0].count });
    })
})

app.get("/totalpurchases/shops/:id", function (req, res) {
    let id = +req.params.id;
    const sql = `SELECT COUNT(*) FROM purchases WHERE shopid = ${id}`;
    client.query(sql, function (err, result) {
        if (err) res.status(404).send(err);
        res.send({ count: result.rows[0].count });
    })
})


app.post("/purchases", function (req, res) {
    let body = req.body;
    let sql = "INSERT INTO purchases(shopid, productid, quantity, price) VALUES($1, $2, $3, $4)";
    let values = [body.shopid, body.productid, body.quantity, body.price];
    client.query(sql, values, function (err, result) {
        if (err) res.status(404).send(err);
        else res.send("Data inserted successfully!!!");
    })
})




