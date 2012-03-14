/**
	std.js 
	Es un script generico en el que se abarcan varias funciones comunes para la realización de trabajos 
	no solo en javascript, si no tambien orientados a AJAX (Asynchronous JavaScript And XML) y con 
	soporte para JSON. Todo esto basandose en una interfaz sumamente sencilla.
	
	Para buscar secciones dentro del documento utiliza "****** sección ******" sin comillas, las secciones de std son:
		NUCLEO: Se encuentran las funciones principales de std. (ready, $, extend)
		EVENTOS: Contiene manejadores de eventos dentro del objeto evt. (add, remove, on)
		ESTILOS: Se encuentra el manejador de estilos css que gestiona tanto elementos como reglas.
		AJAX: Mediante el objeto ajax se encarga de realizar peticiones asincronas al servidor.
		EFECTOS ESPECIALES: Contiene funciones dentro del objeto sfx encargadas de pequeñas animaciones.
		VENTANA MODAL: Encargada de generar y mantener las ventanas speudomodales.
		FUNCIONES PRIVADAS: Se hallan las funciones a las que más de 1 modulo tiene que tener acceso.
		CONFIGURACION DE ENTORNO: Se configura todo lo que no involucra directamente a std, en especial el entorno de ejecución.
		JSON: Hace parte de la configuración de entorno. Se encarga de registrar el objeto JSON a window cuando este no existe.
	
	El camino más sencillo casi siempre es el más rapido y efectivo. Recuerda Keep It Simple, Stupid!!
	@author: Marlon Ramirez
	@version: 0.0.8
*/
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
		},
		
		/****** EVENTOS ******/
		evt: (function() {
			var core = {
				/**
					Realiza la captura de ciertos eventos a un elemento.
					@param: {element} element es el elemento al cual se le va a asignar el evento
					@param: {string} nEvent es el nombre del evento que va a ser asignado
					@param: {function} fn es la funcion que se encargara de manejar el evento
					@param: {boolean} capture estable el flujo de eventos TRUE si es capture y FALSE si es bubbling
				*/
				add: function(element, nEvent, fn, capture) {
					if(loops(element, nEvent, fn, capture)) {
						if (element.attachEvent) {
							var f= function(){
								fn.call(element,event);
							}
							element.attachEvent("on"+nEvent,f);
							element[fn.toString()+nEvent] = f;
						} else if (element.addEventListener) {
							element.addEventListener(nEvent,fn,capture);
						} else {
							element["on"+nEvent] = fn;
						}
					}
				},
				
				/**
					Realiza la remoción de ciertos eventos a un elemento.
					@param: {element} element es el elemento al cual se le va a desasignar el evento
					@param: {string} nEvent es el nombre del evento que va a ser desasignado
					@param: {function} fn es la funcion que se encuentra manejando el evento
					@param: {boolean} capture establece como ocurria el flujo de eventos TRUE si es capture y FALSE si es bubbling 
				*/
				remove: function(element, nEvent, fn, capture){
					if(loops(element, nEvent, fn, capture)) {
						if (element.detachEvent){
							element.detachEvent("on"+nEvent,element[fn.toString()+nEvent]);
							element[fn.toString()+nEvent] = NULL;
						} else if (element.removeEventListener){
							element.removeEventListener(nEvent,fn,capture);
						} else{
							element["on"+nEvent] = function(){};
						}
					}
				},
				
				/**
					Se encarga de poner a escuchar a un elemento los eventos que generan sus hijos, tiene como principal pilar el burbujeo 
					del evento, por lo cual no son soportados los eventos que no burbujean
					@param {element} element es el elemento que va a "observar" a sus elementos hijos
					@param {string} observe es el selector de los hijos que se van a observar, los prefijos utilizados son los mismos que para $
					@param {string} nEvent es el nombre del evento que va a ser asignado
					@param {function} fn es la funcion que se les asiganara a los elementos onservados
					@param {boolean} capture establece como ocurria el flujo de eventos TRUE si es capture y FALSE si es bubbling
				*/
				on: function(element, observe, nEvent, fn, capture) {
					if(loops(element, nEvent, fn, capture, observe)) {
						var prefix = observe.charAt(0),
							type = 	(prefix == "#")?"id":
									(prefix == ".")?"className":
									(prefix == "@")?"name":
									"nodeName",
							name = (type=="nodeName")?observe.toUpperCase():observe.substr(1);
						core.add(element, nEvent, function() {
							var t = core.get().target;
							if(observe == "*") {
								fn.apply(t, arguments);
							} else {
								while(t && t !== element) {
									if(t[type].indexOf(name) != -1) {
										fn.apply(t, arguments);
									}
									t = t.parentNode;
								}
							}
						}, capture);
					}
				},
				
				/**
					Se encarga de generar un objeto evento con un formato unico permitiendo asi una solución crossbrowser.
					@return: El evento formateado para su correcto uso
				*/
				get: function() {
					var e = window.event;	
					if (e) {
						if( navigator.appName == "Opera") {
							return e;
						}
						e.charCode = (e.type == "keypress") ? e.keyCode : 0;
						e.eventPhase = 2;
						e.isChar = (e.charCode > 0);
						e.pageX = e.clientX + document.body.scrollLeft;
						e.pageY = e.clientY + document.body.scrollTop;
						
						e.preventDefault = function() {
							this.returnValue = FALSE;
						};
						
						if (e.type == "mouseout") {
							e.relatedTarget = e.toElement;
						} else if (e.type == "mouseover") {
							e.relatedTarget = e.fromElement;
						}
							
						e.stopPropagation = function() {
							this.cancelBubble = TRUE;
						};
							
						e.target = e.srcElement;
						e.time = (new Date).getTime();
						return e;
					} else {
						return core.get.caller.arguments[0];
					}
				}
			};
			
			/**
				Cuando un evento va a realizar multiples asignaciones tanto de funciones como de elementos, estas asignaciones se deben
				realizar por medio de ciclos, de esta manera se garatiza una ejecución limpia de los asignadores de eventos.
				@param {element} element es el o los elemento a los cuales se les va a asignar el evento
				@param {string} nEvent en caso de ser un objeto, tomara los valores de nEvent y fn dentro de una asignación limpia
				@param {function} fn tomara el valor de capture si nEvent es un objeto 
				@param {boolean} capture en caso de nEvent ser un objeto debera ser nulo y no se tomara en cuenta
				@param {string} observe puede ser undefined lo que indica que fue llamado desde add o remove
			*/
			function loops(element, nEvent, fn, capture, observe) {
				var caller = loops.caller;
				if(element.length) {
					for(var i=0; el = element[i]; i++) {
						caller(el, nEvent, fn, capture);
					}
					return FALSE;
				}
				if(nEvent instanceof Object) {
					for(var attr in nEvent) {
						if(observe) {
							caller(element, observe, attr, nEvent[attr], fn);
						} else {
							caller(element, attr, nEvent[attr], fn);
						}
					}
					return FALSE;
				}
				return TRUE;
			}
			
			return core;
			
		})(),
		
		/****** ESTILOS ******/
		css: (function(parseInt){
			var div = document.createElement("b").style;
			
			/**
				Busca selectores CSS dentro de las hojas de estilos del documento que coincidan con la regla de estilo pasada como parametro,
				en caso de encontrarla procede a eliminarla o retornarla segun sea el caso.
				@param: {String} ruleName es el selector de la regla de estilo a buscar
				@param: {boolean} deleteFlag especifica si se desea o no eliminar la regla de estilo
				@return: Retorna la regla de estilo, si se paso como verdadero deleteFlag retorna TRUE si elimino la regla, en caso de 
						 no encontrala retorna FALSE.
			*/
			function getCSSRule(ruleName, deleteFlag) {		
				for (var i=0,styleSheet; styleSheet=document.styleSheets[i]; i++) {
					var cssRules = styleSheet.cssRules || styleSheet.rules;
					for(var j=0,cssRule; cssRule=cssRules[j]; j++){
						if (cssRule.selectorText == ruleName) {
							if (deleteFlag) {
								if (styleSheet.cssRules) {
									styleSheet.deleteRule(j);
								} else {
									styleSheet.removeRule(j);
								}
								return TRUE;
							} else {
								return cssRule;
							}
						}
					}
				}
				return FALSE;
			}
			
			/**
				Aplica ciertos cambios a una propiedad CSS para que esta resulte estandar al usuario y pueda ser una solución crossbrowser.
				Al ser el argumento un array este es pasado por referencia.
				@param: {Array} args son los argumentos pasados a la función que la invoco (get o set) 
			*/
			function normalize(args) {
				if(args[0] == "opacity" && div[args[0]] == undefined) {
					args[0] = "filter";
					args[1] = "alpha(opacity='"+args[1]*100+"')";
				}
			}
			
			/**
				Establece si se va a trabajar el estilo sobre una regla css o sobre el elemento directamente, en caso que una regla css no exista 
				esta función la crea. Tambien establece los metodos get y set de las propiedades css del elemento.
				@param: {String || element} ruleName es el selector de la regla de estilo a buscar o directamente el elemento con el cual trabajar
				@param: {boolean} deleteFlag especifica si se elimina una regla css, en caso de ruleName no ser una regla css este parametro 
						sera omitido
				@return: El objeto con los metodos get y set necesarios para trabajar los estilos de manera correcta y estandarizada
			*/
			return function(ruleName, deleteFlag) {
				var obj;
				if(typeof ruleName == "string") {
					if(deleteFlag) {
						getCSSRule(ruleName, deleteFlag)
					} else {
						if (!getCSSRule(ruleName)) {
							if (document.styleSheets[0].addRule) {
								document.styleSheets[0].addRule(ruleName, NULL,0);
							} else {
								document.styleSheets[0].insertRule(ruleName+" { }", 0);
							}
						}
						obj = getCSSRule(ruleName);
					}
				} else {
					obj = ruleName;
				}
				return {
					/**
						Formatea correctamente la salida del valor de las propiedades del elemento.
						@see: FUNCIONES PRIVADAS
						@param: {String} prop es el nombre de la propiedad que se desea obtener
						@return: El valor de la propiedad que se a pasado como parametro				
					*/
					get: function(prop) {
						normalize(arguments);
						var style = (obj != ruleName)?obj.style[prop]:(obj.currentStyle || document.defaultView.getComputedStyle(obj, ""))[prop];
						//unificar a rgb la salida de colores
						if(style.indexOf("#") == 0) {
							temp = hexToRGB(style);
							style = "rgb("+temp[0]+", "+temp[1]+", "+temp[2]+")";
						}
						if(prop == "filter") {
							style = (style == "")?"1":(parseInt(style.replace(/[^\d]/g,""))/100)+"";
						}
						return style;
					},
					
					/**
						Establece o modifica las propiedades de estilo al elemento o regla css, teniendo en cuenta la estandarización de 
						las mismas.
						@param: {String} prop es la propiedad que se desea establecer o modificar, si es un objeto se procedera en ciclo
						@param: {String} value es el nuevo valor que tomara la propiedad, en caso de prop ser un objeto este argumento sera omitido
					*/
					set: function(prop, value) {
						if(prop instanceof Object) {
							for(var attr in prop) {
								this.set(attr, prop[attr]);
							}
						} else {
							normalize(arguments);
							obj.style[prop] = value;
						}
					}
				};
			}
			
		})(parseInt),
		
		/****** AJAX ******/
		ajax: {
			/**
				Crea un objeto XMLHttpRequest crossbrowser
				@return: El objeto XMLHttpRequest dependiendo del browser en el que se realize la petición
			*/
			xhr: function() {
				try {
					return new XMLHttpRequest();
				} catch(e1) {
					try {
						return new ActiveXObject("Microsoft.XMLHTTP");
					} catch(e2) {
						try {
							return new ActiveXObject("Msxml2.XMLHTTP");
						} catch(e3) {
							return NULL;
						}
					}
				}
			},
			
			/**
				Realiza una petición asincrona al servidor
				@param: {String} url es la ruta del archivo del servidor que procesara la solicitud
				@param: {function} callback es la función que establece el comportamiento cuando el servidor retorna una respuesta 200
				@param: {object} opt es el conjunto de opciones que se le puede pasar al metodo, estas opciones son:
					response: Tipo de respuesta, puede ser text (por defecto) o XML
					feedback: Función que establece un comportamiento cuando el servidor no retorna una respuesta 200
					data: Datos que se envian al servidor desde el cliente
					method: Metodo utilizado para enviar los datos, puede ser POST (por defecto) o GET
					syn: Valor booleano que dice si la petición es sincrona, por defecto es false y la petición se realiza de modo asincrono
			*/
			request: function(url, callback, opt) {
				opt || (opt = {});
				var xmlHttp =std.ajax.xhr(),
					response = (opt.response || "Text").toUpperCase(),
					feedback = opt.feedback,
					data = opt.data,
					method = (opt.method || "POST").toUpperCase(),
					asyn = !opt.syn;
				
				xmlHttp.onreadystatechange = function() {
					if (xmlHttp.readyState == 4) {
						if (xmlHttp.status == 200) {
							var r = (response == "XML")?xmlHttp.responseXML:xmlHttp.responseText;
							callback(r);
						} else if (feedback) {
							feedback(xmlHttp.status);
						}
					} else if (feedback) {
						feedback(xmlHttp.readyState);
					}
				};
				data = std.ajax.url(data);
				if (method == "GET") {
					if(data) {
						url = url+"?"+data;
						data = NULL;
					}
					xmlHttp.open(method, url, asyn);
				} else {
					xmlHttp.open("POST", url, asyn);
					xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
				}
				xmlHttp.send(data);
			},
			
			/**
				Genera una cadena segura para enviar por ajax o por url partiendo de un objeto dado.
				@param: {Object} obj es el objeto que se desea convertir en la cadena url segura
				@return: una cadena url segura para enviar via ajax o url
			*/
			url: function(obj) {
				if(!(obj instanceof Object)) {
					return obj;
				}
				var res="",
					encode = encodeURIComponent;
				for(var key in obj) {
					if(typeof obj[key] == "string" || typeof obj[dato] == "number") {
						res += encode(key)+"="+encode(obj[key])+"\&";
					}
				}
				
				return res.substr(0, res.length-1);
			},
			
			/**
				Convierte un formulario en un objeto javascript que contiene los datos para ser enviados via a ajax.
				@see: NUCLEO
				@param: {element} form es la representación del formulario que se desea procesar
				@return: Un objeto que contiene todos los campos diligenciados del formulario (nombre del campo: valor del campo)
			*/
			form: function(form) {
				var obj = {},
					inputs = std.$("input",form),
					textareas = std.$("textarea",form),
					selects = std.$("select",form),
					i = 0;
				for(var inp; inp = inputs[i]; i++) {
					if(inp.name != "") {
						if(inp.type == "radio" || inp.type == "checkbox") {
							if(inp.checked) {
								obj[inp.name] = inp.value;
							}
						} else {
							obj[inp.name] = inp.value;
						}
					}
				}
				i = 0;
				for(var text; text = textareas[i]; i++) {
					if(text.name != "") {
						obj[text.name] = text.value;
					}
				}
				i = 0;
				for(var sel; sel = selects[i]; i++) {
					if(sel.name != "") {
						obj[sel.name] = sel.value;
					}
				}
				return obj;
			}
		},
		
		/****** EFECTOS ESPECIALES ******/
		sfx: {
			/**
				Genera un efecto drag and drop de un elemento dentro de otro elemento contenedor.
				@see: EVENTOS, ESTILOS
				@param: {Event} e es el evento que dispara la función que invoco al metodo
				@param: {Element} mov es el elemento que se va a mover dentro del contenedor
				@param: {Element} area es el contenedor sobre el cual se movera mov
			*/
			dyd: function (e, mov, area) {
				var cEjeX = e.clientX+document.documentElement.scrollLeft+document.body.scrollLeft,
					cEjeY = e.clientY+document.documentElement.scrollTop+document.body.scrollTop,
					cssMov = std.css(mov),
					marginL = parseInt(cssMov.get("marginLeft")) || 0,
					marginT = parseInt(cssMov.get("marginTop")) || 0,
					initX = mov.offsetLeft-marginL,
					initY = mov.offsetTop-marginT;
				
				/**
					Cambia la posición del elemento que se esta arrastrando dependiendo de la posición del puntero.
					@see: EVENTOS, ESTILOS
				*/
				function drag() {
					var e = std.evt.get(),
						nowX = e.clientX+document.documentElement.scrollLeft+document.body.scrollLeft,
						nowY = e.clientY+document.documentElement.scrollTop+document.body.scrollTop,
						aLeft = area.offsetLeft,
						aTop = area.offsetTop,
						aHeight = area.offsetHeight,
						aWidth = area.offsetWidth,
						x = initX+nowX-cEjeX,
						y = initY+nowY-cEjeY;
					
					if (x<=(marginL*-1)+aLeft) {
						x = (marginL*-1)+aLeft;
					} else if (x>=(aWidth+marginL+aLeft-(mov.offsetWidth+marginL*2))) {
						x = aWidth+marginL+aLeft-(mov.offsetWidth+marginL*2);
					}
					if (y<=(marginT*-1)+aTop) {
						y = (marginT*-1)+aTop;
					} else if (y>=(aHeight+marginT+aTop-(mov.offsetHeight+marginT*2))) {
						y = aHeight+marginT+aTop-(mov.offsetHeight+marginT*2);
					}
					if(cssMov.get("position") == "relative") {
						x = x-aLeft;
						y = y-aTop;
					}
					cssMov.set({
						left: x+"px",
						top: y+"px"
					});
					e.preventDefault();
				}
				
				/**
					Remueve los eventos mousemove y mouseup del documento
					@see: EVENTOS
				*/
				function drop() {
					std.evt.remove(document,{
						mousemove: drag,
						mouseup: drop
					}, TRUE);
				}
				
				std.evt.add(document,{
					mousemove: drag,
					mouseup: drop
				}, TRUE);
				
				e.preventDefault();
			},
			
			/**
				Genera pequeñas transiciones y animaciones sobre elementos del DOM
				@see: ESTILOS, FUNCIONES PRIVADAS
				@param: {Element} element es el elemento o nodo al cual se le aplicara la animación
				@param: {Object} props son las propiedades que se van a modificar durante la animación (propiedad: valor final)
				@param: {Object} opt son las opciones configurables durante la animación, estas son:
					duration: (por defecto 1000) es el tiempo que durara la animación representado en milisegundos
					fps: (por defecto 40) es el numero de frames por segundo o dicho de otra forma pasos por segundo
					onComplete: es un comportamiento final tras acabar la animación
			*/
			anim: function (element, props, opt) {
				var style = std.css(element),
					duration = parseInt(opt.duration) || 1000,
					fps = parseInt(opt.fps) || 100,
					onComplete = opt.onComplete,
					time,
					timer,
					from = [],
					to = [],
					post = [];
				
				for(var prop in props) {
					var cssProp = style.get(prop);
					if(cssProp.indexOf("rgb") == 0) {
						post[prop] = [];
						var value = props[prop];
						if(value.indexOf("#") == 0) {
							to[prop] = hexToRGB(value);
						} else {
							to[prop] = value.substring(4, value.length-1).split(",");
						}
						from[prop] = cssProp.substring(4, cssProp.length-1).split(",");
						for(var i=0; i<3; i++) {
							from[prop][i] = parseInt(from[prop][i]);
							post[prop][i] = (from[prop][i]-to[prop][i])/((duration/1000)*fps);
						}
					} else {
						from[prop] = parseInt(cssProp);
						to[prop] = parseInt(props[prop]);
						post[prop] = isNaN(props[prop])?props[prop].replace(/(\+|-)?\d+/g, ""):"";
					}
				}
				
				time = +new Date;
				timer = setInterval(function () {
					var currentTime = +new Date;
					if(currentTime < time + duration) {
						for(var prop in props) {
							if(style.get(prop).indexOf("rgb") == 0) {
								for(var i=0; i<3; i++) {
									from[prop][i] = Math.round(from[prop][i]-post[prop][i]);
								}
								style.set(prop, "rgb(" + from[prop].toString() + ")");
							} else {
								style.set(prop, (from[prop] + (to[prop] - from[prop]) * ((currentTime - time) / duration)) + post[prop]);
							}
						}
					} else {
						timer = clearInterval(timer);
						for(var prop in props) {
							style.set(prop, props[prop]);
						}
						if(onComplete) {
							onComplete();
						}
					}
				}, Math.round(1000/fps));
			},
			
			/**
				Animación que oculta o muestra un elemento gradualmente, si el elemento es display block lo oculta y si es display none lo muestra
				@see: ESTILOS
				@param: {Element} obj es el elemento que se desea mostrar u ocultar
				@param: {Object} opt son las opciones configurables durante el efecto, estas son las mismas de anim.
			*/
			fade: function (obj, opt) {
				opt || (opt = {});
				var cssObj = std.css(obj),
					onComplete = opt.onComplete;
				if(cssObj.get("display") == "none") {
					cssObj.set({
						display: "block",
						opacity: 0
					});
					std.sfx.anim(obj, {opacity: 1}, opt);
				} else {
					std.sfx.anim(obj, {opacity: 0}, std.extend(opt, {
						onComplete: function(){
							cssObj.set("display", "none");
							onComplete&&onComplete();
						}
					}));
				}
			}
		},
		
		/****** VENTANA MODAL ******/
		modal: (function() {
			var cache = window.sessionStorage || {},
				modal,
				overlay,
				core = {
					/**
						Renderiza el nodo la ventana modal dependiendo del enlace que la halla invocado, tomando el titulo de la misma etiqueta.
						Crea todo el marco de la ventana modal y el overlay que cubrira la pantalla del navegador.
						@see: EVENTOS, AJAX, NUCLEO , ESTILOS, EFECTOS ESPECIALES
					*/
					show: function () {
						std.evt.get().preventDefault();
						var title = this.getAttribute("title") || "",
							url = this.getAttribute("href").replace(document.location,""),
							element;
						
						if(!overlay) {
							overlay = document.createElement("div");
							modal = overlay.cloneNode(FALSE);
							var head  = overlay.cloneNode(FALSE),
								img = overlay.cloneNode(FALSE),
								text = document.createElement("h2");
								
							overlay.id = "overlay";
							modal.id = "modal";
							head.className = "head";
							std.evt.add(head,"mousedown",function(){
								std.sfx.dyd(std.evt.get(),modal,overlay);
							});
							std.evt.add(img,"click",core.hide);
							document.body.appendChild(overlay);
							head.appendChild(img);
							head.appendChild(text);
							modal.appendChild(core.round(std.css(".head").get("backgroundColor"),"top"));
							modal.appendChild(head);
							
							
							document.body.appendChild(modal);
						}
						
						if (url.indexOf("#") == 0) {
							element = std.$(url).cloneNode(TRUE);
						} else {
							var aux = document.createElement("div");
							if (! (aux.innerHTML = cache[url]) ) {
								std.ajax.request(url,function(r){
									//console.log("PETICION");
									cache[url] = aux.innerHTML = r;
								}, {data:"ajax="+TRUE, syn:TRUE});
							}
							element = aux.firstChild;
						}
						modal.appendChild(element);
						modal.appendChild(core.round(std.css("#"+element.id).get("backgroundColor"),"bottom"));
						element.style.display = "block";
						modal.childNodes[1].childNodes[1].innerHTML = title;
						
						std.css(overlay).set("display", "block");
						std.sfx.fade(modal);
						
						var childsModal = modal.childNodes,
							height = 0,
							width = element.offsetWidth;
						
						for (var i=0,h; h=childsModal[i]; i++) {
							height += h.offsetHeight;
						}
						std.css(modal).set({
							width: width+"px",
							height: height+"px",
							marginLeft: -(width/2)+"px",
							marginTop: -(height/2)+"px"
						});
						std.modal.reset();
					},
				
					/**
						Elimina el nodo principal de la ventana modal y oculta el resto de la estructura.
						@see: NUCLEO, ESTILOS, EFECTOS ESPECIALES
					*/
					hide: function () {
						std.sfx.fade(modal, {onComplete:function(){
							std.css(overlay).set("display", "none");
							modal.removeChild(modal.childNodes[2]);
							modal.removeChild(modal.childNodes[2]);
						}, duration:500});
					},
				
					/**
						Restablece la posición de la ventana modal, siempre y cuando esta se encuentre dentro del DOM.
						@see: NUCLEO, ESTILOS
					*/
					reset: function (){
						modal&&std.css(modal).set({
							top: "50%",
							left: "50%"
						});
					},
				
					/**
						Se encarga de crear bordes redondeados a la ventana modal.
						@param: {String} color es el color que se desea para el borde que se va a crear
						@param: {String} position es la posición en la que se colocaran los bordes redondeados, puede ser TOP o BOTTOM
						@return: Los bordes redondeados para ser incluidos en la ventana
					*/
					round: function (color, position) {
						position = position.toLowerCase();
						var border = document.createElement("b"),
							r = [],
							i = 0;
						while(i<4) {
							r[i] = border.cloneNode(FALSE);
							r[i].style.backgroundColor = color;
							r[i].className = "r"+(i+1);
							i++;
						}
						border.className = "round";
						
						if (position == "top"){
							i=0;
							while(i<4) {
								border.appendChild(r[i]);
								i++;
							}
						} else if (position == "bottom") {
							i=3;
							while(i>=0) {
								border.appendChild(r[i]);
								i--;
							}
						} else {
							return;
						}
						
						return border;
					}
				};
			
			return core;
		})()
	};

