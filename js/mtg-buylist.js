// MTG Buylist Builder JavaScript

let state = JSON.parse(localStorage.getItem('mtgLists') || '{}');
let current = Object.keys(state)[0] || 'Default';
state[current] ||= [];

let sortKey='name', sortDir=1, page=0;
let purchaseCounter = 0; // Track purchase order

// Column visibility settings
const COLUMN_KEYS = ['manaCost', 'qty', 'price', 'totalPrice', 'bought', 'orderDetails'];
const DEFAULT_COLUMNS = {
  manaCost: true,
  qty: true,
  price: true,
  totalPrice: true,
  bought: true,
  orderDetails: true
};

function getColumnVisibility() {
  try {
    const saved = localStorage.getItem('mtgColumnVisibility');
    return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
  } catch {
    return DEFAULT_COLUMNS;
  }
}

function saveColumnVisibility(visibility) {
  localStorage.setItem('mtgColumnVisibility', JSON.stringify(visibility));
}

function toggleColumn(columnKey) {
  const visibility = getColumnVisibility();
  visibility[columnKey] = !visibility[columnKey];
  saveColumnVisibility(visibility);
  render();
}

function getSearchLinks(cardName) {
  const encodedName = encodeURIComponent(cardName);
  return {
    scryfall: `https://scryfall.com/search?q=${encodedName}`,
    tcgplayer: `https://www.tcgplayer.com/search/magic/product?q=${encodedName}`,
    manapool: `https://manapool.com/cards?q=${encodedName}`
  };
}

// Image cache management
const IMAGE_CACHE_KEY = 'mtgImageCache';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const RETRY_INTERVAL = 60 * 60 * 1000; // Retry failed images after 1 hour

