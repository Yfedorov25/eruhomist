// data/poi-candidates.js
// 25 реальних POI району (Apify Google Maps scrape, Вінниця, 2026-06).
// QUADRO ≈ [49.2353, 28.4565]. ~км — приблизна відстань по прямій.
// НЕ всі йдуть на карту: у Фазі 5 користувач обере ~10-12 + фільтр категорій.
// position[x,0,z] для R3F рахується з (lat-qlat),(lng-qlng) при складанні карти.

export const QUADRO = { lat: 49.2353, lng: 28.4565, name: 'QUADRO HOUSE' };

export const POI_CANDIDATES = [
  // 💧 вода (головна перевага проєкту)
  { cat:'water',  title:'Озеро Миру',            lat:49.2350653, lng:28.4270408, rating:4.5, km:2.1, photo:true },
  { cat:'water',  title:'Вишенське озеро',       lat:49.2181374, lng:28.4024248, rating:4.4, km:4.4, photo:true },
  { cat:'water',  title:'Озеро Тяжилів',         lat:49.2439809, lng:28.5379070, rating:4.7, km:6.0, photo:true },
  // 🌳 парки
  { cat:'park',   title:'Парк Леонтовича',       lat:49.2355770, lng:28.4548273, rating:4.5, km:0.1, photo:true },
  { cat:'park',   title:'Парк Андрія Сушка',     lat:49.2450608, lng:28.4668255, rating:5.0, km:1.3, photo:false },
  // 🍽 ресторани
  { cat:'food',   title:'Ресторан Лавінія',      lat:49.2351051, lng:28.4663352, rating:4.6, km:0.7, photo:true },
  { cat:'food',   title:'La cucina',             lat:49.2325753, lng:28.4695049, rating:4.8, km:1.0, photo:true },
  { cat:'food',   title:'The Georgian Factory',  lat:49.2503138, lng:28.4755412, rating:4.6, km:2.2, photo:true },
  { cat:'food',   title:'Liguria Trattoria',     lat:49.2295660, lng:28.4195104, rating:4.6, km:2.8, photo:true },
  { cat:'food',   title:'Cherry Lake',           lat:49.2208899, lng:28.4111395, rating:4.7, km:3.7, photo:true },
  // 🎓 освіта (школи мов)
  { cat:'edu',    title:'Vinnytsia Language School', lat:49.2256464, lng:28.4302215, rating:4.6, km:2.2, photo:true },
  { cat:'edu',    title:'Школа мов KINGDOM',     lat:49.2341973, lng:28.5275962, rating:4.9, km:5.2, photo:true },
  // 🛍 торгові центри
  { cat:'mall',   title:'Sky Park',              lat:49.2328817, lng:28.4718973, rating:4.5, km:1.1, photo:true },
  { cat:'mall',   title:'Megamol',               lat:49.2281407, lng:28.4260460, rating:4.5, km:2.3, photo:true },
  { cat:'mall',   title:'The Mall',              lat:49.2377909, lng:28.4054955, rating:4.4, km:3.7, photo:true },
  { cat:'mall',   title:'S)mall',                lat:49.2262716, lng:28.4114606, rating:4.6, km:3.4, photo:true },
  { cat:'mall',   title:'Plaza Park',            lat:49.2275264, lng:28.3960420, rating:4.4, km:4.5, photo:true },
  // 🏋 спорт / фітнес
  { cat:'sport',  title:'Next Fitness Hall',     lat:49.2331161, lng:28.4559895, rating:4.8, km:0.2, photo:true },
  { cat:'sport',  title:'XTREME FIT',            lat:49.2445963, lng:28.4804650, rating:4.9, km:2.0, photo:true },
  { cat:'sport',  title:'Fitness Time',          lat:49.2434669, lng:28.4754393, rating:5.0, km:1.6, photo:true },
  // 🧸 садочки
  { cat:'kids',   title:'BeFirst.Kids',          lat:49.2258570, lng:28.4504996, rating:5.0, km:1.1, photo:true },
  { cat:'kids',   title:'KinderSTAR',            lat:49.2204655, lng:28.4490906, rating:4.6, km:1.7, photo:false },
  // ☕ кавʼярні
  { cat:'coffee', title:'Coffee 13',             lat:49.2237711, lng:28.4435263, rating:4.9, km:1.6, photo:true },
  { cat:'coffee', title:'Luxury Coffee',         lat:49.2455402, lng:28.4819681, rating:4.9, km:2.2, photo:true },
  { cat:'coffee', title:'DOFAMIN coffee bar',    lat:49.2407954, lng:28.4954241, rating:4.9, km:2.9, photo:true },
];

export const CATEGORIES = {
  water:  { icon:'💧', label:'Вода' },
  park:   { icon:'🌳', label:'Парки' },
  food:   { icon:'🍽', label:'Ресторани' },
  edu:    { icon:'🎓', label:'Освіта' },
  mall:   { icon:'🛍', label:'ТРЦ' },
  sport:  { icon:'🏋', label:'Спорт' },
  kids:   { icon:'🧸', label:'Садочки' },
  coffee: { icon:'☕', label:'Кавʼярні' },
};
