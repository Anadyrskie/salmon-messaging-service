const config = require("./config.json");

let Parser = require('rss-parser');
let parser = new Parser();
let twilio = require('twilio')(config.twilio.accountSID, config.twilio.authToken)
let fs = require('fs');


let lastPubDate = fs.readFileSync("lastPubDate").toString();

var minutes = 1, the_interval = minutes * 60 * 1000;
async function checkForItems() {
    let feed = await parser.parseURL(config.feedURL);
    let regex = /Fishery Announcement/i
    let item = feed.items[0]
    if (regex.test(item.title)) {
        if (item.pubDate !== lastPubDate) {
            console.log('yes')
            for (let index in config.contacts) {
                let contact = config.contacts[index]
                await twilio.messages
                    .create({
                        body: item.pubDate + '\n' + item.title + '\n' + item.link,
                        to: contact.phone,
                        from: config.twilio.phone
                    })
                    .then(message => console.log(`${contact.name} : ${message.sid}`));

            }
            lastPubDate = item.pubDate
            fs.writeFileSync("lastPubDate", lastPubDate.toString())
        }
    }
}
checkForItems();
setInterval(checkForItems, the_interval);