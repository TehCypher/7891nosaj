const Discord = require('discord.js');
const botConfig = require('./botSettings.json');
const cheerio = require('cheerio');
const request = require('request');
const tabletojson = require('tabletojson');
const fs = require('fs');
const https = require('https');
const htmlToJson = require('html-to-json');

var stats;
var buildSkills = "";
var maxWidth = " Firemaking - 99 -  200,000,000   ".length;
var maxTop = "                                          ".length;
var search = "";

var content = "";   
const prefix = botConfig.prefix;
const client = new Discord.Client();

var badwords = [
    "slut", "beaner", "nigger", "niger", "cunt", "concluded!",
    "queued by", "suck a dick", "evan reed", "evan s reed",
    "casselberry", "c reed", "s reed", "standlerreed", "463-6388",
    ";;play", "postier", "discord.gg", "emu", "rsce", "tion.net", "e m u",
    "3mu", "3 m u", "em.u", "e.mu", "fag"
];
    

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setGame("RSCRevolution", "https://rscrevolution.com")
});

client.on('message', msg => {
  if (msg.author.bot) return;
  for (var i = 0; i < badwords.length;i++){
      if (msg.content.indexOf(badwords[i]) > -1) {
          msg.delete();
      }
  }
  let messageArray = msg.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  if (cmd === `${prefix}ping`) return msg.channel.send("Pong!");

  if (cmd === `${prefix}botinfo`){
      let emb = new Discord.RichEmbed()
      .setDescription("Bot Information")
      .setColor("#00ff48")
      .setThumbnail(client.user.displayAvatarURL)
      .addField("Bot Name:", client.user.username);

      return msg.channel.send(emb);
  }
  if (cmd === `${prefix}stat`){
      var name = "";
      if (args.length >= 1){
          for (var i = 0, len = args.length; i < len; i++){
            if (i === len - 1){
                name += args[i].capitalize();
            } else 
            {
            name += args[i].capitalize() + " ";
            }
          }
      }
    request.get({
        url: 'https://www.rscrevolution.com/highscore.php?user=' + name, 
        headers: {
            'User-Agent' : 'User-Agent: Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:x.x.x) Gecko/20041107 Firefox/x.x',
            'Host' : 'www.rscrevolution.com'
        },
        method: 'GET'
    }, 
        function(err, response, body){
            var tbl = tabletojson.convert(body);
            tableBuild = "";
            buildSkills = "";
            if (tbl[1] !== undefined) {
                let emb = new Discord.RichEmbed()
                    .setTitle("Stats for: " + name)
                    .setDescription("```\n" + buildStats(name, tbl[1], buildProfile(tbl[0])) + "\n```")
                    .setColor("#00ff48")
                    .setFooter(getMaxed(tbl[1]))
                    //.setThumbnail("http://www.rscrevolution.com:43594/img/items/2146.PNG");
                return msg.channel.send(emb);
            } 
            else if (body.indexOf("User is hidden!") > -1){
                return msg.channel.send(name + " is hidden");
            }
            else if (body.indexOf("No Results Found!") > -1){
                return msg.channel.send(name + " does not exist!");
            }
    });
  }
  if (cmd === `${prefix}game`){
    var promise = htmlToJson.request({
        url: "https://rscrevolution.com",
        headers: {
        'User-Agent' : 'User-Agent: Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:x.x.x) Gecko/20041107 Firefox/x.x',
        'Host' : 'www.rscrevolution.com'
    },
        method: 'GET'
    }, {

        'game': ['div', function ($img) {
          return $img;
        }]
      }, function (err, result) {
        var mssg = "";
        mssg += result.game[44]['0'].firstChild.firstChild.firstChild.data + " " + result.game[44]['0'].lastChild.lastChild.lastChild.data + "\n";
        mssg += result.game[45]['0'].firstChild.firstChild.firstChild.data + " " + result.game[45]['0'].lastChild.lastChild.lastChild.data + "\n";
        mssg += result.game[46]['0'].firstChild.firstChild.firstChild.data + " " + result.game[46]['0'].lastChild.lastChild.data + "\n";
        mssg += result.game[47]['0'].firstChild.firstChild.firstChild.data + " " + result.game[47]['0'].lastChild.lastChild.data + "\n";
        mssg += result.game[48]['0'].firstChild.firstChild.firstChild.data + " " + result.game[48]['0'].lastChild.lastChild.data + "\n";
        let emb = new Discord.RichEmbed()
                    .setTitle("Server Stats")
                    .setDescription("```\n" + mssg + "\n```")
                    .setColor("#00ff48")
        return msg.channel.send(emb);
      });
  }
  if (cmd === `${prefix}top20`){
      search = "Overall";
      if (args.length > 0 && args.length < 2){
         search = args[0];
      }
      request.get({
        url: 'https://www.rscrevolution.com/highscore.php?skill=' + search, 
        headers: {
            'User-Agent' : 'User-Agent: Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:x.x.x) Gecko/20041107 Firefox/x.x',
            'Host' : 'www.rscrevolution.com'
        },
        method: 'GET'
    }, 
        function(err, response, body){
            var tbl = tabletojson.convert(body);
            tableBuild = "";
            buildSkills = "";
            if (tbl[0] !== undefined) {
                let emb = new Discord.RichEmbed()
                    .setTitle("Top 20 " + search.capitalize())
                    .setDescription("```\n" + buildTop(tbl[0]) + "\n```")
                    .setColor("#00ff48")
                return msg.channel.send(emb);
            } 
    });
  }
});

