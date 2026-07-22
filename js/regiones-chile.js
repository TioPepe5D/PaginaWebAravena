/* =============================================
   DIVISIÓN POLÍTICA DE CHILE
   Región → Provincia → Comunas. Se usa para los selectores en cascada
   del formulario de envío: al elegir región se filtran las provincias,
   y al elegir provincia se filtran las comunas.
   ============================================= */

const REGIONES_CHILE = [
  {
    region: "Arica y Parinacota",
    provincias: [
      { nombre: "Arica", comunas: ["Arica", "Camarones"] },
      { nombre: "Parinacota", comunas: ["Putre", "General Lagos"] },
    ],
  },
  {
    region: "Tarapacá",
    provincias: [
      { nombre: "Iquique", comunas: ["Iquique", "Alto Hospicio"] },
      { nombre: "Tamarugal", comunas: ["Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"] },
    ],
  },
  {
    region: "Antofagasta",
    provincias: [
      { nombre: "Antofagasta", comunas: ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal"] },
      { nombre: "El Loa", comunas: ["Calama", "Ollagüe", "San Pedro de Atacama"] },
      { nombre: "Tocopilla", comunas: ["Tocopilla", "María Elena"] },
    ],
  },
  {
    region: "Atacama",
    provincias: [
      { nombre: "Copiapó", comunas: ["Copiapó", "Caldera", "Tierra Amarilla"] },
      { nombre: "Chañaral", comunas: ["Chañaral", "Diego de Almagro"] },
      { nombre: "Huasco", comunas: ["Vallenar", "Alto del Carmen", "Freirina", "Huasco"] },
    ],
  },
  {
    region: "Coquimbo",
    provincias: [
      { nombre: "Elqui", comunas: ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paihuano", "Vicuña"] },
      { nombre: "Choapa", comunas: ["Illapel", "Canela", "Los Vilos", "Salamanca"] },
      { nombre: "Limarí", comunas: ["Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"] },
    ],
  },
  {
    region: "Valparaíso",
    provincias: [
      { nombre: "Valparaíso", comunas: ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar"] },
      { nombre: "Isla de Pascua", comunas: ["Isla de Pascua"] },
      { nombre: "Los Andes", comunas: ["Los Andes", "Calle Larga", "Rinconada", "San Esteban"] },
      { nombre: "Petorca", comunas: ["La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar"] },
      { nombre: "Quillota", comunas: ["Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales"] },
      { nombre: "San Antonio", comunas: ["San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo"] },
      { nombre: "San Felipe de Aconcagua", comunas: ["San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María"] },
      { nombre: "Marga Marga", comunas: ["Quilpué", "Limache", "Olmué", "Villa Alemana"] },
    ],
  },
  {
    region: "Metropolitana de Santiago",
    provincias: [
      { nombre: "Santiago", comunas: ["Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura"] },
      { nombre: "Cordillera", comunas: ["Puente Alto", "Pirque", "San José de Maipo"] },
      { nombre: "Chacabuco", comunas: ["Colina", "Lampa", "Tiltil"] },
      { nombre: "Maipo", comunas: ["San Bernardo", "Buin", "Calera de Tango", "Paine"] },
      { nombre: "Melipilla", comunas: ["Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro"] },
      { nombre: "Talagante", comunas: ["Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"] },
    ],
  },
  {
    region: "Libertador General Bernardo O'Higgins",
    provincias: [
      { nombre: "Cachapoal", comunas: ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente"] },
      { nombre: "Cardenal Caro", comunas: ["Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones"] },
      { nombre: "Colchagua", comunas: ["San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"] },
    ],
  },
  {
    region: "Maule",
    provincias: [
      { nombre: "Talca", comunas: ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael"] },
      { nombre: "Cauquenes", comunas: ["Cauquenes", "Chanco", "Pelluhue"] },
      { nombre: "Curicó", comunas: ["Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén"] },
      { nombre: "Linares", comunas: ["Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"] },
    ],
  },
  {
    region: "Ñuble",
    provincias: [
      { nombre: "Diguillín", comunas: ["Chillán", "Chillán Viejo", "Bulnes", "El Carmen", "Pemuco", "Pinto", "Quillón", "San Ignacio", "Yungay"] },
      { nombre: "Itata", comunas: ["Quirihue", "Cobquecura", "Coelemu", "Ninhue", "Portezuelo", "Ránquil", "Treguaco"] },
      { nombre: "Punilla", comunas: ["San Carlos", "Coihueco", "Ñiquén", "San Fabián", "San Nicolás"] },
    ],
  },
  {
    region: "Biobío",
    provincias: [
      { nombre: "Concepción", comunas: ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Hualpén"] },
      { nombre: "Arauco", comunas: ["Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa"] },
      { nombre: "Biobío", comunas: ["Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío"] },
    ],
  },
  {
    region: "La Araucanía",
    provincias: [
      { nombre: "Cautín", comunas: ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol"] },
      { nombre: "Malleco", comunas: ["Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"] },
    ],
  },
  {
    region: "Los Ríos",
    provincias: [
      { nombre: "Valdivia", comunas: ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli"] },
      { nombre: "Ranco", comunas: ["La Unión", "Futrono", "Lago Ranco", "Río Bueno"] },
    ],
  },
  {
    region: "Los Lagos",
    provincias: [
      { nombre: "Llanquihue", comunas: ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas"] },
      { nombre: "Chiloé", comunas: ["Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao"] },
      { nombre: "Osorno", comunas: ["Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo"] },
      { nombre: "Palena", comunas: ["Chaitén", "Futaleufú", "Hualaihué", "Palena"] },
    ],
  },
  {
    region: "Aysén del General Carlos Ibáñez del Campo",
    provincias: [
      { nombre: "Coyhaique", comunas: ["Coyhaique", "Lago Verde"] },
      { nombre: "Aysén", comunas: ["Aysén", "Cisnes", "Guaitecas"] },
      { nombre: "Capitán Prat", comunas: ["Cochrane", "O'Higgins", "Tortel"] },
      { nombre: "General Carrera", comunas: ["Chile Chico", "Río Ibáñez"] },
    ],
  },
  {
    region: "Magallanes y de la Antártica Chilena",
    provincias: [
      { nombre: "Magallanes", comunas: ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio"] },
      { nombre: "Antártica Chilena", comunas: ["Cabo de Hornos", "Antártica"] },
      { nombre: "Tierra del Fuego", comunas: ["Porvenir", "Primavera", "Timaukel"] },
      { nombre: "Última Esperanza", comunas: ["Natales", "Torres del Paine"] },
    ],
  },
];

/* Códigos telefónicos. Chile primero por ser el mercado principal.
   `digitos` es la cantidad exacta que debe tener el número, sin el código. */
const CODIGOS_PAIS = [
  { pais: "Chile",      codigo: "+56", bandera: "🇨🇱", digitos: 9, ejemplo: "912345678" },
  { pais: "Argentina",  codigo: "+54", bandera: "🇦🇷", digitos: 10, ejemplo: "1123456789" },
  { pais: "Perú",       codigo: "+51", bandera: "🇵🇪", digitos: 9, ejemplo: "912345678" },
  { pais: "Bolivia",    codigo: "+591", bandera: "🇧🇴", digitos: 8, ejemplo: "71234567" },
  { pais: "Colombia",   codigo: "+57", bandera: "🇨🇴", digitos: 10, ejemplo: "3001234567" },
  { pais: "Brasil",     codigo: "+55", bandera: "🇧🇷", digitos: 11, ejemplo: "11987654321" },
  { pais: "Uruguay",    codigo: "+598", bandera: "🇺🇾", digitos: 8, ejemplo: "91234567" },
  { pais: "Paraguay",   codigo: "+595", bandera: "🇵🇾", digitos: 9, ejemplo: "981234567" },
  { pais: "Ecuador",    codigo: "+593", bandera: "🇪🇨", digitos: 9, ejemplo: "991234567" },
  { pais: "Venezuela",  codigo: "+58", bandera: "🇻🇪", digitos: 10, ejemplo: "4121234567" },
  { pais: "México",     codigo: "+52", bandera: "🇲🇽", digitos: 10, ejemplo: "5512345678" },
  { pais: "España",     codigo: "+34", bandera: "🇪🇸", digitos: 9, ejemplo: "612345678" },
  { pais: "Estados Unidos", codigo: "+1", bandera: "🇺🇸", digitos: 10, ejemplo: "2125551234" },
];
