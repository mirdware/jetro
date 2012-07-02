<h1>std.js</h1>
<p><a href="http://std.mirdware.co.cc">Std.js</a> es un proyecto de código abierto que he comenzado por mi cuenta, con el único fin de reunir una serie de funciones utilizadas frecuentemente con diferentes fines. De esta manera std.js posee funciones para:</p>
<ul>
	<li>Generación de ventanas pseudomodales</li>
	<li>Comunicaciones AJAX</li>
	<li>Soporte a JSON (IE 7 y 8)</li>
	<li>Efectos y animaciones</li>
	<li>Manejador de eventos</li>
</ul>
<p>¿Por que no utilizar una de las tantas librerías JavaScript del mercado, si están tan bien documentadas y son tan funcionales? tengo varias razones para utilizar y mantener este trabajo, tal vez algunas de ellas sean muy egocentricas y otras más carescan de sentido, dentro de estas razones estan: rapidez de ejecución (hasta 80% más rapido que algunos frameworks populares), control absoluto del codigo, simplicidad y por que realmente amo a javascript como es, con sus virtudes y defectos.</p>
<h2>Consideraciones</h2>
<p>Logicamente std.js no ha sido testeado infinidad de veces como lo hacen "fameworks" más populares y por lo tanto es MUY posible que este pragado de errores y asuntos aún no resueltos, según he ido testeando el funcionamiento de la libreria he observado que algunos errores son debido a algunas consideraciones que se deben tener en cuenta.</p>
<h3>Pruebalo en un servidor</h3>
<p>Para realizar las pruebas AJAX se deben tener los archivos directamente en algún servidor, esta misma consideración debe ser tomada en cuenta para la utilización de hojas de estilos en Chrome, pues si se prueba de manera stand alone, puede presentar inconvenientes.</p>