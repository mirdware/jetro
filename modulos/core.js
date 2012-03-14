(function(frame, window, document, undefined) {
var TRUE = true,
	FALSE = false,
	NULL = null,
	std = {
		/****** NUCLEO ******/
		/**
			Engloba la ejecución de varios getElements, para esto se usa un unico prefijo antes del nombre del identificador.
			Los prefijos permitidos son:
			# = getElementById
			. = getElementsByClassName
			@ = getElementByName
			Si se omite el prefijo se utilizara getElementsByTagName.
			@param: {string} id es el identificador del nodo que se busca, este identificador puede ser un id, una clase, un nombre o una etiqueta
			@param: {element} node es el padre del elemento que se busca
			@param: {string} tag es opcional y se utiliza para agilizar la busqueda de clases, es el tipo de etiqueta de la clase
			@return: El nodo o serie de nodos que se buscan con esta función
		*/
		$: function (id, node, tag) {
			var name = id.substr(1),
				prefix = id.charAt(0);
			
			if (prefix == "#") {
				return document.getElementById(name);
			}
			node || (node = document);
			if(prefix == "@") {
				return node.getElementsByName(name);
			}
			if (prefix == ".") {
				if (node.getElementsByClassName) {
					return node.getElementsByClassName(name);
				}
				tag || (tag = "*");
				var classElements = [],
					els = std.$(tag),
					pattern = new RegExp("(^|\\s)"+name+"(\\s|$)");
				for (var i=0,el, j=0; el=els[i]; i++) {
					if ( pattern.test(el.className) ) {
						classElements[j] = el;
						j++;
					}
				}
				return classElements;
			}
			return node.getElementsByTagName(id);
		},
		
		/**
			Revisa si el DOM está listo para usarse. Es más util que el window.onload pues este debe esperar 
			a que todos los elementos de la pagina esten cargados (como scripts e imagenes) para ejecutar.
			@return: La api publica consta de una unica función que pide como parametro la función a ejecutar
		*/
		ready: (function(){
			var fns = [],
				read = FALSE;
			
			/**
				Revisa constantemente (cada 100 milisegundos) si el readyState del documento se encuentra completo,
				de ser asi se procesa la cola de ejecución.
				@param: {undefined} fn se utiliza como parte de XP (eXtreme Programming) para no inicializar el fn que toma 
						valores dentro del while
			*/
			function action(fn) {
				if(document.readyState == "complete") {
					while(fn = fns.shift()) {
						fn();
					}
				} else {
					setTimeout(action, 100);
				}
			}
			
			/**
				Coloca en cola de ejecución una función para ser procesada cuando el DOM se encuentre completamente listo,
				si es la primera vez que se llama se ejecuta la función encargada de revisar el estado del documento.
				@param: {function} fn se ejecuta cuando se carga el DOM
			*/
			return function(fn) {
				fns.push(fn);
				if(!read) {
					action();
					read = TRUE;
				}
			}
		})(),
		
		/**
			Extiende o copia las propiedades de un objeto origen en otro objeto destino. Las propiedades del objeto origen se
			sobreescriben en el objeto destino.
			@param: {object} src es el objeto origen
			@param: {object} target es el objeto destino
			@return El objeto destino extendido con las propiedades del objeto origen
		*/
		extend: function (target, src) {
			for (var prop in src) {
				target[prop] = src[prop];
			}
			return target;
		}
	}
	
	std.extend(frame, std);
	/****** JSON ******/
if(typeof window.JSON == "undefined") {
	window.JSON = {
		/**
			Genera una cadena JSON valida partiendo de un objeto javascript sin funciones.
			@param: {object} obj es el objeto suministrado para ser parseado a String
			@return: Una cadena formateada correctamente como JSON
			@deprecated
		*/
		stringify: function(obj) {
			if (!(obj instanceof Object)) {
				return;
			}
			var isArray = (obj instanceof Array),
				strJSON = isArray?"[":"{";
				
			for(var key in obj) {
				if(obj[key] instanceof Object) {
					if(!isArray) {
						strJSON += '"'+key+'" : ';
					}
					strJSON += JSON.stringify(obj[key])+", ";
				} else if(typeof obj[key] != "function") {
					if(!isArray) {
						strJSON += '"'+key+'" : ';
					}
					strJSON += '"'+obj[key]+'", ';
				}
			}
			
			return strJSON.substr(0, strJSON.length-2) + (isArray?" ]":" }");
		},
		/**
			Crea un objeto partiendo de una cadena JSON correctamente formateada.
			@param: {String} str es un string que debe se parseado a un objeto javascript
			@return: Dependiendo si es una cadena JSON valida se retornara el objeto, en caso contrario no se retorna nada
			@deprecated
		*/
		parse: function(strJSON) {
			if (typeof strJSON != "string") {
				return;
			}
			strJSON = strJSON.trim();
			if (/^\{|\[[\n\s]*"[a-zA-Z\$_][a-zA-Z\$\d_]*"[\n\s]*:.+\}|\]$/.test(strJSON)) {
				var exp1 = strJSON.replace(/[\{\}\[\]]/g,""),
					frag = exp1.match(/[a-z]+|(['"]).*?\1/g);
				exp1 = exp1.replace(/[a-z]+|(['"]).*?\1/g,"#?replace#").split(",");
				
				for (var i=0,dat1; dat1=exp1[i]; i++) {
					if (dat1.indexOf(":") == -1) {
						if (dat1.trim() == "#?replace#") {
							dat1 = frag.shift();
						}
						if (!/^[\n\s]*(".+")|(\+|-)?\d+[\n\s]*$/.test(dat1)){
							return;
						}
					} else {
						var exp2 = dat1.split(":");
						for(var j=0,dat2; dat2=exp2[j]; j++) {
							if (dat2.trim() == "#?replace#") {
								dat2 = frag.shift();
							}
							if (j<exp2.length-1) {
								if (!/^[\n\s]*"[a-zA-Z\$_][a-zA-Z\$\d_]*"[\n\s]*$/.test(dat2)) {
									return;
								}
							} else if(!/^[\n\s]*(".+")|(\+|-)?\d+[\n\s]*$/.test(dat2)) {
								return;
							}
						}
					}
				}
				return window[ "eval" ]("("+strJSON+")");;
			}
			return;
		}
	}
}
})(std = {}, window, document);