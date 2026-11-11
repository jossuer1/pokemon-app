# Generar un APK firmado y publicarlo en Uptodown

## Preparar esta aplicación

La rama master incluye inicio, Pokédex, comparador, estadísticas e iconos.
Android usa actualmente `applicationId "io.ionic.starter"`, versión `1.0`
y `versionCode 1`. Antes de la primera publicación conviene elegir un
identificador propio definitivo (por ejemplo, `com.jossuer1.pokedex`).
Si cambias el identificador, actualiza `appId` en `capacitor.config.ts`,
`applicationId` en `android/app/build.gradle` y las cadenas `package_name`
y `custom_url_scheme` de `android/app/src/main/res/values/strings.xml`.
Puedes mantener el namespace y el paquete Java de MainActivity actuales.
Si ya publicaste esta aplicación, conserva su identificador y su clave originales.

Configura JDK 21 como Gradle JDK en Android Studio. El SDK de este proyecto
es Android 36 y su mínimo es Android 7.0 (API 24).

Desde PowerShell, en la raíz del proyecto:

```powershell
npm.cmd ci
npm.cmd run build
npx.cmd cap sync android
npx.cmd cap open android
```

Se usa `.cmd` para funcionar también cuando PowerShell bloquea `npm.ps1`.

## Crear la firma y el APK

1. En Android Studio abre el proyecto `android` y espera la sincronización de Gradle.
2. Selecciona **Build > Generate Signed App Bundle or APK > APK**.
3. En **Key store path**, selecciona tu clave existente o **Create new** si es la primera publicación.
4. Guarda el archivo `.jks` en una ubicación privada. Elige contraseñas fuertes,
   un alias como `pokedex-release` y una validez de al menos 25 años.
   Completa los datos del certificado con tus propios datos.
5. Selecciona el módulo `app`, la variante **release** y genera el APK.
   Si aparecen opciones de firma, habilita V1 y V2.
6. Usa **Locate** al finalizar para localizar el APK firmado. Según la versión
   de Android Studio y el destino elegido, puede quedar en `android/app/release/`
   o en `android/app/build/outputs/apk/release/`.
7. Comprueba la firma usando la ruta real del APK:

```powershell
& 'C:\Android\Sdk\build-tools\36.0.0\apksigner.bat' verify --verbose --print-certs 'RUTA\app-release.apk'
```

Conserva dos respaldos privados del `.jks`, su alias y las contraseñas.
Necesitarás la misma clave para todas las actualizaciones. No subas la clave
ni contraseñas a GitHub ni a Uptodown. El `.gitignore` excluye `.jks`,
`.keystore` y `keystore.properties`. Esta guía no crea ni almacena contraseñas.

Instala el APK release en un teléfono y verifica inicio, búsquedas, filtros,
estadísticas, comparador, imágenes y sonidos. Requiere internet.
Si existe una instalación debug con otra firma, Android no permite actualizarla
con este APK; usa otro dispositivo o desinstálala teniendo en cuenta sus datos.

## Enviar a Uptodown

1. Regístrate en https://developers.uptodown.com/ y completa tu organización.
2. En **Apps > Add new app**, elige Android y adjunta el **APK release firmado**.
3. Completa nombre, autor, categoría, edad recomendada y sitio web.
4. Adjunta icono PNG cuadrado (recomendado: mínimo 256 × 256) y capturas reales.
   En `docs/screenshots/` hay capturas del proyecto; revisa que correspondan a esta versión.
   El banner promocional opcional debe medir 1024 × 500.
5. Añade una descripción corta de hasta 70 caracteres y una larga de al menos
   50 palabras. Declara correctamente anuncios, compras y licencia.
6. Revisa los criterios de publicación, incluidos los derechos sobre nombres,
   imágenes y sonidos de Pokémon. Usa una presentación que identifique claramente
   la aplicación como un proyecto independiente y comprueba que puedes distribuir sus recursos.
7. Pulsa **Submit for review**. El envío pasa por revisión; no publica inmediatamente.

Descripción corta sugerida:

> Consulta criaturas, escucha sonidos y compara sus estadísticas.

Descripción larga sugerida:

> Explora una enciclopedia de criaturas con búsqueda por nombre o número,
> filtros y fichas de información. Consulta tipos, habilidades, dimensiones
> y estadísticas, visualiza imágenes y animaciones y escucha los sonidos de
> cada personaje. Compara dos criaturas en una misma pantalla y revisa los
> gráficos de estadísticas disponibles. La aplicación necesita conexión a
> internet para obtener información y recursos multimedia. Proyecto independiente
> desarrollado por Josue Patiño y Ariana Villota.

Para actualizaciones, incrementa `versionCode` en `android/app/build.gradle`,
ajusta `versionName`, vuelve a compilar/sincronizar y firma con la misma clave.

## Fuentes oficiales

- https://developer.android.com/studio/publish/app-signing
- https://support.uptodown.com/hc/en-us/articles/360053260491-How-to-publish-an-app-on-Uptodown
- https://support.uptodown.com/hc/en-us/articles/4424141383181-Basic-guide-to-register-and-publish-apps-on-Uptodown
