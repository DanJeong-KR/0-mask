const fetchRequest = (url, method, param) => {
  const headers = {
    "Content-Type": "application/json; charset=utf-8"
  };

  if (param) {
    return fetch(url, {
      method: method,
      headers: headers,
      body: JSON.stringify(param)
    });
  } else {
    return fetch(url, {
      method: method,
      headers: headers
    });
  }
};

/**** User */
export const getStoreData = param => {
  // https://8oi9s0nnth.apigw.ntruss.com/corona19-masks/v1/storesByGeo/json?lat=37.498652&lng=127.027818&m=100
  const { lat, lng, m } = param;
  return fetchRequest(`https://0mask.kr:3000/stores/${lat}/${lng}/${m}`, "GET");
};
