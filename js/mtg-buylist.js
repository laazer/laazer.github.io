// MTG Buylist Builder JavaScript

let state = JSON.parse(localStorage.getItem('mtgLists') || '{}');
let current = Object.keys(state)[0] || 'Default';
state[current] ||= [];

let sortKey='name', sortDir=1, page=0;

function getTable() { return document.getElementById('cardTable'); }
function getTotalEl() { return document.getElementById('total'); }

function save(){ localStorage.setItem('mtgLists', JSON.stringify(state)); }

function refreshListSelect(){
  const listSelect = document.getElementById('listSelect');
  listSelect.innerHTML='';
  Object.keys(state).forEach(k=>{
    const o=document.createElement('option'); o.value=o.textContent=k;
    if(k===current) o.selected=true;
    listSelect.appendChild(o);
  });
}

function loadList(){ 
  const listSelect = document.getElementById('listSelect');
  current=listSelect.value; 
  page=0; 
  render(); 
}

function createList(){
  const newListName = document.getElementById('newListName');
  const n=newListName.value.trim(); 
  if(!n||state[n])return;
  state[n]=[]; 
  current=n; 
  newListName.value=''; 
  save(); 
  refreshListSelect(); 
  render();
}

function deleteList(){
  if(!confirm('Delete list?')) return;
  delete state[current];
  current=Object.keys(state)[0]||'Default';
  state[current] ||= [];
  save(); 
  refreshListSelect(); 
  render();
}

function parseDeckList(){
  const deckList = document.getElementById('deckList');
  const map={};
  deckList.value.split(/\n+/).forEach(l=>{
    const m=l.match(/^(\d+)\s+(.+)$/); if(!m)return;
    map[m[2]]=(map[m[2]]||0)+Number(m[1]);
  });
  state[current]=Object.entries(map).map(([name,qty])=>({
    id: crypto.randomUUID(),
    name, qty, price:null, sel:true
  }));
  state[current].forEach(loadPrice); 
  save(); 
  render();
}

async function loadPrice(c){
  try{
    const r=await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(c.name)}`);
    const d=await r.json();
    c.price=d.prices?.usd?Number(d.prices.usd):null;
    save(); 
    render();
  }catch{}
}

function render(){
  const search = document.getElementById('search');
  const pageSize = document.getElementById('pageSize');
  const table = getTable();
  if (!table) return;
  
  table.innerHTML='';
  const cards=state[current]
    .filter(c=>c.name.toLowerCase().includes(search.value.toLowerCase()));

  cards.sort((a,b)=>a[sortKey]>b[sortKey]?sortDir:-sortDir);
  const size=Number(pageSize.value);

  cards.slice(page*size,page*size+size).forEach(c=>{
    const r=document.createElement('tr');
    r.innerHTML=`
      <td><input type=checkbox ${c.sel?'checked':''} onchange="c.sel=this.checked;save();updateTotal()"></td>
      <td>${c.name}</td>
      <td><input class=qty type=number value=${c.qty} onchange="c.qty=this.value;save();updateTotal()"></td>
      <td class=price>${c.price?c.price.toFixed(2):'—'}</td>
      <td><button onclick="deleteCard('${c.id}')">✕</button></td>`;
    r.onmouseenter=()=>showImage(c.name);
    table.appendChild(r);
  });

  updateTotal(); 
  refreshListSelect(); 
  save();
}

function deleteCard(id){
  state[current]=state[current].filter(c=>c.id!==id);
  save(); 
  render();
}

function sortBy(k){ 
  sortDir=sortKey===k?-sortDir:1; 
  sortKey=k; 
  render(); 
}

function toggleAll(e){ 
  state[current].forEach(c=>c.sel=e.checked); 
  save(); 
  render(); 
}

function bulkDelete(){ 
  state[current]=state[current].filter(c=>!c.sel); 
  save(); 
  render(); 
}

function updateTotal(){
  const totalEl = getTotalEl();
  if (!totalEl) return;
  let t=0;
  state[current].forEach(c=>{ if(c.sel&&c.price)t+=c.qty*c.price; });
  totalEl.textContent=t.toFixed(2);
}

async function showImage(n){
  const cardImage = document.getElementById('cardImage');
  const imgHint = document.getElementById('imgHint');
  const imgLoading = document.getElementById('imgLoading');
  const imgError = document.getElementById('imgError');
  
  // Hide all states initially
  imgHint.style.display='none';
  cardImage.style.display='none';
  imgError.style.display='none';
  imgLoading.style.display='flex';
  
  try {
    const r=await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(n)}`);
    if(!r.ok) throw new Error('Card not found');
    const d=await r.json();
    
    if(!d.image_uris || !d.image_uris.normal) throw new Error('No image available');
    
    // Set up image load handlers
    cardImage.onload = () => {
      imgLoading.style.display='none';
      imgError.style.display='none';
      cardImage.style.display='block';
    };
    
    cardImage.onerror = () => {
      imgLoading.style.display='none';
      cardImage.style.display='none';
      imgError.style.display='flex';
    };
    
    // Start loading the image
    cardImage.src=d.image_uris.normal;
  } catch(e) {
    imgLoading.style.display='none';
    cardImage.style.display='none';
    imgError.style.display='flex';
  }
}

function exportCSV(){
  let csv='Name,Qty,Price\n';
  state[current].forEach(c=>csv+=`${c.name},${c.qty},${c.price??''}\n`);
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download=`${current}.csv`;
  a.click();
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    refreshListSelect(); 
    render();
  });
} else {
  refreshListSelect(); 
  render();
}

