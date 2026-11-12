const productos = [

  {
    id: 1,
    nombre: "Lote de Collares en Plata Italiana 925",
    categoria: "collares",
    material: "plata-italiana",
    precio: 90000,
    imagen: "img/c7f20484-35a1-48a6-802d-d6bd31593ac6.jpg",
    descripcion: "Lote de Collares en Plata Italiana 925"
  },
  {
    id: 2,
    nombre: "Collares Luxury",
    categoria: "collares",
    material: "plata-nacional",
    precio: 90000,
    imagen: "img/892df6eb-3299-4b3a-9517-a2afef2e58fb.jpg",
    descripcion: "Collares Luxury"
  },
  {
    id: 3,
    nombre: "Lote Plata Italiana 925",
    categoria: "collares",
    material: "plata-italiana",
    precio: 86900,
    imagen: "img/f3885803-df37-4540-9933-a5aa17ec7e71.jpg",
    descripcion: "Lote Plata Italiana 925"
  },
  {
    id: 4,
    nombre: "Lote de Collares de Hombre Premium",
    categoria: "collares",
    material: "plata-nacional",
    precio: 84990,
    imagen: "img/7a6031b9-40f1-41db-b757-93e35a8aae09.jpg",
    descripcion: "Lote de Collares de Hombre Premium"
  },
  {
    id: 5,
    nombre: "Cadena Oro Goldfield Italiano 18K — $78.990",
    categoria: "collares",
    material: "oro-goldfit",
    precio: 78990,
    imagen: "img/0ea41cf6-6680-41aa-a4ec-b0c8e9fe80cd.jpg",
    descripcion: "Cadena Oro Goldfield Italiano 18K — $78.990"
  },
  {
    id: 6,
    nombre: "Lote de Collares de Hombre — $71.990",
    categoria: "collares",
    material: "plata-nacional",
    precio: 71990,
    imagen: "img/2df00ef6-bb8f-49f1-974a-d9488921abf1.jpg",
    descripcion: "Lote de Collares de Hombre — $71.990"
  },
  {
    id: 7,
    nombre: "Lote de Collares de Hombre Futbolero",
    categoria: "collares",
    material: "plata-nacional",
    precio: 69990,
    imagen: "img/d7d54c2b-dd22-4b2e-b446-3ddd110660c7.jpg",
    descripcion: "Lote de Collares de Hombre Futbolero"
  },
  {
    id: 8,
    nombre: "Lote de Rosarios Oro Goldfit 18K",
    categoria: "collares",
    material: "oro-goldfit",
    precio: 65990,
    imagen: "img/3668dc04-37be-4315-a882-9dcab92331c6.jpg",
    descripcion: "Lote de Rosarios Oro Goldfit 18K"
  },
  {
    id: 9,
    nombre: "Lote de Collares para Ellos",
    categoria: "collares",
    material: "plata-nacional",
    precio: 59990,
    imagen: "img/4f61065f-ede7-405c-8139-2c78f6375f1e.jpg",
    descripcion: "Lote de Collares para Ellos"
  },
  {
    id: 10,
    nombre: "Lote de Collares de Hombre — $55.990",
    categoria: "collares",
    material: "plata-nacional",
    precio: 55990,
    imagen: "img/80d1e818-d7b5-4e6e-9714-6c7bf4df1095.jpg",
    descripcion: "Lote de Collares de Hombre — $55.990"
  },
  {
    id: 11,
    nombre: "Lote 7 Rosarios Gruesos",
    categoria: "collares",
    material: "plata-nacional",
    precio: 55900,
    imagen: "img/D0E6A2CC-26DE-4066-B197-D7548D776114_AD2D01E2-764E-4E7C-8D49-F84EF1B7F2AA.jpg",
    descripcion: "Lote 7 Rosarios Gruesos"
  },
  {
    id: 12,
    nombre: "Lote de Rosarios Oro Goldfield",
    categoria: "collares",
    material: "oro-goldfit",
    precio: 51990,
    imagen: "img/c741e883-14a3-46a8-a0e4-44448c8153f9.jpg",
    descripcion: "Lote de Rosarios Oro Goldfield"
  },
  {
    id: 13,
    nombre: "Lote de Collares Shiny",
    categoria: "collares",
    material: "plata-nacional",
    precio: 49990,
    imagen: "img/c324f177-3d66-4a53-962f-bb419ad209a3.jpg",
    descripcion: "Lote de Collares Shiny"
  },
  {
    id: 14,
    nombre: "Lote Collares LV Plata 925",
    categoria: "collares",
    material: "plata-nacional",
    precio: 49990,
    imagen: "img/e10cc410-bfe4-4885-bd69-5e2b30bd7bbe.jpg",
    descripcion: "Lote Collares LV Plata 925"
  },
  {
    id: 15,
    nombre: "Cadena de Hombre Oro Goldfield 18K",
    categoria: "collares",
    material: "oro-goldfit",
    precio: 45990,
    imagen: "img/36719fe0-465a-4e64-9673-745e306f2f05.jpg",
    descripcion: "Cadena de Hombre Oro Goldfield 18K"
  },
  {
    id: 16,
    nombre: "Lote de Collares Oro Goldfield 18K",
    categoria: "collares",
    material: "oro-goldfit",
    precio: 45990,
    imagen: "img/44e51070-65bb-4d0d-b354-ed667332b343.jpg",
    descripcion: "Lote de Collares Oro Goldfield 18K"
  },
  {
    id: 17,
    nombre: "Collares Exclusivos",
    categoria: "collares",
    material: "plata-nacional",
    precio: 44990,
    imagen: "img/b4346129-b0cc-4793-80eb-22393b6b9df9.jpg",
    descripcion: "Collares Exclusivos"
  },
  {
    id: 18,
    nombre: "Collares Luxury Plata 925",
    categoria: "collares",
    material: "plata-nacional",
    precio: 42990,
    imagen: "img/dd60cfed-164a-425a-a578-c7a3bd789660.jpg",
    descripcion: "Collares Luxury Plata 925"
  },
  {
    id: 19,
    nombre: "Cadena Camino del Inca 57cm x 8mm",
    categoria: "collares",
    material: "plata-nacional",
    precio: 41990,
    imagen: "img/73ba2493-e032-4177-af59-e36c5053a482.jpg",
    descripcion: "Cadena Camino del Inca 57cm x 8mm"
  },
  {
    id: 20,
    nombre: "Lote de Collares Luxury Tennis",
    categoria: "collares",
    material: "plata-nacional",
    precio: 39990,
    imagen: "img/9621b68a-17bc-482e-a43a-39408913e8ee.jpg",
    descripcion: "Lote de Collares Luxury Tennis"
  },
  {
    id: 21,
    nombre: "Lote de Collares Coquette",
    categoria: "collares",
    material: "plata-nacional",
    precio: 38990,
    imagen: "img/40cd7fa9-d7be-4edd-8a6e-ee180ba65ff5.jpg",
    descripcion: "Lote de Collares Coquette"
  },
  {
    id: 22,
    nombre: "Lote de Collares Tennis",
    categoria: "collares",
    material: "plata-nacional",
    precio: 38990,
    imagen: "img/c37d9856-9a1a-4f4c-8efe-a3ae1f51ab2f.jpg",
    descripcion: "Lote de Collares Tennis"
  },
  {
    id: 23,
    nombre: "Lote 5 Rosarios Mixtos",
    categoria: "collares",
    material: "plata-nacional",
    precio: 38990,
    imagen: "img/A8B06D45-2279-4A41-A687-2721F3A53334_98AECA00-4B84-4AFE-B473-CFFF1FF3B11E.jpg",
    descripcion: "Lote 5 Rosarios Mixtos"
  },
  {
    id: 24,
    nombre: "Lote Punto de Luz",
    categoria: "collares",
    material: "plata-nacional",
    precio: 38900,
    imagen: "img/1b616ebb-946b-4484-ae1e-842061c46521.jpg",
    descripcion: "Lote Punto de Luz"
  },
  {
    id: 25,
    nombre: "Lote de Collares Luxury",
    categoria: "collares",
    material: "plata-nacional",
    precio: 38900,
    imagen: "img/4eb8468f-feef-41bb-82bc-96aa3b808200.jpg",
    descripcion: "Lote de Collares Luxury"
  },
  {
    id: 26,
    nombre: "Lote 5 Rosarios Mixtos Perla",
    categoria: "collares",
    material: "plata-nacional",
    precio: 37990,
    imagen: "img/B5420D3A-AE08-4D73-B524-AC25F59A5319_87D438E6-51FF-4477-BC08-5633B1CD61EB.jpg",
    descripcion: "Lote 5 Rosarios Mixtos Perla"
  },
  {
    id: 27,
    nombre: "Lote de Collares Luxury Heart",
    categoria: "collares",
    material: "plata-nacional",
    precio: 36900,
    imagen: "img/a1ed2dea-b023-4fe2-ae5a-3c145751d11a.jpg",
    descripcion: "Lote de Collares Luxury Heart"
  },
  {
    id: 28,
    nombre: "Collar Luxury LV",
    categoria: "collares",
    material: "plata-nacional",
    precio: 35000,
    imagen: "img/01c7d3e8-8497-4c54-962b-b2ab1a948890.jpg",
    descripcion: "Collar Luxury LV",
    opciones: [{"etiqueta":"Unitario","precio":49990},{"etiqueta":"Mayorista","precio":35000}]
  },
  {
    id: 29,
    nombre: "Lote Animado",
    categoria: "collares",
    material: "plata-nacional",
    precio: 34900,
    imagen: "img/337c5a63-d80c-4e04-b34e-82aec8552ba0.jpg",
    descripcion: "Lote Animado"
  },
  {
    id: 30,
    nombre: "Lote de Collares Microzircon",
    categoria: "collares",
    material: "plata-nacional",
    precio: 32990,
    imagen: "img/3459ca67-c639-4805-aa61-f54dec5913d4.jpg",
    descripcion: "Lote de Collares Microzircon"
  },
  {
    id: 31,
    nombre: "Lote de Collares con Letras",
    categoria: "collares",
    material: "plata-nacional",
    precio: 32990,
    imagen: "img/66abf07f-cb28-4479-a247-dd3327f50904.jpg",
    descripcion: "Lote de Collares con Letras"
  },
  {
    id: 32,
    nombre: "Lote 4 Rosarios Largos",
    categoria: "collares",
    material: "plata-nacional",
    precio: 32990,
    imagen: "img/997744CF-95B1-42A5-95B7-F73AE5ECE2E9_3269066B-24E2-4304-B442-371B25FA5CB9.jpg",
    descripcion: "Lote 4 Rosarios Largos"
  },
  {
    id: 33,
    nombre: "Lote de Collares con Letras Premium",
    categoria: "collares",
    material: "plata-nacional",
    precio: 32900,
    imagen: "img/IMG_1443.PNG",
    descripcion: "Lote de Collares con Letras Premium"
  },
  {
    id: 34,
    nombre: "Lote Futbolero",
    categoria: "collares",
    material: "plata-nacional",
    precio: 29990,
    imagen: "img/af1d7a78-61fa-4262-b59b-788a1b95f2d0.jpg",
    descripcion: "Lote Futbolero"
  },
  {
    id: 35,
    nombre: "Collar de Hombre Oro Goldfield 18K",
    categoria: "collares",
    material: "oro-goldfit",
    precio: 26990,
    imagen: "img/3b8e63df-a76d-4e39-adba-9b6d2ce415b5.jpg",
    descripcion: "Collar de Hombre Oro Goldfield 18K"
  },
  {
    id: 36,
    nombre: "Lote Collares Queen",
    categoria: "collares",
    material: "plata-nacional",
    precio: 22990,
    imagen: "img/b0f68968-9422-44ec-a8a4-17d8e883c405.jpg",
    descripcion: "Lote Collares Queen"
  },
  {
    id: 37,
    nombre: "Lote de Collares Disney",
    categoria: "collares",
    material: "plata-nacional",
    precio: 22900,
    imagen: "img/ae4f2a3e-634c-4bf8-ba8e-5425f1c851f1.jpg",
    descripcion: "Lote de Collares Disney"
  },
  {
    id: 38,
    nombre: "Lote de Collares Plata 925",
    categoria: "collares",
    material: "plata-nacional",
    precio: 22900,
    imagen: "img/e43b5ba7-1737-4df1-b530-b4faec3d86d1.jpg",
    descripcion: "Lote de Collares Plata 925"
  },
  {
    id: 39,
    nombre: "Lote Van Cleef",
    categoria: "collares",
    material: "plata-nacional",
    precio: 20990,
    imagen: "img/974a59fb-4731-4e30-824a-c6bd0fc3f1e2.jpg",
    descripcion: "Lote Van Cleef"
  },
  {
    id: 40,
    nombre: "Lote de Rosarios",
    categoria: "collares",
    material: "plata-nacional",
    precio: 20900,
    imagen: "img/3b669f9f-9375-413e-8fc8-4aacce589d69.jpg",
    descripcion: "Lote de Rosarios"
  },
  {
    id: 41,
    nombre: "Lote Puntos de Luz (6 unidades)",
    categoria: "collares",
    material: "plata-nacional",
    precio: 20000,
    imagen: "img/84f1036a-f760-4288-80ae-622f33b2ce39.jpg",
    descripcion: "Lote Puntos de Luz (6 unidades)"
  },
  {
    id: 42,
    nombre: "Lote de Collares Red",
    categoria: "collares",
    material: "plata-nacional",
    precio: 19990,
    imagen: "img/aa9a8328-d795-4593-b85b-50e682dcfd29.jpg",
    descripcion: "Lote de Collares Red"
  },
  {
    id: 43,
    nombre: "Lote de Denarios con Pulsera Micro",
    categoria: "collares",
    material: "plata-nacional",
    precio: 17990,
    imagen: "img/d2b8dc88-886c-4486-b14f-d8fe62c5345e.jpg",
    descripcion: "Lote de Denarios con Pulsera Micro"
  },
  {
    id: 44,
    nombre: "Rosarios Exclusivos",
    categoria: "collares",
    material: "plata-nacional",
    precio: 16990,
    imagen: "img/11b20622-54dd-413e-b93d-771b6fdf11af.jpg",
    descripcion: "Rosarios Exclusivos"
  },
  {
    id: 45,
    nombre: "Cadena Oro Goldfield Italiano 18K — $16.990",
    categoria: "collares",
    material: "oro-goldfit",
    precio: 16990,
    imagen: "img/53c338bd-368a-4752-bb23-0fa9fa9e33b9.jpg",
    descripcion: "Cadena Oro Goldfield Italiano 18K — $16.990"
  },
  {
    id: 46,
    nombre: "Lote de Puntos de Luz",
    categoria: "collares",
    material: "plata-nacional",
    precio: 16990,
    imagen: "img/66088338-8d5f-4f2e-99a4-d3e14bf98486.jpg",
    descripcion: "Lote de Puntos de Luz"
  },
  {
    id: 47,
    nombre: "Lote de Denarios",
    categoria: "collares",
    material: "plata-nacional",
    precio: 16900,
    imagen: "img/045ff63c-1ffc-405c-a09a-511bfd025499.jpg",
    descripcion: "Lote de Denarios"
  },
  {
    id: 48,
    nombre: "Lote de Rosarios Rojos",
    categoria: "collares",
    material: "plata-nacional",
    precio: 15990,
    imagen: "img/a70f665d-99b1-4a7d-9666-561571524ac0.jpg",
    descripcion: "Lote de Rosarios Rojos"
  },
  {
    id: 49,
    nombre: "Mini Lote Emprendedor — $14.990",
    categoria: "collares",
    material: "plata-nacional",
    precio: 14990,
    imagen: "img/653aa1e1-0aff-42be-b17d-4f59782585fd.jpg",
    descripcion: "Mini Lote Emprendedor — $14.990"
  },
  {
    id: 50,
    nombre: "Lote Cajita Flash Denarios",
    categoria: "collares",
    material: "oro-goldfit",
    precio: 14990,
    imagen: "img/7c2f9371-abc4-4262-acf0-20162132ba74.jpg",
    descripcion: "Lote Cajita Flash Denarios"
  },
  {
    id: 51,
    nombre: "Cadena Fina",
    categoria: "collares",
    material: "plata-nacional",
    precio: 1600,
    imagen: "img/0b3c93bd-2ad8-4872-9fe0-defb14541273.jpg",
    descripcion: "Cadena Fina"
  },
  {
    id: 52,
    nombre: "Cadena de Bolitas Fina",
    categoria: "collares",
    material: "plata-nacional",
    precio: 1000,
    imagen: "img/0ca93a38-9375-4115-b76b-308baab2607c.jpg",
    descripcion: "Cadena de Bolitas Fina"
  },
  {
    id: 53,
    nombre: "Cadena Tourbillon Italiano 60cm x 2mm",
    categoria: "collares",
    material: "plata-italiana",
    precio: 0,
    imagen: "img/34FF17C4-B748-4D30-9A17-BDE133DCC3DA_BBADC774-D4C3-4D02-840E-4B8F134EF812.jpg",
    descripcion: "Cadena Tourbillon Italiano 60cm x 2mm"
  },
  {
    id: 54,
    nombre: "Medio Kilo de Pulseras de Hombre",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 250000,
    imagen: "img/75104235-6655-4495-b71b-e066b284ec42.jpg",
    descripcion: "Medio Kilo de Pulseras de Hombre"
  },
  {
    id: 55,
    nombre: "Lote 40 Pulseras",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 65900,
    imagen: "img/C01DEC05-F92D-4CF9-91F0-349C4C1C2FE5_D10CC16F-0FF6-4B3A-9F67-72E41A2F9211.jpg",
    descripcion: "Lote 40 Pulseras"
  },
  {
    id: 56,
    nombre: "Lote 26 Pulseras Plata 925",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 60000,
    imagen: "img/f1dacddc-2272-43d4-9abe-8f3cc821c378.jpg",
    descripcion: "Lote 26 Pulseras Plata 925"
  },
  {
    id: 57,
    nombre: "Lote de Pulseras para Ellos Oro Goldfield 18K",
    categoria: "pulseras",
    material: "oro-goldfit",
    precio: 56990,
    imagen: "img/c6b37b06-4e15-4223-abce-31e4bf1a9e9d.jpg",
    descripcion: "Lote de Pulseras para Ellos Oro Goldfield 18K"
  },
  {
    id: 58,
    nombre: "Lote Pulseras de Hombre Plata 925",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 55990,
    imagen: "img/e5d5adf8-61b9-48f6-8570-4cfbb65a496f.jpg",
    descripcion: "Lote Pulseras de Hombre Plata 925"
  },
  {
    id: 59,
    nombre: "Lote de Pulseras Hombre Variado",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 54990,
    imagen: "img/367f0e06-b216-48e9-9854-001a9a7c1bcb.jpg",
    descripcion: "Lote de Pulseras Hombre Variado"
  },
  {
    id: 60,
    nombre: "Lote de Pulseras Luxury Plata 925",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 54990,
    imagen: "img/ffed3ad1-2cc7-488b-a220-e04692040c3a.jpg",
    descripcion: "Lote de Pulseras Luxury Plata 925"
  },
  {
    id: 61,
    nombre: "Lote 18 Pulseras Mixtas",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 45900,
    imagen: "img/86177027-EB49-45F0-878D-C8321280CDDC_A950D417-6208-44FD-BB3D-327C2D75BCAE.jpg",
    descripcion: "Lote 18 Pulseras Mixtas"
  },
  {
    id: 62,
    nombre: "Lote Pulseras Exclusiva",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 39990,
    imagen: "img/cd253b55-6358-40a5-a5c8-5c28624a459b.jpg",
    descripcion: "Lote Pulseras Exclusiva"
  },
  {
    id: 63,
    nombre: "Lote Pulseras Hombre Plata Variado",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 39990,
    imagen: "img/cb559a39-0c54-40b6-8358-7e418997f861.jpg",
    descripcion: "Lote Pulseras Hombre Plata Variado"
  },
  {
    id: 64,
    nombre: "Lote Pulseras de Hombre Oro Goldfield 18K",
    categoria: "pulseras",
    material: "oro-goldfit",
    precio: 39990,
    imagen: "img/ec09b738-52ab-4be3-9cdc-27ff4f856d67.jpg",
    descripcion: "Lote Pulseras de Hombre Oro Goldfield 18K"
  },
  {
    id: 65,
    nombre: "Lote de Pulseras de Hombre Premium",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 38990,
    imagen: "img/176097d9-0ac1-4491-b81c-1c235bf1f030.jpg",
    descripcion: "Lote de Pulseras de Hombre Premium"
  },
  {
    id: 66,
    nombre: "Lote de Pulseras Brillant",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 37990,
    imagen: "img/af2a6f7a-50ed-491e-823d-1d657d8e8d0b.jpg",
    descripcion: "Lote de Pulseras Brillant"
  },
  {
    id: 67,
    nombre: "Lote Pulseras para Ellos + Pulsera Oro Goldfield",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 37990,
    imagen: "img/f2353e35-62c3-4a84-a5be-0944e40c419e.jpg",
    descripcion: "Lote Pulseras para Ellos + Pulsera Oro Goldfield"
  },
  {
    id: 68,
    nombre: "Lote Pulseras Cadenas Variado",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 37900,
    imagen: "img/9211ca5d-24dd-49ef-92b1-461e8d145cce.jpg",
    descripcion: "Lote Pulseras Cadenas Variado"
  },
  {
    id: 69,
    nombre: "Lote Pulseras Mixtas",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 36900,
    imagen: "img/6a2d8df5-75f0-4943-b2ea-a696bc4a14bf.jpg",
    descripcion: "Lote Pulseras Mixtas"
  },
  {
    id: 70,
    nombre: "Lote Pulseras de Hombre",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 34990,
    imagen: "img/4aa69997-747f-4826-b654-355f7b19d299.jpg",
    descripcion: "Lote Pulseras de Hombre"
  },
  {
    id: 71,
    nombre: "Lote Pulseras Hombre Plata 925",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 34990,
    imagen: "img/e312438f-22c7-43cf-b77d-a6c1d6c0cad0.jpg",
    descripcion: "Lote Pulseras Hombre Plata 925"
  },
  {
    id: 72,
    nombre: "Lote Pulseras Plata",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 33900,
    imagen: "img/6147871a-b368-4482-8376-838707c9800d.jpg",
    descripcion: "Lote Pulseras Plata"
  },
  {
    id: 73,
    nombre: "Lote de Pulseras Oro Goldfield 18k — $32.990",
    categoria: "pulseras",
    material: "oro-goldfit",
    precio: 32990,
    imagen: "img/8b9dc60e-0671-4955-a5d6-1b9a68b7a1f6.jpg",
    descripcion: "Lote de Pulseras Oro Goldfield 18k — $32.990"
  },
  {
    id: 74,
    nombre: "Lote de Pulseras Hombre — $32.990",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 32990,
    imagen: "img/0bef8fcb-fbc5-47e7-b3bb-efd3706f368f.jpg",
    descripcion: "Lote de Pulseras Hombre — $32.990"
  },
  {
    id: 75,
    nombre: "Lote de Pulseras Hombre Figaro",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 31990,
    imagen: "img/0efcc576-8803-4f8b-8cf0-8f62112fdd00.jpg",
    descripcion: "Lote de Pulseras Hombre Figaro"
  },
  {
    id: 76,
    nombre: "Lote Pulseras Exclusivas Colores",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 30900,
    imagen: "img/6b8357bc-1c59-4922-8ef0-e0b66197e7d7.jpg",
    descripcion: "Lote Pulseras Exclusivas Colores"
  },
  {
    id: 77,
    nombre: "Lote Pulseras Cadenas",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 30000,
    imagen: "img/582834b9-e5ed-4c03-8f6f-5f1c15634206.jpg",
    descripcion: "Lote Pulseras Cadenas"
  },
  {
    id: 78,
    nombre: "Lote de Pulseras Microzircon",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 30000,
    imagen: "img/82819987-6d83-45e3-8802-c8fcd89419c7.jpg",
    descripcion: "Lote de Pulseras Microzircon"
  },
  {
    id: 79,
    nombre: "Lote de Pulseras Gruesas",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 29999,
    imagen: "img/cbfd771f-3dfe-42ed-b541-792f404128de.jpg",
    descripcion: "Lote de Pulseras Gruesas"
  },
  {
    id: 80,
    nombre: "Lote Pulseras Mujer Variado",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 29990,
    imagen: "img/57fff585-11c6-4fd1-a3b5-70386d87d03c.jpg",
    descripcion: "Lote Pulseras Mujer Variado"
  },
  {
    id: 81,
    nombre: "Lote Pulseras Hombre Plata",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 29990,
    imagen: "img/9e7931de-a866-467c-a0f0-c0fa1591ef1e.jpg",
    descripcion: "Lote Pulseras Hombre Plata"
  },
  {
    id: 82,
    nombre: "Lote de Pulseras Mixtas",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 29900,
    imagen: "img/250e42ad-60a5-4c13-a470-a54d82bb91e6.jpg",
    descripcion: "Lote de Pulseras Mixtas"
  },
  {
    id: 83,
    nombre: "Lote de Pulseras Hombre — $28.990",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 28990,
    imagen: "img/1d9ff6c1-0f0d-4cfd-b3f1-f0d580035722.jpg",
    descripcion: "Lote de Pulseras Hombre — $28.990"
  },
  {
    id: 84,
    nombre: "Lote de Pulseras de Hombre Variado",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 28990,
    imagen: "img/bf4ef5af-3cd2-4614-a2f7-ba8316e61460.jpg",
    descripcion: "Lote de Pulseras de Hombre Variado"
  },
  {
    id: 85,
    nombre: "Lote Pulseras Cartier",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 26990,
    imagen: "img/34e34bff-8c00-469b-990f-bb02fd347e54.jpg",
    descripcion: "Lote Pulseras Cartier"
  },
  {
    id: 86,
    nombre: "Lote Pulseras Hombre Variado",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 25990,
    imagen: "img/99128483-6f81-4340-b031-0af1432c72f9.jpg",
    descripcion: "Lote Pulseras Hombre Variado"
  },
  {
    id: 87,
    nombre: "Lote Pulseras de Hombre + Pulsera Oro Goldfield",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 25990,
    imagen: "img/eb2bfdcd-4195-452f-97eb-025cb9d0a90a.jpg",
    descripcion: "Lote Pulseras de Hombre + Pulsera Oro Goldfield"
  },
  {
    id: 88,
    nombre: "Lote Pulseras Cadena Plata",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 25900,
    imagen: "img/9b2aa4b2-34e3-4932-a3ea-689212888d25.jpg",
    descripcion: "Lote Pulseras Cadena Plata"
  },
  {
    id: 89,
    nombre: "Lote Pulseras Mujer",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 25500,
    imagen: "img/4624d1dc-204f-453e-89b3-4085229d9a22.jpg",
    descripcion: "Lote Pulseras Mujer"
  },
  {
    id: 90,
    nombre: "Lote Emprendedor de Pulseras",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 24990,
    imagen: "img/0103ece2-e0e0-4e3f-9ad3-67c5ed44830f.jpg",
    descripcion: "Lote Emprendedor de Pulseras"
  },
  {
    id: 91,
    nombre: "Lote de Pulseras Oro Goldfield — $24.990",
    categoria: "pulseras",
    material: "oro-goldfit",
    precio: 24990,
    imagen: "img/050139a4-dc48-4209-8e7a-faba56920474.jpg",
    descripcion: "Lote de Pulseras Oro Goldfield — $24.990"
  },
  {
    id: 92,
    nombre: "Lote de Pulseras Full Micro",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 24990,
    imagen: "img/0ab50e02-9d32-436d-849f-93256b13e863.jpg",
    descripcion: "Lote de Pulseras Full Micro"
  },
  {
    id: 93,
    nombre: "Lote de Pulseras Rosario Exclusivos",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 24990,
    imagen: "img/41c19b85-0ff0-4f54-9206-62b5dcd9bc7a.jpg",
    descripcion: "Lote de Pulseras Rosario Exclusivos"
  },
  {
    id: 94,
    nombre: "Lote de Pulseras Mujer con Oro Goldfield",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 24990,
    imagen: "img/b8c6c072-2ce8-4100-b0fb-e34c87458b83.jpg",
    descripcion: "Lote de Pulseras Mujer con Oro Goldfield"
  },
  {
    id: 95,
    nombre: "Pulseras de Hombre con Pulsera Oro Goldfield",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 23990,
    imagen: "img/4adffb90-9ee1-483d-8e3d-731890660373.jpg",
    descripcion: "Pulseras de Hombre con Pulsera Oro Goldfield"
  },
  {
    id: 96,
    nombre: "Lote de Pulseras Mujer",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 23900,
    imagen: "img/001c3547-50f0-4aca-ac1c-18fcd6177d9f.jpg",
    descripcion: "Lote de Pulseras Mujer"
  },
  {
    id: 97,
    nombre: "Lote Pulseras Rolo",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 23900,
    imagen: "img/389d25cd-2e64-4188-be89-f7754a5b90fa.jpg",
    descripcion: "Lote Pulseras Rolo"
  },
  {
    id: 98,
    nombre: "Lote de Pulseras Lux",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 22990,
    imagen: "img/05d3aa9a-b2ff-409d-a6ce-ec993fb281e8.jpg",
    descripcion: "Lote de Pulseras Lux"
  },
  {
    id: 99,
    nombre: "Lote Pulseras Mujer Piedras",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 22500,
    imagen: "img/91d21d07-cd6c-4008-846f-38ceaf0a2723.jpg",
    descripcion: "Lote Pulseras Mujer Piedras"
  },
  {
    id: 100,
    nombre: "Lote Love Black Oro Goldfield 18K",
    categoria: "pulseras",
    material: "oro-goldfit",
    precio: 22000,
    imagen: "img/080ad069-33b1-49ee-bd47-a7fb09ec4c38.jpg",
    descripcion: "Lote Love Black Oro Goldfield 18K"
  },
  {
    id: 101,
    nombre: "Lote de Pulseras Mixto Oro Goldfield",
    categoria: "pulseras",
    material: "oro-goldfit",
    precio: 20500,
    imagen: "img/91e8974d-ba37-4937-a309-3cf936471de8.jpg",
    descripcion: "Lote de Pulseras Mixto Oro Goldfield"
  },
  {
    id: 102,
    nombre: "Lote de Pulseras Oro Goldfield 18K — $20.000",
    categoria: "pulseras",
    material: "oro-goldfit",
    precio: 20000,
    imagen: "img/fcaa36d6-9983-4e92-b88f-a03f35fd018d.jpg",
    descripcion: "Lote de Pulseras Oro Goldfield 18K — $20.000"
  },
  {
    id: 103,
    nombre: "Combi Pololos (2 pulseras + cajas)",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 19990,
    imagen: "img/84242499-fb91-4f4f-a661-f642f4eb0c8d.jpg",
    descripcion: "Combi Pololos (2 pulseras + cajas)"
  },
  {
    id: 104,
    nombre: "Lote Pulseras de Hombre Figaro 3mm",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 19990,
    imagen: "img/330d532a-55f6-4695-bab6-4a4e25732679.jpg",
    descripcion: "Lote Pulseras de Hombre Figaro 3mm",
    opciones: [{"etiqueta":"10 unidades","precio":19990},{"etiqueta":"20 unidades","precio":35000}]
  },
  {
    id: 105,
    nombre: "Lote de Pulseras Oro Goldfield — $19.500",
    categoria: "pulseras",
    material: "oro-goldfit",
    precio: 19500,
    imagen: "img/8164c1d9-d2e6-4072-abe1-7573ca621488.jpg",
    descripcion: "Lote de Pulseras Oro Goldfield — $19.500"
  },
  {
    id: 106,
    nombre: "Lote 9 Pulseras",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 18900,
    imagen: "img/26C7EB37-3543-45ED-9E9F-CFCBE62B8E81_4F7E9D74-9AAF-436A-B9C6-4B5D936B6643.jpg",
    descripcion: "Lote 9 Pulseras"
  },
  {
    id: 107,
    nombre: "Combi Pololos Gotas (2 pulseras + cajas)",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 17990,
    imagen: "img/8bb5080c-8f99-4e7e-8d43-3836d171e802.jpg",
    descripcion: "Combi Pololos Gotas (2 pulseras + cajas)"
  },
  {
    id: 108,
    nombre: "Combi Pololos Luxury (2 pulseras + cajas)",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 17990,
    imagen: "img/13ea7390-d56d-493e-8e74-b43b4942113b.jpg",
    descripcion: "Combi Pololos Luxury (2 pulseras + cajas)"
  },
  {
    id: 109,
    nombre: "Lote Pulseras y Aros",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 14990,
    imagen: "img/1c96ed8d-a691-4637-b232-298c6173241e.jpg",
    descripcion: "Lote Pulseras y Aros"
  },
  {
    id: 110,
    nombre: "Lote de Pulseras Oro Goldfield 18K — $14.990",
    categoria: "pulseras",
    material: "oro-goldfit",
    precio: 14990,
    imagen: "img/733cfed8-f9dd-4418-8a2f-665aa707954c.jpg",
    descripcion: "Lote de Pulseras Oro Goldfield 18K — $14.990"
  },
  {
    id: 111,
    nombre: "Hermosas Pulseras Basicas",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 14990,
    imagen: "img/cea39dbd-8e90-4eb8-a328-4f84c8da490a.jpg",
    descripcion: "Hermosas Pulseras Basicas"
  },
  {
    id: 112,
    nombre: "Lote de Pulseras Angelito",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 12900,
    imagen: "img/933eafa3-fae3-4e49-9edf-274e467749aa.jpg",
    descripcion: "Lote de Pulseras Angelito"
  },
  {
    id: 113,
    nombre: "Oferta para Ellos Pulseras",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 10990,
    imagen: "img/6fcfde65-f65f-4802-9dd2-70f67b6d5fbe.jpg",
    descripcion: "Oferta para Ellos Pulseras"
  },
  {
    id: 114,
    nombre: "Oferta 10 Pulseras Corazon",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 10000,
    imagen: "img/ab26d465-9fff-4eb2-a2cd-7adc82fd8f62.jpg",
    descripcion: "Oferta 10 Pulseras Corazon"
  },
  {
    id: 115,
    nombre: "5 Pulseras Elasticadas (Oferta)",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 9890,
    imagen: "img/26b2801a-e61b-4d52-88d0-d4144785da41.jpg",
    descripcion: "5 Pulseras Elasticadas (Oferta)"
  },
  {
    id: 116,
    nombre: "Pulseras Pandora",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 8900,
    imagen: "img/c3ccc080-9f1f-491b-b79f-e0f6068098a8.jpg",
    descripcion: "Pulseras Pandora",
    opciones: [{"etiqueta":"1 unidad","precio":8900},{"etiqueta":"2 unidades","precio":15900},{"etiqueta":"3 unidades","precio":22900},{"etiqueta":"5 unidades","precio":32900}]
  },
  {
    id: 117,
    nombre: "Mini Lote Emprendedor — $5.990",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 5990,
    imagen: "img/1b3e18b2-e719-4ff2-b576-b9c30118b8d3.jpg",
    descripcion: "Mini Lote Emprendedor — $5.990"
  },
  {
    id: 118,
    nombre: "Pulsera Eslabon Griego",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 4650,
    imagen: "img/d982b34d-8494-4c47-9422-33c577328e7d.jpg",
    descripcion: "Pulsera Eslabon Griego"
  },
  {
    id: 119,
    nombre: "Pulsera Bolitas de Colores Enjauladas",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 4400,
    imagen: "img/d6c269a9-9b40-4847-af70-cb57b7eddb7e.jpg",
    descripcion: "Pulsera Bolitas de Colores Enjauladas"
  },
  {
    id: 120,
    nombre: "Pulsera Bolitas y Flor",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 3000,
    imagen: "img/fa99f915-6f6b-464d-b9b9-6d836b80d294.jpg",
    descripcion: "Pulsera Bolitas y Flor"
  },
  {
    id: 121,
    nombre: "Pulsera Ojo de Gato Ovalada",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 2660,
    imagen: "img/3211d500-0592-426f-8793-439de1d57525.jpg",
    descripcion: "Pulsera Ojo de Gato Ovalada"
  },
  {
    id: 122,
    nombre: "Pulsera Ojitos de Colores",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 2660,
    imagen: "img/357febe7-7768-4164-9b01-b070e06d966a.jpg",
    descripcion: "Pulsera Ojitos de Colores"
  },
  {
    id: 123,
    nombre: "Pulsera Ojitos Negros",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 2660,
    imagen: "img/92cb5881-7cbc-4c54-b7c0-f1e01e0090ac.jpg",
    descripcion: "Pulsera Ojitos Negros"
  },
  {
    id: 124,
    nombre: "Pulsera de Perlas y Cadena",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 2600,
    imagen: "img/716670a0-4dcf-46cd-9547-a33762736910.jpg",
    descripcion: "Pulsera de Perlas y Cadena"
  },
  {
    id: 125,
    nombre: "Pulsera Medallas Caladas de Flores",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 2500,
    imagen: "img/385a2158-ae15-4822-83fc-606db3f5cc89.jpg",
    descripcion: "Pulsera Medallas Caladas de Flores"
  },
  {
    id: 126,
    nombre: "Pulsera Ojitos de Colores Redondos",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 2500,
    imagen: "img/ecd454b7-c397-4bec-b4a5-443d5f41a61b.jpg",
    descripcion: "Pulsera Ojitos de Colores Redondos"
  },
  {
    id: 127,
    nombre: "Pulsera Bolitas Diamantadas",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 2300,
    imagen: "img/8dba27d2-b58d-4a80-b86e-2f4b1bf8c6dd.jpg",
    descripcion: "Pulsera Bolitas Diamantadas"
  },
  {
    id: 128,
    nombre: "Pulsera Ojo Turco Rombos",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 1990,
    imagen: "img/4c93d2e9-6f6a-4930-b74d-cc24169a283c.jpg",
    descripcion: "Pulsera Ojo Turco Rombos"
  },
  {
    id: 129,
    nombre: "Pulsera Medalla Calada de Flores",
    categoria: "pulseras",
    material: "plata-nacional",
    precio: 1900,
    imagen: "img/87cefab7-09aa-435d-918a-4e93e215ef44.jpg",
    descripcion: "Pulsera Medalla Calada de Flores"
  },
  {
    id: 130,
    nombre: "Pulsera Cartier 3x1 Plata Italiana 925",
    categoria: "pulseras",
    material: "plata-italiana",
    precio: 0,
    imagen: "img/8E54E911-C1AB-45B6-A6D3-FD29AFEC70D2_2269E398-E69D-4396-984E-9D0D8A9A874F.jpg",
    descripcion: "Pulsera Cartier 3x1 Plata Italiana 925"
  },
  {
    id: 131,
    nombre: "Remate Oro Laminado Italiano 18K",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 58900,
    imagen: "img/21E78ADF-4A46-4A33-8AB1-91B32EA2303C_60445652-00E9-4C7B-AB17-6F47334153D2.jpg",
    descripcion: "Remate Oro Laminado Italiano 18K"
  },
  {
    id: 132,
    nombre: "Super Lote de Argollas",
    categoria: "aros",
    material: "plata-nacional",
    precio: 52990,
    imagen: "img/856235df-e2d9-4168-91af-2afa940643e1.jpg",
    descripcion: "Super Lote de Argollas"
  },
  {
    id: 133,
    nombre: "Lote de Argollas Oro Goldfit Italiano",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 52900,
    imagen: "img/3a60b0f0-8a07-47a3-a0d3-84c15d0704cd.jpg",
    descripcion: "Lote de Argollas Oro Goldfit Italiano"
  },
  {
    id: 134,
    nombre: "Lote Aros Argollas",
    categoria: "aros",
    material: "plata-nacional",
    precio: 38500,
    imagen: "img/90eae204-03dc-457f-b312-8db1af30796f.jpg",
    descripcion: "Lote Aros Argollas"
  },
  {
    id: 135,
    nombre: "Lote de Aros Grandes (8 pares)",
    categoria: "aros",
    material: "plata-nacional",
    precio: 35000,
    imagen: "img/6D39F581-1978-4BA3-97A4-1D62AAFD2504_569DA9E5-8D11-4DBC-AD5E-4698352D6E73.jpg",
    descripcion: "Lote de Aros Grandes (8 pares)"
  },
  {
    id: 136,
    nombre: "Lote de Aritos y Argollas Oro Goldfield 18K",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 30990,
    imagen: "img/573512bd-4db6-46da-b292-831376fe1cea.jpg",
    descripcion: "Lote de Aritos y Argollas Oro Goldfield 18K"
  },
  {
    id: 137,
    nombre: "Lote Argollas Oro Goldfit Italiano 18K",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 30990,
    imagen: "img/ff73a19d-7170-458e-b81c-c93f7d583041.jpg",
    descripcion: "Lote Argollas Oro Goldfit Italiano 18K"
  },
  {
    id: 138,
    nombre: "Lote Aros Largos Exclusivos",
    categoria: "aros",
    material: "plata-nacional",
    precio: 30000,
    imagen: "img/FE63558D-85FC-4D47-863D-F88FB6BEC399_D8C0F145-BEE0-498C-93BE-E168B2EA2F0D.jpg",
    descripcion: "Lote Aros Largos Exclusivos"
  },
  {
    id: 139,
    nombre: "Lote de Argollas Oro Goldfield 18K — $29.990",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 29990,
    imagen: "img/e99d97d4-a5c4-43b0-a016-ed14b512c114.jpg",
    descripcion: "Lote de Argollas Oro Goldfield 18K — $29.990"
  },
  {
    id: 140,
    nombre: "Lote de Argollas Oro Goldfield Ojo",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 28990,
    imagen: "img/5ed23196-2aa7-4580-833e-ac857bad5cb7.jpg",
    descripcion: "Lote de Argollas Oro Goldfield Ojo"
  },
  {
    id: 141,
    nombre: "Lote de Aritos Luxury",
    categoria: "aros",
    material: "plata-nacional",
    precio: 28990,
    imagen: "img/7fbcdf04-615c-427a-8c63-cb6e83fb9850.jpg",
    descripcion: "Lote de Aritos Luxury"
  },
  {
    id: 142,
    nombre: "Lote de Aritos Oro Goldfield 18K — Desde $27.990",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 27990,
    imagen: "img/2732b30e-ac83-41d3-bcbf-9df3d4929f9d.jpg",
    descripcion: "Lote de Aritos Oro Goldfield 18K — Desde $27.990",
    opciones: [{"etiqueta":"Fila 1","precio":28990},{"etiqueta":"Fila 2","precio":27990},{"etiqueta":"Fila 3","precio":27990},{"etiqueta":"Fila 4","precio":31990}]
  },
  {
    id: 143,
    nombre: "Lote de Aritos Largos y Pegados Oro Goldfield 18K",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 27990,
    imagen: "img/5e983f12-6db2-44fc-b147-30079f1c2ca0.jpg",
    descripcion: "Lote de Aritos Largos y Pegados Oro Goldfield 18K"
  },
  {
    id: 144,
    nombre: "Lote de Argollas y Aros Pegados Luxury",
    categoria: "aros",
    material: "plata-nacional",
    precio: 27990,
    imagen: "img/e12bb489-c833-4393-a5f1-9fa7db998471.jpg",
    descripcion: "Lote de Argollas y Aros Pegados Luxury"
  },
  {
    id: 145,
    nombre: "Lote de Aros Mixtos",
    categoria: "aros",
    material: "plata-nacional",
    precio: 27900,
    imagen: "img/AABD925B-A34C-4E2B-822A-E26E8D240C68_73E7A4E9-2984-41D6-9846-C0F060D83ED2.jpg",
    descripcion: "Lote de Aros Mixtos"
  },
  {
    id: 146,
    nombre: "Lote de Aritos Oro Goldfield 18K — Desde $25.990",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 25990,
    imagen: "img/3ed45ec0-5ad7-4536-8fa0-2860f3fdaddb.jpg",
    descripcion: "Lote de Aritos Oro Goldfield 18K — Desde $25.990",
    opciones: [{"etiqueta":"Fila 1","precio":25990},{"etiqueta":"Fila 2","precio":26990},{"etiqueta":"Fila 3","precio":25990},{"etiqueta":"Fila 4","precio":27990}]
  },
  {
    id: 147,
    nombre: "Lote de Argollas Oro Goldfield Variado",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 25990,
    imagen: "img/78bd9d52-d3cc-4ec4-9eca-d05186533a53.jpg",
    descripcion: "Lote de Argollas Oro Goldfield Variado"
  },
  {
    id: 148,
    nombre: "Lote de Argollas Oro Goldfield 18K Corazon — $25.990",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 25990,
    imagen: "img/bf879a6f-b9c1-453f-8cac-0a2dd7419447.jpg",
    descripcion: "Lote de Argollas Oro Goldfield 18K Corazon — $25.990"
  },
  {
    id: 149,
    nombre: "Lote Aros Mujer",
    categoria: "aros",
    material: "plata-nacional",
    precio: 25500,
    imagen: "img/40e66254-1bae-40fb-a843-c848a49a7bc2.jpg",
    descripcion: "Lote Aros Mujer"
  },
  {
    id: 150,
    nombre: "Lote de Pelotitas Goldfield Italiano 18K",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 24999,
    imagen: "img/e79f4258-cf77-484c-b40a-c582c0728ef4.jpg",
    descripcion: "Lote de Pelotitas Goldfield Italiano 18K"
  },
  {
    id: 151,
    nombre: "Lote de Argollas Oro Goldfield 18K — $24.990",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 24990,
    imagen: "img/34ff0914-8b7e-4d10-85f3-cc0e8728d936.jpg",
    descripcion: "Lote de Argollas Oro Goldfield 18K — $24.990"
  },
  {
    id: 152,
    nombre: "Lote de Argollas Lisas",
    categoria: "aros",
    material: "plata-nacional",
    precio: 24990,
    imagen: "img/6057fc86-7531-4140-a4a3-5fc016ea4264.jpg",
    descripcion: "Lote de Argollas Lisas"
  },
  {
    id: 153,
    nombre: "Lote de Argollas Oro Goldfield 18K Corazon — $24.990",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 24990,
    imagen: "img/6d4b57b5-dd55-4d70-a466-77ca4b9244bf.jpg",
    descripcion: "Lote de Argollas Oro Goldfield 18K Corazon — $24.990"
  },
  {
    id: 154,
    nombre: "Lote de Aritos Goldfit Italiano 18K",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 24990,
    imagen: "img/7138339d-2d73-46ce-80a4-69ad93ec4b42.jpg",
    descripcion: "Lote de Aritos Goldfit Italiano 18K"
  },
  {
    id: 155,
    nombre: "Lote Aros Mujer Griego",
    categoria: "aros",
    material: "plata-nacional",
    precio: 24900,
    imagen: "img/c66c33b2-656d-4972-87fd-ab41a2eafadd.jpg",
    descripcion: "Lote Aros Mujer Griego"
  },
  {
    id: 156,
    nombre: "Lote de Aros Largos Nudo de Bruja",
    categoria: "aros",
    material: "plata-nacional",
    precio: 23990,
    imagen: "img/253ebd9b-ab57-4ddc-9ef8-844443bd04f9.jpg",
    descripcion: "Lote de Aros Largos Nudo de Bruja"
  },
  {
    id: 157,
    nombre: "Lote de Aritos Pegados y Argollas Oro Goldfield 18K",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 23990,
    imagen: "img/3fd76fd5-c8fd-4d53-9a7b-0d31a6e34e57.jpg",
    descripcion: "Lote de Aritos Pegados y Argollas Oro Goldfield 18K",
    opciones: [{"etiqueta":"Fila 1","precio":25990},{"etiqueta":"Fila 2","precio":23990},{"etiqueta":"Fila 3","precio":23990},{"etiqueta":"Fila 4","precio":23990}]
  },
  {
    id: 158,
    nombre: "Lote de Argollas Oro Goldfield 18K Corazon — $23.990",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 23990,
    imagen: "img/7a6ecdd1-a837-43f6-aff4-c3020d9f38e9.jpg",
    descripcion: "Lote de Argollas Oro Goldfield 18K Corazon — $23.990"
  },
  {
    id: 159,
    nombre: "Lote Aros Variado",
    categoria: "aros",
    material: "plata-nacional",
    precio: 23900,
    imagen: "img/95fa5b11-50cb-4019-8f2c-c8cad691205c.jpg",
    descripcion: "Lote Aros Variado"
  },
  {
    id: 160,
    nombre: "Lote Aros Enroscados",
    categoria: "aros",
    material: "plata-nacional",
    precio: 23500,
    imagen: "img/5aa77253-3227-4399-a26e-277f33c3d5d6.jpg",
    descripcion: "Lote Aros Enroscados"
  },
  {
    id: 161,
    nombre: "Lote de Argollas Oro Goldfield 18K — $22.990",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 22990,
    imagen: "img/51e2cccc-8226-4706-bbbd-a7cc2bf70736.jpg",
    descripcion: "Lote de Argollas Oro Goldfield 18K — $22.990"
  },
  {
    id: 162,
    nombre: "Lote de Aros Bote Oro Goldfield",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 22990,
    imagen: "img/ab44a5f4-2779-4d56-bd21-da5032503660.jpg",
    descripcion: "Lote de Aros Bote Oro Goldfield"
  },
  {
    id: 163,
    nombre: "Lote de Argollas Plata 925",
    categoria: "aros",
    material: "plata-nacional",
    precio: 22500,
    imagen: "img/fd1d4e21-8c65-41bc-a0cd-f379d9bd8863.jpg",
    descripcion: "Lote de Argollas Plata 925"
  },
  {
    id: 164,
    nombre: "Lote Aros Mujer Cruz",
    categoria: "aros",
    material: "plata-nacional",
    precio: 21990,
    imagen: "img/6186ff08-df1b-4ced-a053-8b0cd972f6ef.jpg",
    descripcion: "Lote Aros Mujer Cruz"
  },
  {
    id: 165,
    nombre: "Lote de Argollas Lisas y Botes",
    categoria: "aros",
    material: "plata-nacional",
    precio: 21990,
    imagen: "img/87cb338d-30ff-4537-b3a0-7648c143c1ae.jpg",
    descripcion: "Lote de Argollas Lisas y Botes"
  },
  {
    id: 166,
    nombre: "Lote Aros de Colores (13 pares)",
    categoria: "aros",
    material: "plata-nacional",
    precio: 21900,
    imagen: "img/2be5da24-f1f6-4f79-821f-26d10c6b61de.jpg",
    descripcion: "Lote Aros de Colores (13 pares)"
  },
  {
    id: 167,
    nombre: "Lote de Aritos Bote Oro Goldfield 18K",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 21500,
    imagen: "img/4a0f9665-0236-499f-8a03-cdf2143c2716.jpg",
    descripcion: "Lote de Aritos Bote Oro Goldfield 18K"
  },
  {
    id: 168,
    nombre: "Lote de Aritos Pegados Variado",
    categoria: "aros",
    material: "plata-nacional",
    precio: 20990,
    imagen: "img/61b3ba2c-a1dc-42a3-ba6d-457da02da96c.jpg",
    descripcion: "Lote de Aritos Pegados Variado",
    opciones: [{"etiqueta":"Fila 1","precio":20990},{"etiqueta":"Fila 2","precio":21990},{"etiqueta":"Fila 3","precio":20990},{"etiqueta":"Fila 4","precio":23990}]
  },
  {
    id: 169,
    nombre: "Lote de Aritos Love Blue",
    categoria: "aros",
    material: "plata-nacional",
    precio: 20990,
    imagen: "img/69005564-a101-403e-8da2-8a623f777e65.jpg",
    descripcion: "Lote de Aritos Love Blue"
  },
  {
    id: 170,
    nombre: "Lote de Argollas y Aros Oro Goldfield 18K",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 20990,
    imagen: "img/a037638b-ec05-4b94-ae74-30be1f0fdcf4.jpg",
    descripcion: "Lote de Argollas y Aros Oro Goldfield 18K"
  },
  {
    id: 171,
    nombre: "Lote de Aritos Girly",
    categoria: "aros",
    material: "plata-nacional",
    precio: 20990,
    imagen: "img/a417d939-05fb-41f5-b24a-48da5115276e.jpg",
    descripcion: "Lote de Aritos Girly"
  },
  {
    id: 172,
    nombre: "Lote de Aros Oro Goldfield 18K Mixto",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 20990,
    imagen: "img/a854490d-eb2b-4c10-8fa3-818f3a96db15.jpg",
    descripcion: "Lote de Aros Oro Goldfield 18K Mixto"
  },
  {
    id: 173,
    nombre: "Lote de Argollas Enroscadas Variado",
    categoria: "aros",
    material: "plata-nacional",
    precio: 20990,
    imagen: "img/c4bd871c-4b31-4d77-acc2-773d56ba325f.jpg",
    descripcion: "Lote de Argollas Enroscadas Variado"
  },
  {
    id: 174,
    nombre: "Lote de Argollas Variado",
    categoria: "aros",
    material: "plata-nacional",
    precio: 20000,
    imagen: "img/c0457215-7388-432c-9ca5-f3d3668cbdb0.jpg",
    descripcion: "Lote de Argollas Variado"
  },
  {
    id: 175,
    nombre: "Lote de Argollas Enroscadas",
    categoria: "aros",
    material: "plata-nacional",
    precio: 19990,
    imagen: "img/4c1a872e-1f99-4b84-a24d-98e5e4f95eb4.jpg",
    descripcion: "Lote de Argollas Enroscadas"
  },
  {
    id: 176,
    nombre: "Lote de Argollas Variadas",
    categoria: "aros",
    material: "plata-nacional",
    precio: 19990,
    imagen: "img/4fe7690d-5b5d-4a70-8bdf-b7da9c7fb820.jpg",
    descripcion: "Lote de Argollas Variadas"
  },
  {
    id: 177,
    nombre: "Lote Aros Colores",
    categoria: "aros",
    material: "plata-nacional",
    precio: 19990,
    imagen: "img/50090ab2-861c-46d5-8a19-3222026e6ca8.jpg",
    descripcion: "Lote Aros Colores"
  },
  {
    id: 178,
    nombre: "Lote de Aritos Oro Goldfield 18K — Desde $19.990",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 19990,
    imagen: "img/b3925b27-131b-4f93-9421-3725fbdf8783.jpg",
    descripcion: "Lote de Aritos Oro Goldfield 18K — Desde $19.990",
    opciones: [{"etiqueta":"Fila 1","precio":19990},{"etiqueta":"Fila 2","precio":24990},{"etiqueta":"Fila 3","precio":22990},{"etiqueta":"Fila 4","precio":22990}]
  },
  {
    id: 179,
    nombre: "Lote de Argollas y Aros Oro Goldfield",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 19500,
    imagen: "img/a2207ca8-b295-4622-a104-9ef05d51d562.jpg",
    descripcion: "Lote de Argollas y Aros Oro Goldfield"
  },
  {
    id: 180,
    nombre: "Lote de Aritos Pegados — Desde $18.990",
    categoria: "aros",
    material: "plata-nacional",
    precio: 18990,
    imagen: "img/3f82429c-fcf7-4700-bc98-4674557b50a2.jpg",
    descripcion: "Lote de Aritos Pegados — Desde $18.990",
    opciones: [{"etiqueta":"Fila 1","precio":18990},{"etiqueta":"Fila 2","precio":24990},{"etiqueta":"Fila 3","precio":19990},{"etiqueta":"Fila 4","precio":21990}]
  },
  {
    id: 181,
    nombre: "Lote de Argollas Diamantadas Variado",
    categoria: "aros",
    material: "plata-nacional",
    precio: 18990,
    imagen: "img/8b33f94e-7092-4963-acdc-20cd07335fad.jpg",
    descripcion: "Lote de Argollas Diamantadas Variado"
  },
  {
    id: 182,
    nombre: "Lote de Argollas Lisas Variado",
    categoria: "aros",
    material: "plata-nacional",
    precio: 18990,
    imagen: "img/bb90552e-971b-4ecb-8503-842ba29aa3b8.jpg",
    descripcion: "Lote de Argollas Lisas Variado"
  },
  {
    id: 183,
    nombre: "Lote de Argollas Oro Goldfield 18K Chicas",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 17990,
    imagen: "img/70294424-b25a-4243-8244-68ed016a7dbd.jpg",
    descripcion: "Lote de Argollas Oro Goldfield 18K Chicas"
  },
  {
    id: 184,
    nombre: "Lote de Aritos Oro Goldfield 18K Pegados",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 17990,
    imagen: "img/ac23c84d-1b53-41c2-bdf0-33378f3f6254.jpg",
    descripcion: "Lote de Aritos Oro Goldfield 18K Pegados"
  },
  {
    id: 185,
    nombre: "Lote de Aritos Coquette Plata 925",
    categoria: "aros",
    material: "plata-nacional",
    precio: 17990,
    imagen: "img/e0a38157-076d-4136-813f-5baf05951774.jpg",
    descripcion: "Lote de Aritos Coquette Plata 925"
  },
  {
    id: 186,
    nombre: "Lote de Aritos Oro Goldfield Italiano 18K",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 17500,
    imagen: "img/e169b5c0-c86a-42b2-ad77-c94b3d9c95f7.jpg",
    descripcion: "Lote de Aritos Oro Goldfield Italiano 18K"
  },
  {
    id: 187,
    nombre: "Lote de Pelotitas Medianas",
    categoria: "aros",
    material: "plata-nacional",
    precio: 14990,
    imagen: "img/71294fe0-a66e-4b94-9c1f-ce90d8ef0a72.jpg",
    descripcion: "Lote de Pelotitas Medianas"
  },
  {
    id: 188,
    nombre: "Lote de Argollas Oro Goldfield 18K Chico",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 14990,
    imagen: "img/dbac3862-6d4a-4ad1-98d4-928037846792.jpg",
    descripcion: "Lote de Argollas Oro Goldfield 18K Chico"
  },
  {
    id: 189,
    nombre: "Lote Cajita Flash Aros Oro 18K",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 12500,
    imagen: "img/dddd0a90-6e42-47ec-8f29-f0b22f49ab4f.jpg",
    descripcion: "Lote Cajita Flash Aros Oro 18K"
  },
  {
    id: 190,
    nombre: "Lote Aros Pegados",
    categoria: "aros",
    material: "plata-nacional",
    precio: 10000,
    imagen: "img/94dfe678-687c-4b7c-bff9-55d1ca0d9b94.jpg",
    descripcion: "Lote Aros Pegados"
  },
  {
    id: 191,
    nombre: "Lote de Aritos Pegados — $10.000",
    categoria: "aros",
    material: "plata-nacional",
    precio: 10000,
    imagen: "img/013286db-84ba-45b8-b228-a02026f4b0a3.jpg",
    descripcion: "Lote de Aritos Pegados — $10.000"
  },
  {
    id: 192,
    nombre: "Lote de Aritos Pegados Pelotitas",
    categoria: "aros",
    material: "plata-nacional",
    precio: 10000,
    imagen: "img/266aff26-3170-4db6-aa6e-aa62de65ece2.jpg",
    descripcion: "Lote de Aritos Pegados Pelotitas"
  },
  {
    id: 193,
    nombre: "Lote de Aritos Luxury Pink",
    categoria: "aros",
    material: "plata-nacional",
    precio: 10000,
    imagen: "img/93da1f87-3e74-4158-9f9f-dcb3613d0134.jpg",
    descripcion: "Lote de Aritos Luxury Pink"
  },
  {
    id: 194,
    nombre: "Lote de Aros Pegados Cuadrados",
    categoria: "aros",
    material: "plata-nacional",
    precio: 10000,
    imagen: "img/bb9e7271-5d7b-4086-a613-9cb87a83bd2d.jpg",
    descripcion: "Lote de Aros Pegados Cuadrados"
  },
  {
    id: 195,
    nombre: "Lote de Aritos Pegados Plata 925",
    categoria: "aros",
    material: "plata-nacional",
    precio: 10000,
    imagen: "img/ec874e4c-3afa-46f3-b277-8feccf01de4b.jpg",
    descripcion: "Lote de Aritos Pegados Plata 925"
  },
  {
    id: 196,
    nombre: "Lote Cajita Flash Oro GF",
    categoria: "aros",
    material: "oro-goldfit",
    precio: 6990,
    imagen: "img/077add64-916d-41c5-9ca8-b3af769b567f.jpg",
    descripcion: "Lote Cajita Flash Oro GF"
  },
  {
    id: 197,
    nombre: "Aros Cruz",
    categoria: "aros",
    material: "plata-nacional",
    precio: 6000,
    imagen: "img/f12d98a5-70b3-4d21-bd38-013a5df1d08b.jpg",
    descripcion: "Aros Cruz"
  },
  {
    id: 198,
    nombre: "Aros Argolla Ovalada Grande",
    categoria: "aros",
    material: "plata-nacional",
    precio: 4800,
    imagen: "img/67cf20e4-ac9a-452c-a7d2-20a20c47ca11.jpg",
    descripcion: "Aros Argolla Ovalada Grande"
  },
  {
    id: 199,
    nombre: "Aros Argolla Cuadrada",
    categoria: "aros",
    material: "plata-nacional",
    precio: 3600,
    imagen: "img/76fad060-f0da-4780-b266-64eacce10421.jpg",
    descripcion: "Aros Argolla Cuadrada"
  },
  {
    id: 200,
    nombre: "Oferta Medallones Equipos",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 30000,
    imagen: "img/83dc069b-435e-4ae0-a11e-4d0db9ae3e74.jpg",
    descripcion: "Oferta Medallones Equipos"
  },
  {
    id: 201,
    nombre: "Lote 12 Colgantes",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 25000,
    imagen: "img/4430E33C-61F5-44C9-BDF0-0C84567FC897_FD4C79E1-99A8-4D3D-B251-9E343D3C56F7.jpg",
    descripcion: "Lote 12 Colgantes"
  },
  {
    id: 202,
    nombre: "Lote de Colgantes Religiosos",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 23500,
    imagen: "img/9bcdcb47-475f-46ad-b363-9d7950b30662.jpg",
    descripcion: "Lote de Colgantes Religiosos"
  },
  {
    id: 203,
    nombre: "Lote de Cruces",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 21990,
    imagen: "img/00b98d38-6f87-431e-b971-ff05160323cd.jpg",
    descripcion: "Lote de Cruces"
  },
  {
    id: 204,
    nombre: "Lote Colgantes Nudo de Bruja",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 19990,
    imagen: "img/4855b27c-e6d3-45a4-9709-ebc2b103e8ff.jpg",
    descripcion: "Lote Colgantes Nudo de Bruja"
  },
  {
    id: 205,
    nombre: "Lote de Puntos de Luz Plata 925",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 16990,
    imagen: "img/f67d8d27-85c3-4dd4-81d1-2d88ba3bf029.jpg",
    descripcion: "Lote de Puntos de Luz Plata 925"
  },
  {
    id: 206,
    nombre: "Lote de Colgantes Equipos",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 15990,
    imagen: "img/3fdd73c4-99ad-4b7a-9e39-4a1a8405e60b.jpg",
    descripcion: "Lote de Colgantes Equipos"
  },
  {
    id: 207,
    nombre: "Lote de Colgantes Puntos de Luz",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 14990,
    imagen: "img/40be8d29-8e6e-43cf-8777-f4698c92e5ac.jpg",
    descripcion: "Lote de Colgantes Puntos de Luz"
  },
  {
    id: 208,
    nombre: "Lote Doglover",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 14990,
    imagen: "img/85ce22af-7b1d-448f-9b1a-ff1fbdf3d680.jpg",
    descripcion: "Lote Doglover"
  },
  {
    id: 209,
    nombre: "Lote Perritos",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 12900,
    imagen: "img/2ee659ad-fcbf-4478-857a-dc16e93bb0c4.jpg",
    descripcion: "Lote Perritos"
  },
  {
    id: 210,
    nombre: "Colgante Rostro de Cristo",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 11700,
    imagen: "img/01c2fe28-f71e-437c-b569-355e4e35de7c_8158FC93-0A4F-4646-8BA3-C30295CB0077.jpg",
    descripcion: "Colgante Rostro de Cristo"
  },
  {
    id: 211,
    nombre: "Colgantes Barbie",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 10990,
    imagen: "img/c21eafc3-65ed-402b-9b2c-195d7c115acf.jpg",
    descripcion: "Colgantes Barbie"
  },
  {
    id: 212,
    nombre: "3 Colgantes U de Chile",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 10900,
    imagen: "img/CAA5F30F-C304-4227-9BAB-D6430407D381_C1040729-826F-4007-8B61-A481453B075F.jpg",
    descripcion: "3 Colgantes U de Chile"
  },
  {
    id: 213,
    nombre: "Remate de Colgantes (13 unidades)",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 10000,
    imagen: "img/19856217-9f49-4af0-bf8d-9c5997d8f071.jpg",
    descripcion: "Remate de Colgantes (13 unidades)"
  },
  {
    id: 214,
    nombre: "Remate de Colgantes (17 unidades) — $10.000",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 10000,
    imagen: "img/3d61a4fe-a504-4eca-bdbd-f3a969e17d37.jpg",
    descripcion: "Remate de Colgantes (17 unidades) — $10.000"
  },
  {
    id: 215,
    nombre: "Colgante Tony Montana",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 10000,
    imagen: "img/47DA4048-B8B4-4CE1-AD22-D9C1C44C4A21_85E53293-2ECB-4458-9E7D-7CEC512D25FB.jpg",
    descripcion: "Colgante Tony Montana"
  },
  {
    id: 216,
    nombre: "6 Colgantes BullAlbo Pequeños",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 10000,
    imagen: "img/82D9C467-2EC2-4274-B04A-1B62B0F5CB22_6D4D5B71-79F5-43FE-BEBE-50FD43AFB2CD.jpg",
    descripcion: "6 Colgantes BullAlbo Pequeños"
  },
  {
    id: 217,
    nombre: "Remate de Colgantes (14 unidades)",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 10000,
    imagen: "img/eeffdd89-a659-4159-a635-074a02194874.jpg",
    descripcion: "Remate de Colgantes (14 unidades)"
  },
  {
    id: 218,
    nombre: "Lote de Colgantes Mariposas",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 8990,
    imagen: "img/8f5ec56d-e65e-4811-8a61-00e77dc406db.jpg",
    descripcion: "Lote de Colgantes Mariposas"
  },
  {
    id: 219,
    nombre: "20 Colgantes Van Cleef",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 8900,
    imagen: "img/22a58f02-6d78-455b-a5a1-82314a6fb722.jpg",
    descripcion: "20 Colgantes Van Cleef"
  },
  {
    id: 220,
    nombre: "3 Colgantes Colo Colo",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 8900,
    imagen: "img/A77C0FF8-5C2E-4502-ACFE-43F29679AFB4_2A234DCB-F8D5-405C-9570-1943BEE0577A.jpg",
    descripcion: "3 Colgantes Colo Colo"
  },
  {
    id: 221,
    nombre: "Remate de Colgantes (17 unidades) — $7.900",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 7900,
    imagen: "img/e46065a4-42f0-4448-8ab8-fba81639a281.jpg",
    descripcion: "Remate de Colgantes (17 unidades) — $7.900"
  },
  {
    id: 222,
    nombre: "Lote Económico de Colgantes (3 Niños y 3 Niñas)",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 5900,
    imagen: "img/EF857D9E-3174-430F-9CFA-A2BEA5E341B3_2B4429B3-A565-427D-9469-6C49845CA1D5.jpg",
    descripcion: "Lote Económico de Colgantes (3 Niños y 3 Niñas)"
  },
  {
    id: 223,
    nombre: "Charms Disponibles",
    categoria: "colgantes",
    material: "plata-nacional",
    precio: 0,
    imagen: "img/89416f99-68a4-4f81-a03c-69f06a107572.jpg",
    descripcion: "Charms Disponibles"
  },
  {
    id: 224,
    nombre: "Medio Kilo Surtido de Joyas (129 productos)",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 340000,
    imagen: "img/60fe5392-196a-4a89-87bc-a05c7c75b78c.jpg",
    descripcion: "Medio Kilo Surtido de Joyas (129 productos)"
  },
  {
    id: 225,
    nombre: "Medio Kilo Mixto (145 productos)",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 320000,
    imagen: "img/039a9d07-a454-47d6-846f-0b41138effce.jpg",
    descripcion: "Medio Kilo Mixto (145 productos)"
  },
  {
    id: 226,
    nombre: "Maleta Super Emprende",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 84990,
    imagen: "img/801d5901-0cd0-41e7-8be0-7c7c24e27e2d.jpg",
    descripcion: "Maleta Super Emprende"
  },
  {
    id: 227,
    nombre: "Maleta Emprendedora Full Pink 30 Productos",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 69990,
    imagen: "img/fbdd76e6-0e2e-4722-81ba-9d922257d909.jpg",
    descripcion: "Maleta Emprendedora Full Pink 30 Productos"
  },
  {
    id: 228,
    nombre: "Maleta Emprendedora",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 58900,
    imagen: "img/3a7f6505-0264-4fe3-bf26-dc8e213d367e.jpg",
    descripcion: "Maleta Emprendedora"
  },
  {
    id: 229,
    nombre: "Maleta Emprendedora Full Pink",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 52990,
    imagen: "img/53f882a7-c19b-40ff-ad87-3abe456487c7.jpg",
    descripcion: "Maleta Emprendedora Full Pink"
  },
  {
    id: 230,
    nombre: "Maleta Emprendedora 25 Productos",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 49990,
    imagen: "img/98c07ac3-f79e-41a4-aa61-c6f1b4384628.jpg",
    descripcion: "Maleta Emprendedora 25 Productos"
  },
  {
    id: 231,
    nombre: "Lote de Conjuntos Oro Goldfield Italiano 18k",
    categoria: "conjuntos",
    material: "oro-goldfit",
    precio: 45900,
    imagen: "img/8b668028-0fcb-4ba7-ae2f-5545ff19ea64.jpg",
    descripcion: "Lote de Conjuntos Oro Goldfield Italiano 18k"
  },
  {
    id: 232,
    nombre: "Conjuntos Oro Goldfield Italiano 18k (Cruces)",
    categoria: "conjuntos",
    material: "oro-goldfit",
    precio: 43990,
    imagen: "img/96606cbd-9144-4674-b5b4-0f89733b6541.jpg",
    descripcion: "Conjuntos Oro Goldfield Italiano 18k (Cruces)"
  },
  {
    id: 233,
    nombre: "Conjuntos Oro Goldfield Italiano 18k (Cristo)",
    categoria: "conjuntos",
    material: "oro-goldfit",
    precio: 42990,
    imagen: "img/e979b339-eb86-4da6-aa0c-1dce47b5e09e.jpg",
    descripcion: "Conjuntos Oro Goldfield Italiano 18k (Cristo)"
  },
  {
    id: 234,
    nombre: "Conjuntos Oro GF 18K",
    categoria: "conjuntos",
    material: "oro-goldfit",
    precio: 38900,
    imagen: "img/3C5D360D-781A-45E6-9612-6AEBA016D55A_F6F41B3E-FD09-49C4-A1BD-53963246E76D.jpg",
    descripcion: "Conjuntos Oro GF 18K"
  },
  {
    id: 235,
    nombre: "Conjuntos Oro Italiano Laminado 18K",
    categoria: "conjuntos",
    material: "oro-goldfit",
    precio: 34900,
    imagen: "img/8AEF2C76-732E-4374-8378-0D13DA987E09_5815DCDD-4B91-42B8-AA87-0CC68BF635D4.jpg",
    descripcion: "Conjuntos Oro Italiano Laminado 18K"
  },
  {
    id: 236,
    nombre: "Lote de Conjuntos Pink — $30.990",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 30990,
    imagen: "img/34f89c39-1111-4538-9835-08b5db90a493.jpg",
    descripcion: "Lote de Conjuntos Pink — $30.990"
  },
  {
    id: 237,
    nombre: "Conjuntos Pulsera + Aritos Plata 925",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 29990,
    imagen: "img/f3ff6183-13ff-45bf-8c6f-93d8baaba0fc.jpg",
    descripcion: "Conjuntos Pulsera + Aritos Plata 925"
  },
  {
    id: 238,
    nombre: "Lote Conjuntos Nudo de Bruja",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 28990,
    imagen: "img/628cc518-7302-4638-96ec-dc6fcf9c7522.jpg",
    descripcion: "Lote Conjuntos Nudo de Bruja"
  },
  {
    id: 239,
    nombre: "Lote Principal Love",
    categoria: "conjuntos",
    material: "oro-goldfit",
    precio: 27500,
    imagen: "img/86a5e214-8192-48d0-a90c-70f706eacec2.jpg",
    descripcion: "Lote Principal Love"
  },
  {
    id: 240,
    nombre: "Lote de Conjuntos Red",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 26990,
    imagen: "img/22bd013d-f7a4-442a-93eb-e4853690354b.jpg",
    descripcion: "Lote de Conjuntos Red"
  },
  {
    id: 241,
    nombre: "Lote de Conjuntos",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 23990,
    imagen: "img/1a000bc5-688f-4419-983a-e178d3aca884.jpg",
    descripcion: "Lote de Conjuntos"
  },
  {
    id: 242,
    nombre: "Lote de Conjuntos Pink — $23.990",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 23990,
    imagen: "img/5f00e699-5018-497a-af15-1010d2f789d1.jpg",
    descripcion: "Lote de Conjuntos Pink — $23.990"
  },
  {
    id: 243,
    nombre: "Lote de Conjuntos Full Pink",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 23990,
    imagen: "img/6b8dbe99-ee9e-459e-987a-e935f2d9f8d3.jpg",
    descripcion: "Lote de Conjuntos Full Pink"
  },
  {
    id: 244,
    nombre: "Lote de Conjuntos Dije Plata 925",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 23990,
    imagen: "img/f8256428-2fc4-4fbb-a6ec-3d8873ad0abe.jpg",
    descripcion: "Lote de Conjuntos Dije Plata 925"
  },
  {
    id: 245,
    nombre: "Lote Conjuntos Colgantes",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 22900,
    imagen: "img/9b86bb50-4c7e-43d9-8b50-b585d14d323e.jpg",
    descripcion: "Lote Conjuntos Colgantes"
  },
  {
    id: 246,
    nombre: "Lote de Conjuntos Nudo de Bruja",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 22900,
    imagen: "img/bacbd665-15d4-4953-a15f-381f3f28d6c3.jpg",
    descripcion: "Lote de Conjuntos Nudo de Bruja"
  },
  {
    id: 247,
    nombre: "Lote de Conjuntos Plata 925",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 19900,
    imagen: "img/dbe103be-3ae3-4ca6-bad0-cc5b58073f55.jpg",
    descripcion: "Lote de Conjuntos Plata 925"
  },
  {
    id: 248,
    nombre: "Conjunto Pink Luxury",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 14990,
    imagen: "img/a1566d51-2306-4ff0-bfb3-94cc65e7d84d.jpg",
    descripcion: "Conjunto Pink Luxury"
  },
  {
    id: 249,
    nombre: "Lote Conjuntos Día de la Madre (6 Collares + 6 Colgantes)",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 12900,
    imagen: "img/5644E688-EBE3-4D2E-8CDC-1FB67A65F193_ECA71B20-1D71-418F-AA8F-123E3D4FC07D.jpg",
    descripcion: "Lote Conjuntos Día de la Madre (6 Collares + 6 Colgantes)"
  },
  {
    id: 250,
    nombre: "Conjunto de Graduación con Letra",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 7990,
    imagen: "img/e2ae573a-8cfa-430a-9ffa-4a0fd8583b2d.jpg",
    descripcion: "Conjunto de Graduación con Letra"
  },
  {
    id: 251,
    nombre: "Lote Inicia Tu Negocio",
    categoria: "conjuntos",
    material: "plata-nacional",
    precio: 5900,
    imagen: "img/1EDD5F1A-858C-49B9-9A56-B0402CB6A98D_4CFB2FE1-474A-44C3-AA94-F24E42AC611F.jpg",
    descripcion: "Lote Inicia Tu Negocio"
  },
  {
    id: 252,
    nombre: "Remate Oro Laminado 18K Set",
    categoria: "anillos",
    material: "oro-goldfit",
    precio: 70000,
    imagen: "img/C8509C18-64C4-4C87-846E-A241E7899D4F_44605DA4-CF91-4313-9376-B497972A732A.jpg",
    descripcion: "Remate Oro Laminado 18K Set"
  },
  {
    id: 253,
    nombre: "Oferta Anillos",
    categoria: "anillos",
    material: "plata-nacional",
    precio: 69990,
    imagen: "img/41f5bec1-55c7-4bd5-af57-22976158386b.jpg",
    descripcion: "Oferta Anillos",
    opciones: [{"etiqueta":"30 anillos","precio":69990},{"etiqueta":"60 anillos","precio":119990}]
  },
  {
    id: 254,
    nombre: "Lote de Anillos Variado",
    categoria: "anillos",
    material: "plata-nacional",
    precio: 69990,
    imagen: "img/937c2ce0-9b5b-4b10-9807-c3051e514050.jpg",
    descripcion: "Lote de Anillos Variado"
  },
  {
    id: 255,
    nombre: "Lote de Anillos Variados Plata 925",
    categoria: "anillos",
    material: "plata-nacional",
    precio: 69990,
    imagen: "img/a71c3555-d1d2-4063-87b3-ab30c1ef2de4.jpg",
    descripcion: "Lote de Anillos Variados Plata 925"
  },
  {
    id: 256,
    nombre: "Remate Oro Laminado 18K Anillos Hombre",
    categoria: "anillos",
    material: "oro-goldfit",
    precio: 62900,
    imagen: "img/C4B7841E-DFAE-4A5F-84AA-9A882A8E2735_DC8621C3-B29D-48CB-9AE1-2E97D3BD69C1.jpg",
    descripcion: "Remate Oro Laminado 18K Anillos Hombre"
  },
  {
    id: 257,
    nombre: "Lote de Anillos Luxury Love",
    categoria: "anillos",
    material: "plata-nacional",
    precio: 52990,
    imagen: "img/6a106688-7292-48b8-9e68-76b23a217102.jpg",
    descripcion: "Lote de Anillos Luxury Love"
  },
  {
    id: 258,
    nombre: "Lote de Anillos Esmeralda",
    categoria: "anillos",
    material: "plata-nacional",
    precio: 52990,
    imagen: "img/8e05446a-3a49-41be-90b5-50a492f251d3.jpg",
    descripcion: "Lote de Anillos Esmeralda"
  },
  {
    id: 259,
    nombre: "Lote de Anillos Mixto",
    categoria: "anillos",
    material: "plata-nacional",
    precio: 34990,
    imagen: "img/811ad408-b574-45f6-83bd-33f1437f79a2.jpg",
    descripcion: "Lote de Anillos Mixto"
  },
  {
    id: 260,
    nombre: "Lote de Anillos Luxury",
    categoria: "anillos",
    material: "plata-nacional",
    precio: 32990,
    imagen: "img/66161d00-50aa-448e-aa85-7910b855136b.jpg",
    descripcion: "Lote de Anillos Luxury"
  },
  {
    id: 261,
    nombre: "Remate Oro Laminado Italiano 18K Anillos",
    categoria: "anillos",
    material: "oro-goldfit",
    precio: 32900,
    imagen: "img/5F016C4D-1F55-4E11-B949-214BD35B302D_67D2E92A-E0F4-4276-A274-2CD2774E9B2C.jpg",
    descripcion: "Remate Oro Laminado Italiano 18K Anillos"
  },
  {
    id: 262,
    nombre: "Combi Pololo Oro Laminado 18K (2 anillos)",
    categoria: "anillos",
    material: "oro-goldfit",
    precio: 32900,
    imagen: "img/9ED81CBC-BC62-480E-9CB7-1712011D342E_DC4B0358-410C-4D91-88D5-BBD6F64B8AB5.jpg",
    descripcion: "Combi Pololo Oro Laminado 18K (2 anillos)"
  },
  {
    id: 263,
    nombre: "Lote de Anillos Oro Goldfield 18K Variado",
    categoria: "anillos",
    material: "oro-goldfit",
    precio: 29990,
    imagen: "img/af554235-52de-4a50-83e1-c6e4d49c0213.jpg",
    descripcion: "Lote de Anillos Oro Goldfield 18K Variado"
  },
  {
    id: 264,
    nombre: "Lote de Anillos Lady",
    categoria: "anillos",
    material: "plata-nacional",
    precio: 20990,
    imagen: "img/02690dd6-847f-4b5d-b8d3-9a50c2b7f9fc.jpg",
    descripcion: "Lote de Anillos Lady"
  },
  {
    id: 265,
    nombre: "Lote de Anillos Black",
    categoria: "anillos",
    material: "plata-nacional",
    precio: 20990,
    imagen: "img/119578ce-f995-4d47-945f-a58ebad6f85a.jpg",
    descripcion: "Lote de Anillos Black"
  },
  {
    id: 266,
    nombre: "Lote de Anillos Azul",
    categoria: "anillos",
    material: "plata-nacional",
    precio: 20990,
    imagen: "img/30c9ad4d-77b8-438f-8293-c335e22abe32.jpg",
    descripcion: "Lote de Anillos Azul"
  },
  {
    id: 267,
    nombre: "Lote de Anillos Oro Goldfield 18K",
    categoria: "anillos",
    material: "oro-goldfit",
    precio: 20990,
    imagen: "img/37b2d62b-ede9-4ad4-ab81-f40460296c64.jpg",
    descripcion: "Lote de Anillos Oro Goldfield 18K",
    opciones: [{"etiqueta":"Columna 1","precio":20990},{"etiqueta":"Columna 2","precio":23990},{"etiqueta":"Columna 3","precio":23990},{"etiqueta":"Columna 4","precio":30990},{"etiqueta":"Columna 5","precio":28990}]
  },
  {
    id: 268,
    nombre: "Lote de Anillos Solitario",
    categoria: "anillos",
    material: "plata-nacional",
    precio: 20990,
    imagen: "img/5cd48422-5660-4a91-81ea-517063bef1c2.jpg",
    descripcion: "Lote de Anillos Solitario"
  },
  {
    id: 269,
    nombre: "Lote de Anillos Corazon",
    categoria: "anillos",
    material: "plata-nacional",
    precio: 20990,
    imagen: "img/c3f97a95-0b2f-4838-b959-c37fdc5f72d0.jpg",
    descripcion: "Lote de Anillos Corazon"
  },
  {
    id: 270,
    nombre: "Lote de Anillos Pink Plata 925",
    categoria: "anillos",
    material: "plata-nacional",
    precio: 20990,
    imagen: "img/e08a1d3a-3cec-4a7e-9031-715dbafd7323.jpg",
    descripcion: "Lote de Anillos Pink Plata 925"
  },
  {
    id: 271,
    nombre: "Lote de Anillos Love Red Plata 925",
    categoria: "anillos",
    material: "plata-nacional",
    precio: 20990,
    imagen: "img/ea83640a-1f3c-4ae9-bfe0-81972c8c1c10.jpg",
    descripcion: "Lote de Anillos Love Red Plata 925"
  },
  {
    id: 272,
    nombre: "Lote de Anillos Clásicos Plata 925",
    categoria: "anillos",
    material: "plata-nacional",
    precio: 20990,
    imagen: "img/f56e3b06-480b-4b26-870f-90423ade5550.jpg",
    descripcion: "Lote de Anillos Clásicos Plata 925"
  },
  {
    id: 273,
    nombre: "Lote de Anillos Corazón Plata 925",
    categoria: "anillos",
    material: "plata-nacional",
    precio: 20990,
    imagen: "img/f5768875-b58e-45bc-a7f4-3593a4ac0644.jpg",
    descripcion: "Lote de Anillos Corazón Plata 925"
  },
  {
    id: 274,
    nombre: "Lote Anillos Blue Plata 925",
    categoria: "anillos",
    material: "plata-nacional",
    precio: 20990,
    imagen: "img/fd279fbb-4653-45ba-8eff-eeb29babd30c.jpg",
    descripcion: "Lote Anillos Blue Plata 925"
  },
  {
    id: 275,
    nombre: "Lote Anillos Pink Plata 925",
    categoria: "anillos",
    material: "plata-nacional",
    precio: 19990,
    imagen: "img/f4cb2eea-feda-4a07-9b2d-2bca782a11d4.jpg",
    descripcion: "Lote Anillos Pink Plata 925"
  },
  {
    id: 276,
    nombre: "Anillos Ajustables Equipos (2 unidades)",
    categoria: "anillos",
    material: "plata-nacional",
    precio: 9990,
    imagen: "img/A41AF029-B2CA-429B-A8EE-2483846F77E5_5B781B48-550C-4F2B-896D-B1A4216648F7.jpg",
    descripcion: "Anillos Ajustables Equipos (2 unidades)"
  },
  {
    id: 277,
    nombre: "Lote de Anillos de Hombre",
    categoria: "anillos",
    material: "plata-nacional",
    precio: 0,
    imagen: "img/F0664FA0-00C7-41D2-BE13-42D65599FA72.jpg",
    descripcion: "Lote de Anillos de Hombre"
  },
  {
    id: 278,
    nombre: "Exhibidor Maleta Mediana",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 12000,
    imagen: "img/3F191541-314B-43A1-A7CC-A727C03CCD9C.jpg",
    descripcion: "Exhibidor Maleta Mediana"
  },
  {
    id: 279,
    nombre: "Gramera 300 Gramos",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 8500,
    imagen: "img/19978DE0-476C-4DB1-A962-0965C6A185B4.jpg",
    descripcion: "Gramera 300 Gramos"
  },
  {
    id: 280,
    nombre: "Cuello Exhibidor de Cuero 18cm",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 8000,
    imagen: "img/34FF7BC6-B67D-4EF9-8BFF-89EF35E63EDF.jpg",
    descripcion: "Cuello Exhibidor de Cuero 18cm"
  },
  {
    id: 281,
    nombre: "Líquido Limpiador de Joyas Silver Shine",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 7000,
    imagen: "img/bc015da0-b680-40a9-93ef-8f6bf4d6f601.jpg",
    descripcion: "Líquido Limpiador de Joyas Silver Shine"
  },
  {
    id: 282,
    nombre: "Cuello Exhibidor de Terciopelo 25cm",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 5900,
    imagen: "img/7C6F6F39-C66B-4C83-A3BC-E301A2E35C61.jpg",
    descripcion: "Cuello Exhibidor de Terciopelo 25cm"
  },
  {
    id: 283,
    nombre: "Exhibidor de Pulseras",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 5900,
    imagen: "img/E582907D-A8DD-43CF-85BA-3A0121B63B4B.jpg",
    descripcion: "Exhibidor de Pulseras"
  },
  {
    id: 284,
    nombre: "Exhibidor de Anillos y Aros 21x13cm",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 5000,
    imagen: "img/5067D638-10F1-4D7F-9904-D1EF87EF0842.jpg",
    descripcion: "Exhibidor de Anillos y Aros 21x13cm"
  },
  {
    id: 285,
    nombre: "Medidor de Anillos",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 5000,
    imagen: "img/6C217B0D-183D-44E7-A75E-C70A0DB2DB66.jpg",
    descripcion: "Medidor de Anillos"
  },
  {
    id: 286,
    nombre: "Paños de Pulir Alta Calidad (12 unidades)",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 5000,
    imagen: "img/6DB22004-301F-4EB3-B7E7-E60600581D6F.jpg",
    descripcion: "Paños de Pulir Alta Calidad (12 unidades)"
  },
  {
    id: 287,
    nombre: "Cajas de Regalo para Conjuntos (12 unidades)",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 5000,
    imagen: "img/971F3FBC-86DE-4A2A-B714-99B9F5FE6DF3.jpg",
    descripcion: "Cajas de Regalo para Conjuntos (12 unidades)"
  },
  {
    id: 288,
    nombre: "Exhibidor de Aros y Conjuntos",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 5000,
    imagen: "img/9EBBA6AE-9B95-47B0-920D-B4CE74011CF2.jpg",
    descripcion: "Exhibidor de Aros y Conjuntos"
  },
  {
    id: 289,
    nombre: "Medidor de Dedos",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 5000,
    imagen: "img/C535DC7D-274D-40C3-AA6E-1C11E0A4000A.jpg",
    descripcion: "Medidor de Dedos"
  },
  {
    id: 290,
    nombre: "Bolsas de Organza (50 unidades)",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 5000,
    imagen: "img/CEC72ED4-6576-4E84-AFE2-F206F6A5A0AD.jpg",
    descripcion: "Bolsas de Organza (50 unidades)"
  },
  {
    id: 291,
    nombre: "Exhibidores de Anillos y Aros",
    categoria: "exhibidores",
    material: "plata-nacional",
    precio: 5000,
    imagen: "img/7fb46609-b59a-4a07-b8af-e3822e3f6a29.jpg",
    descripcion: "Exhibidores de Anillos y Aros"
  },
  {
    id: 292,
    nombre: "Exhibidor Mini Joyero",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 3000,
    imagen: "img/03E2357D-6181-4E68-8598-3F74418C5C60.jpg",
    descripcion: "Exhibidor Mini Joyero"
  },
  {
    id: 293,
    nombre: "Etiquetas de Precio (100 unidades)",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 3000,
    imagen: "img/51CEC53F-E671-4DF4-82BE-45C7264109DF.jpg",
    descripcion: "Etiquetas de Precio (100 unidades)"
  },
  {
    id: 294,
    nombre: "Exhibidor Aros Pegados",
    categoria: "exhibidores",
    material: "accesorio",
    precio: 1500,
    imagen: "img/AF02EB76-F206-431D-8EF2-789CD46B3D77.jpg",
    descripcion: "Exhibidor Aros Pegados"
  }

];

// Exportar para Node.js (APIs de Vercel) sin romper el navegador
if (typeof module !== 'undefined' && module.exports) {
  module.exports = productos;
}
