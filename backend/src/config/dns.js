// A mongodb+srv connection string depends on an SRV DNS lookup, and
// Node's bundled resolver refuses those on some Windows networks.
// Setting DNS_SERVERS routes those queries to resolvers that answer.
//
// This is a local machine workaround only. Hosted environments resolve
// Atlas without help, so leave DNS_SERVERS unset when deploying.
//
// Must be required after dotenv has loaded.

const servers = (process.env.DNS_SERVERS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (servers.length) {
  require("dns").setServers(servers);
}

module.exports = servers;