const fs = require('fs');
const { exit } = require('process');
var days = process.argv[2]; 
var dataProviderFile = "data.json"
var data = JSON.parse(fs.readFileSync(dataProviderFile,"utf8"));
console.log("Başlangıç: " + data.expire);
console.log("Bitiş: " + data.expire + (days * 60 * 60 *24 * 1000)  );
fs.writeFileSync(dataProviderFile, JSON.stringify({"expire": data.expire + (days * 60 * 60 *24 * 1000)}));
console.log("Başarıyla tarih güncellendi!");