client.login(botConfig.token);

function getMaxed(stats){
    var maxedStats = 0;
    for (var i = 0; i < stats.length; i++){
        if (stats[i].Level == 99) {
            maxedStats++;
        }
    }
    if (maxedStats === 0) return "No Maxed Skills!";
    if (maxedStats < 18) return maxedStats + " Maxed Skills!";
    if (maxedStats === 18) return "Maxed Out in All Skills!";
}

function pad(char, padding, str, padLeft) {
    var pad = "";
    for (var i = 0; i < padding; i++){
        pad += char;
    }
    if (typeof str === 'undefined') 
      return pad;
    if (padLeft) {
      return (pad + str).slice(-pad.length);
    } else {
      return (str + pad).substring(0, pad.length);
    }
  }

function fixSpacer(len){
    if (len % 2 !== 0){
        return 2;
    }
    return 1;
}

function buildProfile(profile){
    var prof = "";
    var line;
    line = ("|" + profile[0].General + ": " + profile[0]['1']);
    prof += line + calcSpacer(line.length) + "|\n";
    line = ("|" + profile[1].General + ": " + profile[1]['1']);
    prof += line + calcSpacer(line.length) + "|\n";
    line = ("|" + profile[2].General + ": " + profile[2]['1']);
    prof += line + calcSpacer(line.length) + "|\n";
    line = ("|" + profile[3].General + ": " + profile[3]['1']);
    prof += line + calcSpacer(line.length) + "|\n";
    line = ("|" + profile[5].General + ": " + profile[5]['1']);
    prof += line + calcSpacer(line.length) + "|\n";
    line = ("|" + profile[6].General + ": " + profile[6]['1']);
    prof += line + calcSpacer(line.length) + "|\n";
    return prof;
}

function calcSpacer(len){
    var spacer = "";
    for (var i = 0; i < maxWidth - len; i++){
        spacer += " ";
    }
    return spacer;
}

function buildTop(table) {
    var lvl = "Skill Total";
    var xp = "Total Experience";
    var holder = "Skills"
    if (search.toLowerCase() == "kd") {
     return "Not Implemented.";   
    }
    if (search !== "Overall") {
        lvl = "Level";
        xp = "Experience";
        holder = "Level ";
    }
    var skills = "";
    for (var i = 0; i < table.length; i++){
        buildSkills += "|" + pad(" ", 5, table[i]['Rank'],false) + " " + pad(" ", 14, table[i]['Username'], false) + " " + pad(" ", 7, table[i][`${lvl}`],false) + " " + pad(" ", 13, table[i][`${xp}`],true) + "|\n";
    }
    var tableBuild = "";
    tableBuild += "|" + pad("-",maxTop,"",false) + "|\n";
    tableBuild += "|Rank  Username      " + holder + "     Experience |\n"
    tableBuild += "|" + pad("-",maxTop,"",false) + "|\n";
    tableBuild += buildSkills;
    tableBuild += "|" + pad("-",maxTop,"",false) + "|\n";
    return tableBuild;
}

function buildStats(name, stats, profile) {
    var rightSpacer = ((maxWidth - name.length) / 2) - 1;
    var endSpacer = fixSpacer(maxWidth - name.length);
    var leftSpacer = ((maxWidth - rightSpacer) - name.length) - endSpacer;
    for (var i = 0; i < stats.length; i++){
        buildSkills += `| ${pad(" ", 10,stats[i].Skill,false)}   ${pad(" ", 2,stats[i].Level, true)}     ${pad(" ", 11,stats[i].Experience, true)} |\n`;
    }
    var tableBuild = "";
    //tableBuild += "|" + pad("-",maxWidth - 1,"",false) + "|\n";
    //tableBuild += "|" + pad(" ",rightSpacer,"",false) + name + pad(" ",leftSpacer,"",false) +"|\n";
    tableBuild += "|" + pad("-",maxWidth - 1,"",false) + "|\n";
    tableBuild += profile;
    tableBuild += "|" + pad("-",maxWidth - 1,"",false) + "|\n";
    tableBuild += "| Skill      Level     Experience |\n"
    tableBuild += "|" + pad("-",maxWidth - 1,"",false) + "|\n";
    tableBuild += buildSkills;
    tableBuild += "|" + pad("-",maxWidth - 1,"",false) + "|\n";
    return tableBuild;
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}