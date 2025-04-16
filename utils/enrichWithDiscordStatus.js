const { presenceCache } = require("../bot");

function enrichWithDiscordStatus(list) {
  return list.map(person => {
      if (person.discordId) {
          const status = presenceCache.get(person.discordId) || 'offline';
          return { ...person, status };
      }
      return { ...person, status: 'offline' };
  });
}


module.exports = enrichWithDiscordStatus;