function getImageCache() {
  try {
    return JSON.parse(localStorage.getItem(IMAGE_CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveImageCache(cache) {
  try {
    localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Failed to save image cache:', e);
  }
}

function setCachedImage(cardName, url, failed = false, faces = null) {
  const cache = getImageCache();
  cache[cardName] = {
    url: failed ? null : url,
    timestamp: Date.now(),
    failed: failed,
    lastRetry: failed ? Date.now() : (cache[cardName]?.lastRetry || null),
    faces: faces || null // Store all faces for two-sided cards
  };
  saveImageCache(cache);
}

function getCachedImageWithFaces(cardName) {
  const cache = getImageCache();
  const cached = cache[cardName];
  if (!cached) return { url: null, faces: null };
  
  const now = Date.now();
  
  // If it's a successful cache and not expired, use it
  if (cached.url && !cached.failed) {
    if (now - cached.timestamp < CACHE_DURATION) {
      return { url: cached.url, faces: cached.faces || null };
    }
  }
  
  // If it failed, check if we should retry
  if (cached.failed) {
    if (!cached.lastRetry || (now - cached.lastRetry) >= RETRY_INTERVAL) {
      return { url: null, faces: null }; // Retry this image
    }
    return { url: null, faces: null }; // Still in retry cooldown
  }
  
  return { url: null, faces: null };
}

function getTable() { return document.getElementById('cardTable'); }
function getTotalEl() { return document.getElementById('total'); }

function formatManaCost(manaCost) {
  if (!manaCost) return '—';
  // Convert Scryfall mana cost format to readable display
  // {1}{R}{R} -> 1RR, {X}{R} -> XR, etc.
  return manaCost
    .replace(/\{(\d+)\}/g, '$1')  // {1} -> 1
    .replace(/\{([WUBRGCX])\}/g, '$1')  // {R} -> R
    .replace(/\{([WUBRGC])\/([WUBRGC])\}/g, '$1/$2')  // {W/U} -> W/U
    .replace(/\{(\d+)\/(\d+)\}/g, '$1/$2')  // {2/B} -> 2/B
    .replace(/\{P\}/g, 'P')  // Phyrexian mana
    .replace(/\{S\}/g, 'S')  // Snow mana
    .replace(/\{T\}/g, 'T')  // Tap symbol
    .replace(/\{Q\}/g, 'Q')  // Untap symbol
    .replace(/\{E\}/g, 'E')  // Energy
    .replace(/\{CHAOS\}/g, 'CHAOS')
    .replace(/\{C\}/g, 'C');  // Colorless
}

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
  // Parse the deck list input
  deckList.value.split(/\n+/).forEach(l=>{
    const m=l.match(/^(\d+)\s+(.+)$/); if(!m)return;
    map[m[2]]=(map[m[2]]||0)+Number(m[1]);
  });
  
  // Merge with existing cards instead of replacing
  const existingMap = {};
  state[current].forEach(c => {
    existingMap[c.name] = c;
  });
  
  // Add or update cards from the parsed deck list
  Object.entries(map).forEach(([name, qty]) => {
    if (existingMap[name]) {
      // Card already exists, add to quantity
      existingMap[name].qty = (existingMap[name].qty || 0) + qty;
    } else {
      // New card, add it
      state[current].push({
        id: crypto.randomUUID(),
        name, 
        qty, 
        price: null, 
        tcgplayerPrice: null, 
        manaCost: null, 
        cmc: null, 
        sel: true,
        bought: false,
        purchaseOrder: null,
        orderDetails: ''
      });
    }
  });
  
  // Load prices for any new cards that don't have prices yet
  state[current].forEach(c => {
    if (c.price === null && c.manaCost === null) {
      loadPrice(c);
    }
  });
  
  // Clear the textarea
  deckList.value = '';
  save(); 
  render();
}

async function loadPrice(c){
  try{
    const r=await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(c.name)}`);
    const d=await r.json();
    c.price=d.prices?.usd?Number(d.prices.usd):null;
    // Mana cost and CMC - get from first face for two-sided cards, or direct for single-sided
    if(d.card_faces && d.card_faces.length > 0) {
      c.manaCost=d.card_faces[0].mana_cost || null;
      c.cmc=d.card_faces[0].cmc ?? d.cmc ?? null;
    } else {
      c.manaCost=d.mana_cost || null;
      c.cmc=d.cmc ?? null;
    }
    save(); 
    render();
  }catch{}
}

function render(){
  const search = document.getElementById('search');
  const pageSize = document.getElementById('pageSize');
  const table = getTable();
  const tableHeader = document.getElementById('tableHeader');
  if (!table || !tableHeader) return;
  
  // Update column visibility checkboxes
  const columnVisibility = getColumnVisibility();
  COLUMN_KEYS.forEach(key => {
    const checkbox = document.getElementById(`col-${key}`);
    if(checkbox) checkbox.checked = columnVisibility[key];
  });
  
  // Render table header
  let headerHtml = '<th><input type="checkbox" onclick="toggleAll(this)"></th>';
  headerHtml += '<th onclick="sortBy(\'name\')">Card</th>';
  if(columnVisibility.manaCost) {
    headerHtml += '<th onclick="sortBy(\'manaCost\')" class="col-manaCost">Cost</th>';
  }
  if(columnVisibility.qty) {
    headerHtml += '<th onclick="sortBy(\'qty\')" class="col-qty">Qty</th>';
  }
  if(columnVisibility.price) {
    headerHtml += '<th onclick="sortBy(\'price\')" class="price col-price">Per Card</th>';
  }
  if(columnVisibility.totalPrice) {
    headerHtml += '<th onclick="sortBy(\'totalPrice\')" class="price col-totalPrice">Total</th>';
  }
  if(columnVisibility.bought) {
    headerHtml += '<th class="col-bought">Bought</th>';
  }
  if(columnVisibility.orderDetails) {
    headerHtml += '<th class="col-orderDetails">Order Details</th>';
  }
  headerHtml += '<th></th>';
  tableHeader.innerHTML = headerHtml;
  
  table.innerHTML='';
  const cards=state[current]
    .filter(c=>c.name.toLowerCase().includes(search.value.toLowerCase()));

  cards.sort((a,b)=>{
    // Handle null values
    if(a[sortKey] == null && b[sortKey] == null) return 0;
    if(a[sortKey] == null) return sortDir;
    if(b[sortKey] == null) return -sortDir;
    // For manaCost, use CMC for sorting if available
    if(sortKey === 'manaCost') {
      const aVal = a.cmc ?? (a.manaCost ? 999 : 0);
      const bVal = b.cmc ?? (b.manaCost ? 999 : 0);
      return aVal > bVal ? sortDir : -sortDir;
    }
    // Numeric comparison for prices and quantities
    if(sortKey === 'price' || sortKey === 'qty') {
      return (Number(a[sortKey]) > Number(b[sortKey]) ? sortDir : -sortDir);
    }
    // String comparison for names
    return a[sortKey] > b[sortKey] ? sortDir : -sortDir;
  });
  const size=Number(pageSize.value);
  
  cards.slice(page*size,page*size+size).forEach(c=>{
    // Ensure backward compatibility - initialize fields if missing
    if(c.bought === undefined) c.bought = false;
    if(c.purchaseOrder === undefined) c.purchaseOrder = null;
    if(c.orderDetails === undefined) c.orderDetails = '';
    
    const r=document.createElement('tr');
    const manaCostDisplay = c.manaCost ? formatManaCost(c.manaCost) : '—';
    const boughtClass = c.bought ? 'bought' : '';
    const boughtCheckbox = `<input type="checkbox" ${c.bought?'checked':''} onchange="toggleBought('${c.id}')" title="Mark as bought">`;
    const purchaseOrderDisplay = c.bought && c.purchaseOrder ? `<span class="purchase-order">#${c.purchaseOrder}</span>` : '';
    
    const cardLinks = getSearchLinks(c.name);
    const cardNameWithLinks = `
      <span class="card-name">${c.name} ${purchaseOrderDisplay}</span>
      <span class="card-links">
        <a href="${cardLinks.scryfall}" target="_blank" rel="noopener noreferrer" title="Search on Scryfall">🔍</a>
        <a href="${cardLinks.tcgplayer}" target="_blank" rel="noopener noreferrer" title="Search on TCG Player">🛒</a>
        <a href="${cardLinks.manapool}" target="_blank" rel="noopener noreferrer" title="Search on Mana Pool">💎</a>
      </span>
    `;
    
    r.className = boughtClass;
    let html = `<td><input type=checkbox ${c.sel?'checked':''} onchange="c.sel=this.checked;save();updateTotal()"></td>`;
    html += `<td class="card-name-cell">${cardNameWithLinks}</td>`;
    
    if(columnVisibility.manaCost) {
      html += `<td class="mana-cost col-manaCost">${manaCostDisplay}</td>`;
    }
    if(columnVisibility.qty) {
      html += `<td class="col-qty"><input class=qty type=number value=${c.qty} onchange="c.qty=this.value;save();updateTotal()"></td>`;
    }
    if(columnVisibility.price) {
      html += `<td class="price col-price">${c.price?c.price.toFixed(2):'—'}</td>`;
    }
    if(columnVisibility.totalPrice) {
      const totalPrice = c.price && c.qty ? (c.price * c.qty).toFixed(2) : '—';
      html += `<td class="price col-totalPrice">${totalPrice}</td>`;
    }
    if(columnVisibility.bought) {
      html += `<td class="col-bought">${boughtCheckbox}</td>`;
    }
    if(columnVisibility.orderDetails) {
      html += `<td class="col-orderDetails"><input class="order-details" type="text" value="${c.orderDetails || ''}" placeholder="Order #, vendor, etc." onchange="c.orderDetails=this.value;save()"></td>`;
    }
    html += `<td><button onclick="deleteCard('${c.id}')">✕</button></td>`;
    
    r.innerHTML = html;
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

function toggleBought(id){
  const card = state[current].find(c=>c.id===id);
  if(!card) return;
  card.bought = !card.bought;
  if(card.bought && !card.purchaseOrder) {
    purchaseCounter++;
    card.purchaseOrder = purchaseCounter;
  } else if(!card.bought) {
    card.purchaseOrder = null;
  }
  save();
  render();
  updateTotal();
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
  const cardCountEl = document.getElementById('cardCount');
  if (!totalEl) return;
  
  let t=0;
  let count=0;
  state[current].forEach(c=>{ 
    if(c.sel && !c.bought) { // Only count unbought cards
      if(c.price) t+=c.qty*c.price;
      count += c.qty;
    }
  });
  totalEl.textContent=t.toFixed(2);
  if (cardCountEl) {
    cardCountEl.textContent = count;
  }
}

// Track current face for two-sided cards
let currentCardFaces = null;
let currentFaceIndex = 0;

function showCardFace(imageUrl, faces) {
  const cardImage = document.getElementById('cardImage');
  const imgLoading = document.getElementById('imgLoading');
  const imgError = document.getElementById('imgError');
  const flipButton = document.getElementById('flipButton');
  
  imgLoading.style.display='flex';
  imgError.style.display='none';
  cardImage.style.display='none';
  
  cardImage.onload = () => {
    imgLoading.style.display='none';
    imgError.style.display='none';
    cardImage.style.display='block';
    // Show flip button if there are multiple faces
    if (flipButton && faces && faces.length > 1) {
      flipButton.style.display='block';
    } else if (flipButton) {
      flipButton.style.display='none';
    }
  };
  
  cardImage.onerror = () => {
    imgLoading.style.display='none';
    cardImage.style.display='none';
    imgError.style.display='flex';
    if (flipButton) flipButton.style.display='none';
  };
  
  cardImage.src = imageUrl;
}

function flipCardFace() {
  if (!currentCardFaces || currentCardFaces.length <= 1) return;
  currentFaceIndex = (currentFaceIndex + 1) % currentCardFaces.length;
  const face = currentCardFaces[currentFaceIndex];
  if (face && face.image_uris && face.image_uris.normal) {
    showCardFace(face.image_uris.normal, currentCardFaces);
  }
}

async function showImage(n){
  const cardImage = document.getElementById('cardImage');
  const imgHint = document.getElementById('imgHint');
  const imgLoading = document.getElementById('imgLoading');
  const imgError = document.getElementById('imgError');
  const flipButton = document.getElementById('flipButton');
  
  // Hide all states initially
  imgHint.style.display='none';
  cardImage.style.display='none';
  imgError.style.display='none';
  if (flipButton) flipButton.style.display='none';
  currentFaceIndex = 0; // Reset to first face
  
  // Check cache first
  const cached = getCachedImageWithFaces(n);
  if (cached.url) {
    // Use cached image
    currentCardFaces = cached.faces;
    currentFaceIndex = 0; // Reset to first face when loading from cache
    showCardFace(cached.url, cached.faces);
    return;
  }
  
  // No cache or needs retry - fetch from API
  imgLoading.style.display='flex';
  
  try {
    const r=await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(n)}`);
    if(!r.ok) {
      setCachedImage(n, null, true);
      throw new Error('Card not found');
    }
    const d=await r.json();
    
    let imageUrl = null;
    let faces = null;
    
    // Handle two-sided cards (transform, modal double-faced, etc.)
    if (d.card_faces && d.card_faces.length > 0) {
      faces = d.card_faces;
      // Use first face by default
      if (faces[0].image_uris && faces[0].image_uris.normal) {
        imageUrl = faces[0].image_uris.normal;
      }
    } 
    // Handle regular single-sided cards
    else if (d.image_uris && d.image_uris.normal) {
      imageUrl = d.image_uris.normal;
    }
    
    if (!imageUrl) {
      setCachedImage(n, null, true);
      throw new Error('No image available');
    }
    
    currentCardFaces = faces;
    
    // Set up image load handlers
    cardImage.onload = () => {
      imgLoading.style.display='none';
      imgError.style.display='none';
      cardImage.style.display='block';
      // Show flip button if there are multiple faces
      if (flipButton && faces && faces.length > 1) {
        flipButton.style.display='block';
      }
      // Cache successful image with faces
      setCachedImage(n, imageUrl, false, faces);
    };
    
    cardImage.onerror = () => {
      imgLoading.style.display='none';
      cardImage.style.display='none';
      imgError.style.display='flex';
      if (flipButton) flipButton.style.display='none';
      // Cache failed image
      setCachedImage(n, null, true);
    };
    
    // Start loading the image
    cardImage.src = imageUrl;
  } catch(e) {
    imgLoading.style.display='none';
    cardImage.style.display='none';
    imgError.style.display='flex';
    if (flipButton) flipButton.style.display='none';
    // Cache failed image
    setCachedImage(n, null, true);
  }
}

function exportCSV(includeBought = false){
  let csv='Name,Mana Cost,Qty,Per Card Price,Total Price,Purchase Order,Order Details\n';
  const cardsToExport = includeBought 
    ? state[current] 
    : state[current].filter(c => !c.bought);
  
  // Sort by purchase order if including bought items
  if(includeBought) {
    cardsToExport.sort((a, b) => {
      if(a.bought && b.bought) {
        return (a.purchaseOrder || 0) - (b.purchaseOrder || 0);
      }
      if(a.bought) return 1;
      if(b.bought) return -1;
      return 0;
    });
  }
  
  cardsToExport.forEach(c=>{
    const manaCost = c.manaCost ? formatManaCost(c.manaCost) : '';
    const purchaseOrder = c.bought && c.purchaseOrder ? c.purchaseOrder : '';
    const orderDetails = c.orderDetails || '';
    const totalPrice = c.price && c.qty ? (c.price * c.qty).toFixed(2) : '';
    // Escape commas and quotes in order details for CSV
    const orderDetailsEscaped = orderDetails.includes(',') || orderDetails.includes('"') 
      ? `"${orderDetails.replace(/"/g, '""')}"` 
      : orderDetails;
    csv+=`${c.name},${manaCost},${c.qty},${c.price??''},${totalPrice},${purchaseOrder},${orderDetailsEscaped}\n`;
  });
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download=`${current}${includeBought ? '_all' : '_unbought'}.csv`;
  a.click();
}

// Initialize purchase counter from existing bought items
function initPurchaseCounter() {
  let maxOrder = 0;
  Object.values(state).forEach(list => {
    list.forEach(c => {
      if(c.bought && c.purchaseOrder && c.purchaseOrder > maxOrder) {
        maxOrder = c.purchaseOrder;
      }
    });
  });
  purchaseCounter = maxOrder;
}

// Close column menu when clicking outside
document.addEventListener('click', (e) => {
  const columnMenu = document.getElementById('columnMenu');
  const columnToggle = document.querySelector('.column-toggle');
  if (columnMenu && columnToggle && !columnToggle.contains(e.target)) {
    columnMenu.classList.add('hidden');
  }
});

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initPurchaseCounter();
    refreshListSelect(); 
    render();
    updateTotal();
  });
} else {
  initPurchaseCounter();
  refreshListSelect(); 
  render();
  updateTotal();
}

