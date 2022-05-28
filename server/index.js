const websocket = require('ws');
const { exec } = require("child_process");

var port = 11121;
var secret = "0512e3136160817937d0bed95fa9944e65bdd23bcf1279445205a5541c0e55af5fe3f8eb32faa45045529bff12d927c33566369478b7d3b27ce9c672686d22e7";
var dataFile = "data.json";

const wss = new websocket.Server({"port": port});
const fs = require('fs');

const readJSONFile = (file) => JSON.parse(readFile(file));
const readFile = (file) => fs.readFileSync(file, "utf8");

wss.on("connection", ws => {
    console.log("Client connected!");
    ws.on("message", data => {
        var dataSTR = data;
        console.log(`Message received: ${dataSTR}`);
        var model = {
            "success": false,
            "invalidSecret": false,
            "error": "",
            "data": "",
            "consoleOutput": ""
        }
        try {
            data = JSON.parse(data);
            var expireTime = readJSONFile(dataFile).expire;
            var error = false;
            console.log("Gizli anahtar: " + data["secret"]+"\nSON KULLANMA SURESI: " + expireTime+"\nSUANKI ZAMAN: " + Date.now());
            if (data["secret"] !== secret){
                model["error"] = "Gizli anahtar eşleşmiyor!";
                model["invalidSecret"] = true;
                error = true;
            };
            if (error !== true && expireTime < Date.now()){
                model["error"] = "Kullanım süresi doldu!";
                error = true;
            };
            if (error){
                console.log("> " + model["error"]);
                ws.send(JSON.stringify(model));
                return;
            };
            // ${data["loginName"]} ${data["loginPass"]} ${data["orderId"]} ${data["targetAccount"]} ${data["postLimit"]} ${data["serviceName"]}
            // dataSTR = dataSTR.replace("\"", "[__]")
            console.log("Çalıştırılıyor: " + `python module.py '${dataSTR}'`);
            ws.send(JSON.stringify(model));
            exec(`python module.py '${dataSTR}'`, (consoleError, stdout, stderr) => {
                if (consoleError) {
                    model["error"] = stderr;
                    model["consoleOutput"] = stdout;
                    console.log("ERROR: " + stderr);
                    console.log("OUTPUT: " + stdout);
                    ws.send(JSON.stringify(model));
                    return;
                };
                model["success"] = stdout.includes("statusCODE=success");
                model["consoleOutput"] = stdout;
                model["data"] = readFile(`posts/${data["orderId"]}.txt`);
                ws.send(JSON.stringify(model));
                console.log("SENT: " + JSON.stringify(model));
            });
        } catch (err) {
            model["error"] = err.toString();
            ws.send(JSON.stringify(model));
        }
    });
    ws.on("close", () => {
        console.log("Client disconnected!");
    });
    ws.onerror = () => {
        console.log("Some error occurred");
    };
});
console.log(`WebSocket server is listening on port ${port}`);