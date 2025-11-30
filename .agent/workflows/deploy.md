---
description: Cómo desplegar el backend y frontend en el servidor
---

# Guía de Despliegue - Taller Diego

Este workflow describe cómo desplegar tanto el **backend** (FastAPI) como el **frontend** (HTML/CSS/JS) en el servidor usando una estructura de proyecto unificada.

## Requisitos Previos

- Acceso SSH al servidor
- Clave SSH configurada (ej: `~/.ssh/clave_deploy`)
- Proyecto ya clonado en el servidor en `/var/www/Taller-Diego`

---

## 1. Actualizar el Código en el Servidor

### 1.1. Opción A: Usar Git (Recomendado)

Si ya tienes el repositorio clonado en el servidor:

```bash
ssh -i ~/.ssh/clave_deploy soporte@tu_servidor
cd /var/www/Taller-Diego
git pull origin main
```

### 1.2. Opción B: Usar rsync desde tu máquina local

Si prefieres sincronizar archivos directamente:

```bash
rsync -avz --exclude='venv' --exclude='__pycache__' --exclude='.git' --exclude='node_modules' -e "ssh -i ~/.ssh/clave_deploy" . soporte@tu_servidor:/var/www/Taller-Diego/
```

---

## 2. Configurar y Ejecutar el Backend

### 2.1. Instalar dependencias (primera vez o si cambiaron)

```bash
ssh -i ~/.ssh/clave_deploy soporte@tu_servidor
cd /var/www/Taller-Diego
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2.2. Configurar variables de entorno

Crear el archivo `.env` en la carpeta `backend`:

```bash
nano /var/www/Taller-Diego/backend/.env
```

Agregar la configuración de base de datos:

```env
DATABASE_URL="postgresql://usuario:password@host:5432/nombre_bd"
```

Guardar con `Ctrl+O`, `Enter`, y salir con `Ctrl+X`.

### 2.3. Inicializar la base de datos (solo primera vez)

```bash
cd /var/www/Taller-Diego
source venv/bin/activate
export PYTHONPATH=/var/www/Taller-Diego/backend
python backend/database.py
```

### 2.4. Configurar como servicio systemd (Recomendado)

Crear el archivo de servicio:

```bash
sudo nano /etc/systemd/system/taller-backend.service
```

Contenido:

```ini
[Unit]
Description=Taller Diego Backend API
After=network.target

[Service]
User=soporte
Group=www-data
WorkingDirectory=/var/www/Taller-Diego/backend
Environment="PATH=/var/www/Taller-Diego/venv/bin"
Environment="PYTHONPATH=/var/www/Taller-Diego/backend"
ExecStart=/var/www/Taller-Diego/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8080
Restart=always

[Install]
WantedBy=multi-user.target
```

Activar y arrancar el servicio:

```bash
sudo systemctl daemon-reload
sudo systemctl enable taller-backend
sudo systemctl start taller-backend
sudo systemctl status taller-backend
```

### 2.5. Alternativa: Ejecutar con screen (desarrollo/testing)

```bash
screen -S taller_backend
cd /var/www/Taller-Diego/backend
source /var/www/Taller-Diego/venv/bin/activate
export PYTHONPATH=/var/www/Taller-Diego/backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

Presionar `Ctrl+A` + `D` para desconectar sin cerrar.

---

## 3. Configurar el Frontend con Nginx

### 3.1. Crear configuración de Nginx

```bash
sudo nano /etc/nginx/sites-available/taller-diego
```

Configuración:

```nginx
server {
    listen 5050;
    server_name _;  # Escucha en todas las IPs

    # Frontend - servir desde views
    location / {
        root /var/www/Taller-Diego/frontend/views;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Assets estáticos
    location /assets {
        alias /var/www/Taller-Diego/frontend/assets;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /styles {
        alias /var/www/Taller-Diego/frontend/styles;
        expires 7d;
        add_header Cache-Control "public";
    }

    location /scripts {
        alias /var/www/Taller-Diego/frontend/scripts;
        expires 7d;
        add_header Cache-Control "public";
    }

    # Proxy para el backend API (Puerto 8080)
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3.2. Activar la configuración

```bash
sudo ln -s /etc/nginx/sites-available/taller-diego /etc/nginx/sites-enabled/
sudo nginx -t  # Verificar sintaxis
sudo systemctl reload nginx
```

---

## 4. Verificación del Despliegue

### 4.1. Verificar el backend

```bash
# Desde el servidor
curl http://localhost:8000/
# Respuesta esperada: {"Hello":"World"}

# Probar endpoint de API
curl http://localhost:8000/api/v1/status
```

### 4.2. Verificar el frontend

En el navegador:
```
http://tu_dominio.com
```

O usando la IP:
```
http://IP_DEL_SERVIDOR
```

---

## 5. Actualizar el Despliegue

### 5.1. Actualizar código (usando Git)

```bash
ssh -i ~/.ssh/clave_deploy soporte@tu_servidor
cd /var/www/Taller-Diego
git pull origin main
```

### 5.2. Reiniciar backend (si hubo cambios)

```bash
sudo systemctl restart taller-backend
```

### 5.3. Frontend se actualiza automáticamente

No requiere reiniciar Nginx, los cambios son visibles inmediatamente.

---

## 6. Comandos Útiles

### Ver logs del backend

```bash
# Logs en tiempo real
sudo journalctl -u taller-backend -f

# Últimas 50 líneas
sudo journalctl -u taller-backend -n 50
```

### Ver logs de Nginx

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Gestionar el servicio del backend

```bash
sudo systemctl status taller-backend   # Ver estado
sudo systemctl stop taller-backend     # Detener
sudo systemctl start taller-backend    # Iniciar
sudo systemctl restart taller-backend  # Reiniciar
```

### Ver sesiones de screen activas

```bash
screen -ls                # Listar sesiones
screen -r taller_backend  # Reconectar a sesión
```

---

## 7. Configuración SSL/HTTPS (Opcional pero Recomendado)

### 7.1. Instalar Certbot

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

### 7.2. Obtener certificado SSL

```bash
sudo certbot --nginx -d tu_dominio.com
```

Certbot configurará automáticamente Nginx para usar HTTPS.

---

## Notas Importantes

> [!IMPORTANT]
> **Seguridad en Producción**: Cambia `allow_origins=["*"]` en `backend/main.py` a tu dominio específico

> [!WARNING]
> **Permisos**: Verifica que el usuario `soporte` y grupo `www-data` tengan permisos correctos en `/var/www/Taller-Diego`

> [!TIP]
> **Base de datos**: Asegúrate de que las credenciales en el archivo `.env` sean correctas antes de iniciar el backend

> [!CAUTION]
> **Firewall**: Asegúrate de que los puertos 80 y 443 estén abiertos en el firewall. El puerto 8000 NO debe estar expuesto públicamente (solo localhost)
