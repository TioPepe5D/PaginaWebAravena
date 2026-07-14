/*
 * Generador de catálogo — Joyería Aravena
 * -----------------------------------------
 * Lee "catalogo-datos.jsonl" (un producto por línea) y regenera "js/products.js".
 *
 * Cada línea del .jsonl es un objeto con este formato:
 *   {"imagen":"archivo.jpg","nombre":"Lote de Pulseras","categoria":"pulseras","material":"plata-nacional","precio":24990}
 *
 * Categorías válidas: collares | pulseras | aros | colgantes | conjuntos | anillos | exhibidores
 *
 * Para actualizar el catálogo:
 *   1. Pon las fotos nuevas en la carpeta img/
 *   2. Agrega/edita las líneas correspondientes en catalogo-datos.jsonl
 *   3. Corre:  node generar-catalogo.js
 *
 * (El precio y título de cada foto los completa Claude leyendo la imagen.)
 */

const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "catalogo-datos.jsonl");
const OUT = path.join(__dirname, "js", "products.js");

// Orden en que se muestran las categorías en el catálogo
const ORDEN = ["collares", "pulseras", "aros", "colgantes", "conjuntos", "anillos", "exhibidores"];

const lines = fs.readFileSync(DATA, "utf8").split(/\r?\n/).filter(l => l.trim());
const items = lines.map((l, idx) => {
  try {
    return JSON.parse(l);
  } catch (e) {
    console.error(`⚠ Línea ${idx + 1} inválida (se omite): ${l}`);
    return null;
  }
}).filter(Boolean);

// Ordenar por categoría y, dentro de cada una, por precio descendente
items.sort((a, b) => {
  const d = ORDEN.indexOf(a.categoria) - ORDEN.indexOf(b.categoria);
  if (d !== 0) return d;
  return b.precio - a.precio;
});

let out = "const productos = [\n\n";
items.forEach((it, i) => {
  const imagen = it.imagen.startsWith("img/") ? it.imagen : "img/" + it.imagen;
  out += "  {\n";
  out += "    id: " + (i + 1) + ",\n";
  out += "    nombre: " + JSON.stringify(it.nombre) + ",\n";
  out += "    categoria: " + JSON.stringify(it.categoria) + ",\n";
  out += "    material: " + JSON.stringify(it.material || "plata-nacional") + ",\n";
  out += "    precio: " + (it.precio || 0) + ",\n";
  out += "    imagen: " + JSON.stringify(imagen) + ",\n";
  out += "    descripcion: " + JSON.stringify(it.descripcion || it.nombre) + "\n";
  out += "  }" + (i < items.length - 1 ? "," : "") + "\n";
});
out += "\n];\n\n";
out += "// Exportar para Node.js (APIs de Vercel) sin romper el navegador\n";
out += "if (typeof module !== 'undefined' && module.exports) {\n  module.exports = productos;\n}\n";

fs.writeFileSync(OUT, out);

const resumen = {};
items.forEach(it => { resumen[it.categoria] = (resumen[it.categoria] || 0) + 1; });
console.log(`✓ Generado js/products.js con ${items.length} productos`);
console.log("  Por categoría:", resumen);
