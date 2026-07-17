# Respuestas técnicas

## ¿Cuáles fueron los principales desafíos que enfrentaste al implementar las nuevas funcionalidades?

El primer desafío fue incorporar categorías sin mezclar reglas de negocio, almacenamiento y componentes Ionic. Se resolvió con modelos y factories de dominio, contratos de repositorio, casos de uso y una facade reactiva. Esto permitió expresar reglas como conservar las tareas al eliminar su categoría sin introducir lógica condicional en la pantalla.

El segundo desafío fue integrar Firebase Remote Config sin convertir la red en una dependencia del arranque. La aplicación inicia la carga local y la configuración remota en paralelo, limita el fetch a tres segundos y conserva el último valor activado o el valor local predeterminado cuando Firebase no está disponible. La bandera `task_search_enabled` modifica una mejora visible, pero nunca desactiva los flujos obligatorios de tareas o categorías.

El tercer desafío fue mantener una experiencia fluida con listas grandes y almacenamiento síncrono. Fue necesario reducir deserializaciones, recorridos, ordenamientos y nodos Ionic renderizados sin alterar la consistencia de filtros, búsqueda y contadores.

Finalmente, la modernización móvil requirió sustituir plugins Cordova heredados por capacidades nativas de Cordova Android 15, migrar el splash screen, preparar iconos adaptativos y establecer una firma release reproducible sin versionar llaves ni contraseñas.

## ¿Qué técnicas de optimización de rendimiento aplicaste y por qué?

- `ChangeDetectionStrategy.OnPush` y Angular Signals para limitar actualizaciones de vista a cambios explícitos de estado.
- Renderizado incremental en lotes de 30 tareas para acotar el DOM y la memoria visual sin asumir una altura fija por fila.
- `track` por identificador estable para reutilizar componentes durante cambios de colección.
- Índice de categorías basado en `Map` para resolver nombres y colores en O(1) durante el render.
- Cálculo conjunto de contadores en una sola iteración.
- Consultas puras para ordenar, buscar y filtrar, lo que facilita medición y pruebas aisladas.
- Actualizaciones incrementales de Signals después de crear, completar o eliminar una tarea, evitando releer y reordenar todo el repositorio.
- Caché del estado deserializado en `VersionedLocalStore` para reducir acceso repetido a `localStorage` y creación de objetos temporales.
- Carga inicial de datos locales y Remote Config en paralelo, sin bloquear la interfaz por la red.
- Benchmark reproducible con 50.000 tareas para medir ordenamiento, conteo, búsqueda, filtro y extracción del lote de render.

Estas técnicas priorizan el coste real de la aplicación: cantidad de nodos Ionic, recorridos de arreglos, deserialización síncrona y trabajo innecesario de detección de cambios.

## ¿Cómo aseguraste la calidad y mantenibilidad del código?

La solución usa TypeScript estricto, identificadores en inglés y una arquitectura por capas. El dominio no depende de Angular, Ionic, Firebase ni del navegador. Repository, Use Case, Adapter y Facade permiten sustituir infraestructura y probar cada responsabilidad de forma aislada, en línea con Dependency Inversion y Single Responsibility.

Las reglas se validan en factories y casos de uso; los componentes solo coordinan interacción y presentación. La persistencia tiene un esquema versionado y recuperación segura ante JSON corrupto o versiones desconocidas. Firebase se consume detrás de un puerto de feature flags y su fallback se prueba sin depender del SDK real.

La suite automatizada cubre dominio, repositorios, migración y caché de persistencia, facade, Remote Config, fallback offline, listas grandes e interacciones de la pantalla principal. Cada fase se valida con Prettier, ESLint, typecheck, pruebas con cobertura, benchmark, build web y builds Android.

Las decisiones relevantes se conservan como ADR, el README documenta instalación y operación, el roadmap refleja el estado real y el changelog mantiene la historia. Las llaves de firma, contraseñas, cuentas de servicio y archivos generados permanecen fuera de Git.
