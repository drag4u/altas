Serviso diegimas:

```sudo nano /etc/systemd/system/altas.service```

Failo turinys:

```[Unit]
Description=Altas Node

[Service]
Environment=NODE_OPTIONS=--max-old-space-size=6144
ExecStart=/usr/bin/node /var/www/altas/index.js
Restart=on-failure

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
