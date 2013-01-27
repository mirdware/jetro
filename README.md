<h1>std.js is JavaScript standard</h1>
<p>std.js es un proyecto de código abierto que he comenzado por mi cuenta, con el único fin de reunir una serie de funciones utilizadas frecuentemente con diferentes fines. De esta manera std.js propone funciones para:</p>

<ul>
	<li>atajos (getElement) y ejecución (ready) del DOM</li>
	<li>Manejo de estilos</li>
	<li>Comunicaciones AJAX</li>
	<li>Soporte a JSON (IE 7)</li>
	<li>Efectos y animaciones</li>
	<li>Manejador de eventos</li>
	<li>Compatibilidad con frameworks js</li>
</ul>
<p>¿Por qué no utilizar una de las tantas librerías JavaScript del mercado, si están tan bien documentadas y son tan funcionales? tengo varias razones para utilizar y mantener este trabajo, tal vez algunas de ellas sean muy egocéntricas y otras más carezcan de sentido, pero son mis razones y estas son: rapidez de ejecución (hasta 80% más rápido que algunos frameworks populares), control absoluto del código, simplicidad y porque realmente amo a JavaScript como es, con sus virtudes y defectos.</p>

<h2>Premisas de std.js</h2>
<ul>
	<li>
		<b>Promover la simplicidad:</b> Keep It Simple, Stupid! de hecho soy un eterno creyente que el camino más sencillo casi siempre es el más efectivo.
	</li>
	<li>
		<b>Ocupar poco espacio:</b> Espero no llegar a pasar los 20k, de momento la librería pesa menos de 10k y no podría estar más contento de ello.
	</li>
	<li>
		<b>Dar prioridad a lo nativo:</b> Siempre es mejor usar las cosas nativas del lenguaje, en caso de las animaciones existe CSS y aunque no sea soportado por algunos navegadores, si es una animación estética es mucho mejor pasar de JavaScript.
	</li>
	<li>
		<b>Continuar la legacía IE:</b> Hasta donde sea posible claro está, tampoco vamos a dar soporte a IE 6, pues ya ni Microsoft lo da.
	</li>
	<li>
		<b>Modificar lo menos posible la sintaxis JavaScript:</b> Aún que tal vez muchos no compartan mí opinión, para mí JavaScript es hermoso tal cual es y quiero mantenerlo así.
	</li>
</ul>

<h2>Consideraciones</h2>
<p>Lógicamente std.js no ha sido testeado infinidad de veces como lo hacen "fameworks" más populares y por lo tanto es MUY posible que este plagado de errores y asuntos aún no resueltos, según he ido testeando el funcionamiento de la librería he observado que algunos errores son debido a algunas consideraciones que se deben tener en cuenta.</p>

<h3>Pruébalo en un servidor</h3>
<p>Para realizar las pruebas AJAX se deben tener los archivos directamente en algún servidor, esta misma consideración debe ser tomada en cuenta para la utilización de hojas de estilos en Chrome, pues si se prueba de manera stand alone, puede presentar inconvenientes.</p>

<h3>Tú eres primero</h3>
<p>Si vas a usar hojas de estilos o scripts ajenos a tú servidor (caso de redes sociales) no olvides que estas deben ser enlazadas al final del documento, esto se debe principalmente al modo como std recorre las hojas de estilos externas.</p>

<h2>Módulos externos</h2>
<p>A partir de la versión 0.0.9 de la librería se acepta la inclusión de módulos externos (también conocidos como plugins), gracias a esta nueva característica se ha podido separar el módulo encargado de generar las ventanas speudomodales y su inclusión a la librería es opcional. La manera de crear módulos externos para la librería es la siguiente:</p>

```javascript
(function($, window, undefined) {
	/*#module*/
})(std, window);
```

<p>Se usa std y no el alias, ya que std siempre va a estar apuntando inmodificable a la librería así se use cmode, gracias a esto se pueden encerrar funcionalidades en un solo ámbito que use la librería, de esta manera se evitan futuros problemas de incompatibilidad entre frameworks y std.</p>

<p>La estructura interna del módulo se puede dividir en tres bloques: la declaración de variables globales, las funciones internas y la exportación, la exportación del módulo se puede hacer por medio de $.extend en cuyo caso se debe extender el objeto std $ con el nuevo módulo que se ha creado, otra manera es usar $.dom.ready o su alias para que al momento de cargar el DOM y dependiendo de los atributos de algunos elementos se ejecuten las funciones dadas.</p>

```javascript
(function($, window, undefined) {
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
