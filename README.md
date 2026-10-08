# 🗺️ Mapa Interactivo de Oferta Educativa - ESRN Rural Virtual

Mapa interactivo + Asistente Ovejita (chatbot de recomendación de ofertas educativas) para estudiantes de la ESRN Rural Virtual en Río Negro.

## 📋 Características

- **651 carreras** de oferta educativa provincial
- **27 anexos ESRN Rural** geolocalizados
- **23 localidades** principales con oferta educativa
- **Filtros** por tipo de formación, área temática y modalidad
- **Control deslizador** para ajustar radio de búsqueda (10-500km)
- **Chatbot orientador** con sistema de recomendación de ofertas educativas
- **Búsqueda** por nombre de carrera o institución
- **Geolocalización** para encontrar la oferta más cercana
- **Responsive** - funciona en desktop, tablet y móvil

## 🚀 Cómo usar

### Opción 1: Archivo local
1. Descargue o clone este repositorio
2. Abra el archivo `index.html` en su navegador
3. ¡Listo! No requiere servidor web

### Opción 2: GitHub Pages (recomendado)
Siga las instrucciones en la sección [Subir a GitHub Pages](#-subir-a-github-pages)

## 📁 Estructura del proyecto

```
esrn-rural-mapa/
├── index.html              # Mapa principal
├── chatbot.html            # Asistente Ovejita (recomendación de ofertas)
├── css/
│   ├── styles.css          # Estilos personalizados
│   ├── leaflet.css         # Estilos de Leaflet
│   └── images/             # Iconos del mapa
├── js/
│   ├── app.js              # Lógica principal del mapa
│   ├── data.js             # Datos de ofertas educativas
│   ├── anexos.js           # Coordenadas de anexos ESRN
│   └── leaflet.js          # Librería Leaflet
├── images/                 # Iconos de marcadores
└── README.md               # Este archivo
```

## 🛠️ Tecnologías utilizadas

- **Leaflet.js** - Librería de mapas interactivos
- **OpenStreetMap** - Mapas base gratuitos
- **HTML5/CSS3/JavaScript** vanilla

---

## 🚀 Subir a GitHub Pages

### Paso 1: Crear repositorio en GitHub

1. Ingrese a [github.com](https://github.com)
2. Haga clic en **"+"** → **"New repository"**
3. Nombre: `esrn-rural-mapa`
4. Descripción: "Mapa interactivo de oferta educativa ESRN Rural"
5. Seleccione **Public**
6. Haga clic en **"Create repository"**

### Paso 2: Subir archivos

#### Opción A: Usando Git (recomendado)

```bash
# Clonar el repositorio
git clone https://github.com/SU_USUARIO/esrn-rural-mapa.git

# Copiar los archivos del proyecto a la carpeta clonada

# Agregar archivos
cd esrn-rural-mapa
git add .

# Commit
git commit -m "Initial commit: Mapa interactivo ESRN Rural"

# Push
git push origin main
```

#### Opción B: Subir por la web

1. En su repositorio, haga clic en **"uploading an existing file"**
2. Arrastre TODA la carpeta del proyecto (index.html, chatbot.html, css/, js/, images/)
3. Haga clic en **"Commit changes"**

### Paso 3: Activar GitHub Pages

1. Vaya a **Settings** → **Pages** (en el menú lateral)
2. En **Source**, seleccione **"Deploy from a branch"**
3. En **Branch**, seleccione **"main"** y carpeta **"/ (root)"**
4. Haga clic en **Save**

### Paso 4: Acceder a su sitio

Espere 1-2 minutos y luego acceda a:
```
https://SU_USUARIO.github.io/esrn-rural-mapa/
```

### Ejemplo:
Si su usuario es `mi-usuario`, la URL será:
```
https://mi-usuario.github.io/esrn-rural-mapa/
```

---

## 🎯 Funcionalidades del Chatbot

El Asistente Ovejita incluye:

1. **Selección de anexo ESRN** - Elegí tu comunidad
2. **Pregunta de movilidad** - Si podés trasladarte o no
3. **Áreas de interés** - Se filtran según tu movilidad
4. **Modalidad** - Presencial, virtual o semipresencial
5. **Duración** - Formación rápida, tecnicatura o grado
6. **Sistema de recomendación de ofertas educativas** - Puntuación de carreras según tu perfil
7. **Fallback** - Si no hay resultado exacto, muestra opciones similares

## 📊 Estadísticas

- **Tecnicaturas:** 262 (40.2%)
- **Grado:** 190 (29.2%)
- **Formación Profesional:** 141 (21.7%)
- **Ciclo Complementario:** 21 (3.2%)
- **Posgrados:** 19 (2.9%)

---

## 📝 Créditos

- **Desarrollado por:** Unidad Provincial de Enlace con las Universidades (UPEU)
- **Fuente de datos:** Portal Tu Vocación - Gobierno de Río Negro
- **Mapas:** OpenStreetMap contributors
- **Librería de mapas:** Leaflet.js

## 📄 Licencia

Este proyecto es de código abierto. Siéntase libre de usarlo y modificarlo.
