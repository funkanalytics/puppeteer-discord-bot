console.log("start");
(async () => {
	var fs = require("fs");
	var puppeteer = require('puppeteer');
	var browser = await puppeteer.launch({args:["--no-sandbox"]});

	var Discord = require('discord.io');
	var client = new Discord.Client({
		token: fs.readFileSync('token.txt','utf8').trim(),
		autorun: true
	});
	client.setPresence({game: {name: "p!help"}});

	client.on("message", function(userName, userID, channelID, message, event){
		if (!message.startsWith("p!")) return;

		if (client.id == "482784865532641290") {
			if ("330499952948019201" in client.servers[event.d.guild_id].members) return;
			let msg = "**This bot account will be deleted soon!**\n"
			        + "Please invite the new bot account to continue using Puppeteer: <https://discordapp.com/api/oauth2/authorize?client_id=330499952948019201&permissions=0&scope=bot>";
			// could've made it respond differently if member had permission to invite, or show list of members that do; but too complicted to do with discord.io
			client.sendMessage({message: msg, to: channelID});
			return;
		}

		console.log(`[${new Date().toLocaleString()}] [${event.d.guild_id}(${client.servers[event.d.guild_id]&&client.servers[event.d.guild_id].name})] [${channelID}(#${client.channels[channelID]&&client.channels[channelID].name})] User ${userID} (${userName}#${event.d.author.discriminator}) invoked command: ${message}`);

		var args = message.split(" ");
		var cmd = args[0].slice(2).toLowerCase();
		var query = args.slice(1).join(" ").trim();

		switch (cmd) {
			case "help":
			case "h":
				client.sendMessage({embed:{
					title: "Commands",
					description:
						"\n`p!screenshot <url>`"+
						"\n`p!google <query>`"+
						"\n`p!google-i'm-feeling-lucky <query>`" +
						"\n`p!google-images <query>`"+
						"\n`p!bing <query>`"+
						"\n`p!bing-images <query>`"+
						"\n`p!youtube <query>`"+
						"\n`p!ebay <query>`" +
						"\n`p!amazon <query>`" +
						"\n`p!duckduckgo <query>`" +
						"\n`p!yahoo <query>`" +
						"\n Each command has an abbreviated version." +
						"\n"+
						`\n\n[» Add this bot to your server](https://discordapp.com/oauth2/authorize?scope=bot&client_id=${client.id})`+
						"\n[» Source code](https://github.com/ledlamp/puppeteer-discord-bot)"+
						"\n[» Submit an issue](https://github.com/ledlamp/puppeteer-discord-bot/issues/new)"
				}, to: channelID});
				break;
			case "screenshot":
			case "ss":
				pup((query.startsWith("http://") || query.startsWith("https://")) ? query : `http://${query}`);
				break;
			case "google":
			case "g":
				pup(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
				break;
			case "google-i'm-feeling-lucky":
			case "gifl":
				pup(`https://www.google.com/search?btnI=I%27m+Feeling+Lucky&q=${encodeURIComponent(query)}`);
				break;

			case "google-images":
			case "gi":
				pup(`https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&safe=${(client.channels[channelID] && client.channels[channelID].nsfw) ? 'off' : 'on'}`);
				break;
			case "bing":
			case "b":
				pup(`https://www.bing.com/search?q=${encodeURIComponent(query)}`);
				break;
			case "bing-images":
			case "bi":
				pup(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}&safeSearch=${(client.channels[channelID] && client.channels[channelID].nsfw) ? 'off' : 'moderate'}`);
				break;
			case "youtube":
			case "yt":
				pup(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
				break;
			case "ebay":
			case "e":
				pup(`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`);
				break;
			case "amazon":
			case "a":
				pup(`https://www.amazon.com/s?k=${encodeURIComponent(query)}`);
				break;
			case "duckduckgo":
			case "ddg":
				pup(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`);
				break;
			case "yahoo":
			case "y":
				pup(`https://search.yahoo.com/search?p=${encodeURIComponent(query)}`);
				break;
/*
			case "":
			case "":
				pup(``);
				break;
*/

			case "eval":
			case ">":
				if (userID == "281134216115257344") {
					try {
						client.sendMessage({message: eval(query), to: channelID});
					} catch(e) {
						client.sendMessage({message: e, to: channelID});
					}
				}
				break;
		}

		async function pup(url) {
			client.addReaction({reaction:'🆗', channelID, messageID: event.d.id});
			try {
				var page = await browser.newPage();
				page.on("error", error => {
					client.sendMessage({message: `:warning: ${error.message}`, to: channelID});
				});
				await page.setViewport({width: 1440, height: 900});
				await page.goto(url);
				var screenshot = await page.screenshot({type: 'png'});
				client.uploadFile({file: screenshot, filename: "screenshot.png", to: channelID});
			} catch(error) {
				console.error(error);
				client.sendMessage({message: `:warning: ${error.message}`, to: channelID});
			} finally {
				try {
					await page.close();
				} catch(e) {
					console.error(e);
					process.exit(1);
				}
			}
		}
	});
})();
