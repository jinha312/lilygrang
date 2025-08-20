const formatPrice = (n) => new Intl.NumberFormat('ko-KR', {style:'currency', currency: window.SHOP_CONFIG.currency||'KRW'}).format(n);
const getCart = () => JSON.parse(localStorage.getItem('cart')||'[]');
const setCart = (c) => localStorage.setItem('cart', JSON.stringify(c));

async function loadProducts(){
  const res = await fetch('products.json');
  return await res.json();
}

function addToCart(item){
  const cart = getCart();
  const idx = cart.findIndex(c => c.id===item.id && c.size===item.size && c.color===item.color);
  if(idx>-1){ cart[idx].qty += item.qty; }
  else cart.push(item);
  setCart(cart);
  alert('장바구니에 담겼습니다.');
  updateCartCount();
}

function updateCartCount(){
  const count = getCart().reduce((a,c)=>a+c.qty,0);
  const el = document.querySelector('#cartCount');
  if(el) el.textContent = count>0? String(count): '';
}

function removeFromCart(i){
  const cart = getCart();
  cart.splice(i,1);
  setCart(cart);
  renderCart();
}

function changeQty(i, delta){
  const cart = getCart();
  cart[i].qty = Math.max(1, cart[i].qty + delta);
  setCart(cart);
  renderCart();
}

function cartSubtotal(){
  const cart = getCart();
  return cart.reduce((sum, c)=>{
    const p = c.price || 0;
    return sum + (p * c.qty);
  }, 0);
}

function shippingFee(){
  const threshold = window.SHOP_CONFIG.freeShippingThreshold || 70000;
  const sub = cartSubtotal();
  return sub >= threshold ? 0 : 3000;
}

function renderCart(){
  const root = document.getElementById('cartRoot');
  const cart = getCart();
  if(!root) return;
  if(cart.length === 0){
    root.innerHTML = '<p>장바구니가 비었습니다.</p>';
    document.getElementById('totals').textContent='';
    return;
  }
  root.innerHTML = cart.map((c,i)=>`
    <div class="cart-row">
      <div>
        <div><strong>${c.title}</strong> <span class="badge">${c.color} / ${c.size}</span></div>
        <div class="badge">${c.sku}</div>
      </div>
      <div class="quantity">
        <button onclick="changeQty(${i},-1)" aria-label="수량 감소">-</button>
        <span>${c.qty}</span>
        <button onclick="changeQty(${i},1)" aria-label="수량 증가">+</button>
      </div>
      <div>${formatPrice(c.price*c.qty)}</div>
      <button onclick="removeFromCart(${i})" aria-label="삭제">삭제</button>
    </div>
  `).join('');
  const sub = cartSubtotal();
  const ship = shippingFee();
  const total = sub + ship;
  document.getElementById('totals').innerHTML = `
    <div class="notice">
      <div>상품 합계: <strong>${formatPrice(sub)}</strong></div>
      <div>배송비: <strong>${ship===0? '무료' : formatPrice(ship)}</strong></div>
      <div>결제 예정 금액: <strong>${formatPrice(total)}</strong></div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', ()=>{
  updateCartCount();
});