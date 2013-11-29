# std is JavaScript standard #
std es un proyecto de código abierto que he comenzado por mi cuenta, con el único fin de reunir una serie de funcionalidades de uso frecuente en el desarrollo frontend. De esta manera std propone funciones para:

* atajos (getElement) y ejecución (ready) del DOM
* Manejo de estilos
* Comunicaciones AJAX
* Soporte a JSON (IE 7)
* Efectos y animaciones
* Manejador de eventos
* Compatibilidad con frameworks js

¿Por qué no utilizar una de las tantas librerías JavaScript del mercado, si están tan bien documentadas y son tan funcionales? tengo varias razones para utilizar y mantener este trabajo, tal vez algunas de ellas sean muy egocéntricas y otras más carezcan de sentido, pero son mis razones y estas son: rapidez de ejecución (hasta 80% más rápido que algunos frameworks populares), control absoluto del código, simplicidad y porque realmente amo a JavaScript como es, con sus virtudes y defectos.

## Premisas de std ##
* **Promover la simplicidad:** Keep It Simple, Stupid! de hecho soy un eterno creyente que el camino más sencillo casi siempre es el más efectivo.
* **Ocupar poco espacio:** Espero no llegar a pasar los 20k, de momento la librería pesa menos de 10k y no podría estar más contento de ello.
* **Dar prioridad a lo nativo:** Siempre es mejor usar las cosas nativas del lenguaje, en caso de las animaciones existe CSS y aunque no sea soportado por algunos navegadores, si es una animación estética es mucho mejor pasar de JavaScript.
* **Modificar lo menos posible la sintaxis JavaScript:** Aún que tal vez muchos no compartan mí opinión, para mí JavaScript es hermoso tal cual es y quiero mantenerlo así.
* **Continuar la legacía IE:** Hasta donde sea posible claro está, tampoco vamos a dar soporte a IE 6, pues ya ni Microsoft lo da.

## Consideraciones ##
Lógicamente std no ha sido testeado infinidad de veces como lo hacen "fameworks" más populares y por lo tanto es MUY posible que este plagado de errores y asuntos aún no resueltos, según he ido testeando el funcionamiento de la librería he observado que algunos errores son debido a algunas consideraciones que se deben tener en cuenta.

## Pruébalo en un servidor ##
Para realizar las pruebas AJAX se deben tener los archivos directamente en algún servidor, esta misma consideración debe ser tomada en cuenta para la utilización de hojas de estilos en Chrome, pues si se prueba de manera stand alone, puede presentar inconvenientes.

## Tú eres primero ##
Si vas a usar hojas de estilos o scripts ajenos a tú servidor (caso de redes sociales) no olvides que estas deben ser enlazadas al final del documento, esto se debe principalmente al modo como std recorre las hojas de estilos externas.

## Módulos externos ##
A partir de la versión 0.0.9 de la librería se acepta la inclusión de módulos externos (también conocidos como plugins), gracias a esta nueva característica se ha podido separar el módulo encargado de generar las ventanas speudomodales y su inclusión a la librería es opcional. La manera de crear módulos externos para la librería es la siguiente:

```javascript
(function($, window, undefined) {
	"use strict";
	/*#module*/
})(std, window);
```

Se usa std y no el alias, ya que std siempre va a estar apuntando inmodificable a la librería así se use cmode, gracias a esto se pueden encerrar funcionalidades en un solo ámbito que use la librería, de esta manera se evitan futuros problemas de incompatibilidad entre frameworks y std.

La estructura interna del módulo se puede dividir en tres bloques: la declaración de variables globales, las funciones internas y la exportación, la exportación del módulo se puede hacer por medio de $.extend en cuyo caso se debe extender el objeto std $ con el nuevo módulo que se ha creado, otra manera es usar $.dom.ready o su alias para que al momento de cargar el DOM y dependiendo de los atributos de algunos elementos se ejecuten las funciones dadas.

```javascript
(function($, window, undefined) {
	"use strict";
	// declaración de variables globales
	var FALSE = false,
		TRUE = true,
		NULL = null,
		document = window.document,
		core = {
			/*#code*/
		};

	//funciones intenarnas
	function fn (e) {
		/*#code*/
	}

	//Exportación del módulo por $.extend, $.dom.ready o ambas
	$ (function () {
		/*#code*/
	})

	$.extend($, {module: core});
})(std, window);
```