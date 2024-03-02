**Programos veikimo principas:**
1. Visa aplikacija yra nodejs serveris su atviru express `3000` http portu. Jokie papildomi portai nebūtini. SSL palaikymas neįdiegtas. Duomenų bazė yra pilnai savarankiškas `sqlite3` package'as. Jokie papildomi servisai duombazei nereikalingi.
2. Neradus duomenų bazės failo, nauja duombazė ir jos struktūra sukuriama automatiškai.
3. Visa vartotojo sąsaja yra vanila `javascript`, `html` ir `css`, nenaudojami jokie frameworkai, tik vienas templeitavimo modulis - `ejs`.
4. Programa įrašinėja logus į atskirą failą kiekvieną dieną, kad nebūtų blackbox.

**Serveriui reikalingi bent jau 8GB RAM, nes generuojant didelius failus būna Out of Memory klaida. Reikia suteikti javascripto heap bentjau 6GB RAM (yra pavyzdys žemiau).**  
Migruojant serverį, reikia perkelti visą `./data` direktoriją, nes joje yra logai, duombazė ir šablonų failai. 
**Būtina suteikti pilnus permissionus `data` ir `static` direktorijoms!**

**Aplikacijos diegimas:**
1. Atsisiunčiame naujausią NODE.js (https://nodejs.org/en/download)
2. Nuklonuotoje repozitorijoje paleidžiame komandą: `npm install`
3. Įklijuojame data.zip turinį į pagrindinę direktoriją
4. Paleidžiame serverį `node index.js`

Automatiškai pasikeliančio serviso (jeigu užlūžtu serveris dėl veikimo klaidos) diegimo instrukcija:

```sudo nano /etc/systemd/system/altas.service```

**Failo `altas.service` turinys:**

```
[Unit]
Description=Altas Node

[Service]
ExecStart=/bin/bash -c "NODE_OPTIONS=--max-old-space-size=6144 /usr/bin/node /var/www/altas/index.js"
Restart=on-failure
WorkingDirectory=/var/www/altas

[Install]
WantedBy=multi-user.target
```

**Serviso įjungimas:**
```
sudo systemctl enable altas.service
```

**Serviso paleidimas:**
```
sudo systemctl start altas.service
```

**Serviso statusas:**
```
sudo systemctl status altas.service
```
