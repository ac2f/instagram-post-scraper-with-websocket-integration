from instagrapi import Client
from instagrapi.exceptions import * 
import os, sys, json, random
#instagrapi - private.py
#write sms-email codes into "codes/{username}-code.txt"
params = json.loads(eval(sys.argv[1].replace("{", "{\"").replace("}", "\"}").replace(":", "\":\"").replace(",", "\",\"")));
GIRIS_YAPILACAK_KULLANICI = params["loginName"];
GIRIS_YAPILACAK_KULLANICI_SIFRE = params["loginPass"];
SIPARIS_ID:str = params["orderId"];
HEDEF_HESAP:str = params["targetAccount"];
LIMIT:int = int(str(params["postLimit"]));
HIZMET:str = params["serviceName"];
class InstagramPostScraper:
    def __init__(self, orderId:str, *args,foldername:str="posts", filename:str="{0}.txt"):
        os.system(f"mkdir {foldername}" if not os.path.exists(foldername) else "");
        self.orderId = orderId;
        self.absPath:str = foldername + "/" + filename.format(orderId);
        self.file = open(self.absPath, "a+", encoding='utf-8');
        self.proxiesFile = open("proxies.txt", "r+", encoding='utf-8');
        self.proxies = self.proxiesFile.read().split("\n");
    def write(self, content:str) -> bool:
        try:
            self.file.write(content);
        except:
            return False;
        return True;
    def getPosts(self, username:str, limit:int):
        if (limit < 0) or (limit > 500):
            raise Exception("Limit ayari 0-500 arasi olmalidir!");
        client = Client();
        if (len(self.proxies)>1):
            client.set_proxy(random.choice(self.proxies));
        try:
            client.load_settings(f"sessions/{GIRIS_YAPILACAK_KULLANICI}.json");
        except:
            client.dump_settings(f"sessions/{GIRIS_YAPILACAK_KULLANICI}.json");
        if (all(len(i) > 0 for i in [GIRIS_YAPILACAK_KULLANICI, GIRIS_YAPILACAK_KULLANICI_SIFRE])):
            client.login(GIRIS_YAPILACAK_KULLANICI, GIRIS_YAPILACAK_KULLANICI_SIFRE);

        medias = client.user_medias(client.user_id_from_username(username),amount=limit);
        for media in medias:
            dataToWrite:str = self.orderId + "|https://instagram.com/p/" + media.code+"|"+HIZMET+"\n";
            if (self.write(dataToWrite)):
                continue;
        print(f"Veriler yazdirildi! Konum: {self.absPath}\nstatusCODE=success");
if (__name__ == "__main__"):
    try:
        scraper:InstagramPostScraper = InstagramPostScraper(SIPARIS_ID);
        scraper.getPosts(HEDEF_HESAP, LIMIT);
    except Exception as e:
        raise Exception(str(e));
