const http = require('http');
const {
    exec
} = require("child_process");
const port = 3333;

const requestHandler = (request, response) => {
    const params = new URLSearchParams(request.url.substr(1));
    response.end();

    let file = params.get("file");
    let row, col;
    [row, col] = params.get("at").split(":");

    if (file.startsWith("file:///")) {
        file = file.substr(8);

        let cmd = `vim --serverlist`;
        console.log("Executing: " + cmd);
        let process = exec(cmd, (error, stdout, stderr) => {
            if (stdout != "") {
                let servername = stdout.split("\n")[0];
                let cmd = `vim --servername ${servername} --remote "+call cursor(${row}, ${col})" ${file}`;
                console.log("Executing: " + cmd);
                let process = exec(cmd, (error, stdout, stderr) => {
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
            } else {
                console.log("No vim server found.");
            }
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
