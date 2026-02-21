const fs = require('fs');
const http = require('http');
const crypto = require("crypto");
const { log } = require('console');


const server = http.createServer(httpServer);
server.listen(3000);

const homePage = fs.readFileSync('./assets/index.html', 'utf-8');
// console.log(homePage);
const players = {};


async function httpServer(req, res) {
    const { url, method } = req;
    const path = url.substr(0, url.indexOf('?') == -1 ? url.length : url.indexOf('?'))
    console.log(path);

    // console.log();
    switch (path) {
        case '/':
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(homePage);
            return;
        case '/register':
            if (method == 'POST') {
                const body = await readBody(req);
                const playerId = crypto.randomUUID();
                players[playerId] = {
                    player: body,
                    moves: []
                };

                console.log(players);

                res.setHeader('Set-Cookie', [`p=${playerId}`, 'another=cookie']);
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('register');
                return;
            }
            res.writeHead(405, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<html><body><h1>405 Method not allowed.</h1></body></html>');
            return;
        case '/move':
            if (method == 'POST') {
                const body = await readBody(req);
                
                const cookie = req.headers.cookie.split(';').reduce((a, c) => {
                    const [k,v] = c.split('=');
                    a[k.trim()] = v.trim();
                    return a;
                }, {})
                console.log(cookie);
                
                const playerId = cookie.p;
                console.log({players});
                console.log(players[playerId]);
                players[playerId].moves.push(body);

                console.log(players);

                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('moved');
                return;
            }
            res.writeHead(405, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<html><body><h1>405 Method not allowed.</h1></body></html>');
            return;
        default:
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<html><body><h1>404 Not found.</h1></body></html>');
            return;
    }
}

function readBody(req) {
    let body = '';
    req.on('data', chunk => body += chunk);
    return new Promise((res, rej) => {
        req.on('end', () => res(JSON.parse(body)));
        req.on('error', e => rej(e))
    });
}