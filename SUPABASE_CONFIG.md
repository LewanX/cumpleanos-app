# Configuración de Supabase para el Panel Admin

## 📋 Pasos para configurar la autenticación con Google

### 1. Configurar Google OAuth en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Authentication** → **Providers**
3. Busca **Google** y haz click en **Enable**
4. Necesitarás obtener las credenciales de Google Cloud Console

### 2. Crear credenciales de Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services** → **Credentials**
4. Haz click en **Create Credentials** → **OAuth 2.0 Client ID**
5. Configura la pantalla de consentimiento si es necesario
6. Selecciona **Web application** como tipo de aplicación
7. Agrega las siguientes URLs autorizadas:
   - **Authorized JavaScript origins:**
     - `http://localhost:4200` (para desarrollo)
     - Tu URL de producción (ej: `https://tu-app.vercel.app`)

   - **Authorized redirect URIs:**
     - `https://TU_PROYECTO_ID.supabase.co/auth/v1/callback`
     - Reemplaza `TU_PROYECTO_ID` con tu ID de proyecto de Supabase

   **EJEMPLO (reemplaza con tus valores):**
   - Si tu proyecto es `mybmuuerkwwjxlgsisxj.supabase.co`
   - Entonces usa: `https://mybmuuerkwwjxlgsisxj.supabase.co/auth/v1/callback`

8. Copia el **Client ID** y **Client Secret**
9. Pégalos en la configuración de Google Provider en Supabase

### 3. Crear la tabla de usuarios autorizados

Ejecuta este SQL en el **SQL Editor** de Supabase:

```sql
-- Crear tabla de usuarios autorizados
CREATE TABLE usuarios_autorizados (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Habilitar Row Level Security
ALTER TABLE usuarios_autorizados ENABLE ROW LEVEL SECURITY;

-- Política para que solo usuarios autenticados puedan leer
CREATE POLICY "Usuarios autenticados pueden leer usuarios autorizados"
ON usuarios_autorizados FOR SELECT
TO authenticated
USING (true);

-- Insertar tu email como usuario autorizado
-- ⚠️ IMPORTANTE: Reemplaza 'tu-email@gmail.com' con tu email real
INSERT INTO usuarios_autorizados (email, nombre)
VALUES ('tu-email@gmail.com', 'Tu Nombre');
```

### 4. Agregar más usuarios autorizados

Para autorizar a más usuarios, ejecuta:

```sql
INSERT INTO usuarios_autorizados (email, nombre)
VALUES ('otro-email@gmail.com', 'Nombre del usuario');
```

### 5. Configurar la URL de redirección en tu aplicación

En el archivo `src/enviroment/enviroment.ts`, asegúrate de tener:

```typescript
export const environment = {
  supabaseUrl: 'TU_SUPABASE_URL',
  supabaseKey: 'TU_SUPABASE_ANON_KEY'
}
```

## 🎯 Cómo funciona

1. El usuario intenta acceder a `/admin`
2. Si no está autenticado, es redirigido a `/login`
3. Al hacer click en "Continuar con Google", se abre el popup de Google
4. Después de autenticarse, Supabase verifica si el email está en la tabla `usuarios_autorizados`
5. Si está autorizado, puede acceder al panel admin
6. Si no está autorizado, se cierra la sesión automáticamente

## 🔒 Seguridad

- Solo los emails en la tabla `usuarios_autorizados` pueden acceder
- La verificación se hace en el servidor (Supabase)
- Row Level Security (RLS) protege los datos
- Las sesiones expiran automáticamente

## 🚀 Rutas de la aplicación

- `/` - Página principal (invitación)
- `/login` - Login con Google
- `/admin` - Panel de administración (protegido)

## 🔧 Solución al problema de redirección a localhost:3000

Si después de autenticarte con Google te redirige a `http://localhost:3000` en vez de tu URL de producción:

### 1. Configura la URL del sitio en Supabase:
1. Ve a tu proyecto en Supabase Dashboard
2. **Settings** → **Authentication** → **URL Configuration**
3. En **Site URL**, pon tu URL de producción: `https://tu-app.vercel.app`
4. En **Redirect URLs**, agrega:
   - `http://localhost:4200/admin` (desarrollo)
   - `https://tu-app.vercel.app/admin` (producción)

### 2. Actualiza Google Cloud Console:
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Edita tu OAuth 2.0 Client ID
4. En **Authorized redirect URIs**, asegúrate de tener:
   - `https://mybmuuerkwwjxlgsisxj.supabase.co/auth/v1/callback`

### 3. Verifica las variables de entorno en Vercel:
Si usas Vercel, asegúrate de tener configuradas:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### 4. Limpia caché y vuelve a probar:
1. Cierra todas las sesiones de Supabase
2. Limpia la caché del navegador
3. Intenta de nuevo

## 📝 Notas importantes

- En desarrollo, usa `http://localhost:4200`
- En producción, actualiza las URLs en Google Cloud Console Y en Supabase Dashboard
- Mantén seguros tus Client ID y Client Secret
- Solo comparte acceso con personas de confianza
- El redirect se hace automáticamente a `${window.location.origin}/admin`
