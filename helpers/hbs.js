const countCheck = count => {
  if (count < 1) {
    return '<h3 class="text-center">No Products</h3>';
  } else {
    return;
  }
};

const fixed = distance => {
  return distance.toFixed(2);
};

const cartTotal = array => {
  let total = 0;

  for (let i = 0; i < array.length; i++) {
    let price = parseFloat(array[i].price)
    price = price * array[i].qty;
    total = total + price;
  }
  console.log(total)
  return total.toFixed(2)
};

const stripeTotal = array => {
    let total = 0;
  
    for (let i = 0; i < array.length; i++) {
      let price = parseFloat(array[i].price)
      price = price * array[i].qty;
      total = total + price;
    }
    console.log(total)
    return total.toFixed(2) * 100;
  };

  const pubKey = ()=>{
    return process.env.STRIPE_API_PUB
  }

  const limitProducts = (arr, limit) => {
    if (!Array.isArray(arr)) { return []; }
    return arr.slice(0, limit);
  };

module.exports = { countCheck, fixed, cartTotal, stripeTotal, pubKey, limitProducts};

