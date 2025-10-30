var estados = municipios_RS.merge(municipios_PR);
var estados = estados.union().geometry(); 

estados = estados.simplify(10000);  

var startDate = ee.Date('2021-10-01');
var endDate   = ee.Date('2022-03-01');

var bounds = estados.bounds();
var coords = ee.List(bounds.coordinates().get(0));

var minLon = ee.Number(ee.List(coords.get(0)).get(0));
var minLat = ee.Number(ee.List(coords.get(0)).get(1));
var maxLon = ee.Number(ee.List(coords.get(2)).get(0));
var maxLat = ee.Number(ee.List(coords.get(2)).get(1));

var midLon = minLon.add(maxLon).divide(2);
var midLat = minLat.add(maxLat).divide(2);

var q1 = ee.Geometry.Rectangle([minLon, midLat, midLon, maxLat]); 
var q2 = ee.Geometry.Rectangle([midLon, midLat, maxLon, maxLat]); 
var q3 = ee.Geometry.Rectangle([minLon, minLat, midLon, midLat]); 
var q4 = ee.Geometry.Rectangle([midLon, minLat, maxLon, midLat]); 
var quadrantes = [q1, q2, q3, q4];
var labels = ['NW','NE','SW','SE'];

var soja_mask = ee.Image('projects/mapbiomas-public/assets/brazil/lulc/collection9/mapbiomas_collection90_integration_v1')
  .select('classification_2021')
  .eq(39)  
  .clip(estados)
  .rename('SOJA')
  .toFloat();

var meses = ee.List.sequence(0, 4);  

var coverage_mask = ee.Image(1).clip(estados);

meses.getInfo().forEach(function(i) {
  var inicio = startDate.advance(i, 'month');
  var fim = inicio.advance(1, 'month');

  var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterBounds(estados)
    .filterDate(inicio, fim)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 1))
    .select(['B2']); 

  var month_mask = s2.median().mask();
  coverage_mask = coverage_mask.and(month_mask);
});

meses.getInfo().forEach(function(i) {
  var inicio = startDate.advance(i, 'month');
  var fim    = inicio.advance(1, 'month');

  var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterBounds(estados)
    .filterDate(inicio, fim)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 1))
    .select(['B2','B3','B4','B8','B11']); 

  var img = s2.median().clip(estados).toFloat();

  var ndvi = img.normalizedDifference(['B8','B4']).rename('NDVI');
  var ndwi = img.normalizedDifference(['B3','B11']).rename('NDWI');

  var dataset = img.select(['B2','B3','B4','B8'])
    .addBands(ndvi)
    .addBands(ndwi)
    .addBands(soja_mask)
    .rename(['B2_Blue','B3_Green','B4_Red','B8_NIR','NDVI','NDWI','SOJA'])
    .updateMask(coverage_mask); 

  quadrantes.forEach(function(q, idx){
    Export.image.toDrive({
      image: dataset.clip(q),
      description: 'S2_' + inicio.format('YYYY_MM').getInfo() + '_' + labels[idx],
      folder: 'GEE_Deteccao_Soja',
      region: q,
      scale: 30,
      maxPixels: 1e10,
      crs: 'EPSG:4326' 
    });
  });
});

var coverageVis = {min: 0, max: 1, palette: ['white', 'yellow']};
Map.addLayer(coverage_mask, coverageVis, 'Área válida', true, 0.4);
