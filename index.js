let fs = require("fs");
const http = require("http");
const url = require("url");

const slugify = require("slugify");

//importing another modules from different files
const replaceTemplate = require("./module/replaceTemplate");

/////////////////////////////////////--------FILES-----------------///////////////////////////////
//blocking, synchronus way
/*

let textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
console.log(textIn);

let textOut = `This is what we know about the avacado: ${textIn}.\n Created on ${Date.now()}`;
fs.writeFileSync('./txt/output.txt', textOut);
console.log('File is written');

*/
//non-blocking, asynchronus way
//callback hell
/*

fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
    //how to handle error
    if(err) return console.log(`there is an error in file name!`);
    fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
        console.log(data2);
        fs.readFile(`./txt/append.txt`, 'utf-8', (err, data3) => {
            console.log(data3);

            //writing upper 2 lines in one file
            //this on will have only one agr in callback function because we are only writing
            fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
                console.log('filw is written.');
            });
        });
    });
});
console.log('file is read');
*/

//-------------------farm project------------------

//write every page basic template outside so that it dosn't needed to be read everytime
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);

//for API reading once so when user sends request everytime, its not needed to read everytime. It will load automatically, after first reading
//${__dirname} ====== is used so this file systems can be accesed from anywhere in thr system(more like relative path)
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(data); //for converting JSON object into the string obj so it can be displayed on the webpage

const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));
console.log(slugs);

////////////////////////////////--------------WEBSERVER--------------////////////////////////////
let server = http.createServer((req, res) => {
  //console.log(url.parse(req.url, true)); //for prinintg url object
  const { query, pathname } = url.parse(req.url, true);
  //console.log(req.url); for printing url name
  //routing
  const pathName = req.url;

  //OVERVIEW page TEMPLATE
  if (pathname === "/" || pathname === "/overview") {
    //1 first read the template overview
    res.writeHead(200, { "content-type": "text/html" });

    const cardHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    //console.log(cardHtml);
    //console.log(tempOverview);
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardHtml);
    res.end(output);
  }

  //PRODUCT PAGE TEMPLATE
  else if (pathname === "/product") {
    res.writeHead(200, { "content-type": "text/html" });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);
  }

  //API
  else if (pathname === "/api") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(data);
  }
  //404 NOT FOUND
  else {
    //putting 404 status code
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "hello-world",
    });
    res.end("<h1>Page not found</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("listening to requests on port 8000");
});