/****** FUNCIONES PRIVADAS ******/
/**
	Cuando un color se encuentra en formato #hexadecimal esta función lo convierte a RGB, se bebe comprobar que el parametro pasado es un 
	hexadecimal ya que la función no realiza dicha comprobación.
	@param: {String} color es precesimente el color que debe estar en formato hexadecimal
	@return: Un arreglo con los valores [R,G,B].
*/
function hexToRGB(color) {
	color = color.substr(1);
	if (color.length==3) {
		var aux = color.split("");
		color = "";
		for (var i=0;i<3;i++){
			color+=aux[i]+aux[i];
		}
	}
	color = parseInt(color, 16);
	return [color >> 16, color >> 8 & 255, color & 255];
}

/****** CONFIGURACION DE ENTORNO ******/
/**
	Se encarga de gestionar los anchors que contengan atributos rel,
	ademas agrega los eventos necesarios para cuando se carga la libreria.
*/
std.ready(function (){
	std.evt.add(window,"resize",std.modal.reset);
	std.evt.on(document,"a","click", function() {
		var rel = this.rel;
		if(rel == "modal") {
			std.modal.show.apply(this,arguments);
		} else if(rel == "external" && this.target != "_blank") {
			this.target = "_blank";
		}
	});
});

/**
	Extendiende los objetos nativos javascript necesarios para el funcionamiento de la liberia,
	no se tiene en cuenta Object dado que provoca un mal funcionamiento del for in (verbosean)
*/
std.extend (String.prototype,{
	/**
		Limpia espacios a los lados de las cadenas
		@this {String}
		@return: La cadena sin ningun tipo de espacios a los lados
	*/
	trim: function() {
		return this.replace(/^[\s\t\r\n]+|[\s\t\r\n]+$/g,"");
	}
});

std.extend(frame, std);//extiende los metodos publicos al frame contenedor


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