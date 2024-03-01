Aplikacijos diegimas:
1. Atsisiunčiame naujausią NODE.js (https://nodejs.org/en/download)
2. Nuklonuotoje repozitorijoje paleidžiame komandą: `npm install`
3. Įklijuojame data.zip turinį į pagrindinę direktoriją
4. Paleidžiame serverį `node index.js`

Serviso diegimas, kad automatiškai pasikeltų serveris:

```sudo nano /etc/systemd/system/altas.service```

Failo `altas.service` turinys:

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

Serviso įjungimas:
```
sudo systemctl enable altas.service
```

Serviso paleidimas:
```
sudo systemctl start altas.service
```

Serviso statusas:
```
sudo systemctl status altas.service
```
