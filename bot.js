const { Client, GatewayIntentBits, Partials } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.GuildMember],
});

const presenceCache = new Map();

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Loop through all guilds the bot is in
  for (const [guildId, guild] of client.guilds.cache) {
    try {
      // Fetch all members in each guild
      const fetchedMembers = await guild.members.fetch({ withPresences: true });

      // Fill the presenceCache
      fetchedMembers.forEach(member => {
        const status = member.presence?.status || "offline";
        presenceCache.set(member.user.id, status);
      });

    } catch (error) {
      console.error(`Failed to fetch members for guild ${guildId}`, error);
    }
  }
});

client.on("presenceUpdate", (oldPresence, newPresence) => {
  if (!newPresence || !newPresence.userId) return;

  const status = newPresence.status || "offline";
  presenceCache.set(newPresence.userId, status);
});

client.login(process.env.DISCORD_BOT_TOKEN);

module.exports = { client, presenceCache };
