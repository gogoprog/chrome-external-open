const http = require('http');
const {
    exec
} = require("child_process");

const port = 3333;

const requestHandler = (request, response) => {
    const params = new URLSearchParams(request.url.substr(1));
    response.end();

    var file = params.get("file");
    let row, col;
    [row, col] = params.get("at").split(":");

    if (file.startsWith("file:///")) {
        file = file.substr(8);

        var cmd = `vim --servername main --remote "+call cursor(${row}, ${col})" ${file}`;
        console.log("Executing: " + cmd);
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`${stdout}`);
        });
    }
};

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }

    console.log(`server is listening on ${port}`)
});
