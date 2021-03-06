const http = require('http');
const fs = require('fs');
const server = http.createServer();

server.on('request', (request, response)=>{
    function sendFile(type){
        let path = request.url.slice(1);
        let file = fs.readFileSync(path, "utf8");

        response.writeHead(200, {'Content-Type': type});
        response.end(file);
    }
    switch(request.url){
        case '/':
            let index = fs.readFileSync("index.html", "utf8");

            response.writeHead(200, {'Content-Type': 'text/html'});
            response.end(index);
            break;
        case '/data/colors.json':
            if (request.method == 'GET'){
                sendFile('application/json');
            }
            if (request.method == 'POST'){
                let body = '';
                request.on('data', (chunk) => {body += chunk.toString()});
                request.on('end', () => {
                    fs.writeFile('data/colors.json', body, (error)=>{
                        if(error) {
                            throw error;
                        }
                        console.log('Wrote file "data/colors.json"');
                    });
                    response.end('ok');
                })
            }
            break;
        case '/css/style.css':
            sendFile('text/css');
            break;
        case '/js/script.js':
            sendFile('text/plain');
            break;
        default:
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.end('404 File Not Found');
    }
    
})

server.listen(8080, ()=>{console.log('Server works at localhost:8080')});