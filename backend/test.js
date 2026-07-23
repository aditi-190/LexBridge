const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

console.log(dns.getServers());

dns.resolveSrv("_mongodb._tcp.cluster0.vpxrmdx.mongodb.net", (err, records) => {
  if (err) {
    console.error("DNS Error:", err);
  } else {
    console.log(records);
  }
});