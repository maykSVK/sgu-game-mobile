const cheerio = require("cheerio");

function parseDestiny(html) {
  const $ = cheerio.load(html);
  const data = {
    infoboxes: []
  };

  $(".infobox-standard").each((i, el) => {
    const title = $(el).find(".infobox-standard-title").text().trim();
    if (title && !title.includes("chat") && !title.includes("Chat")) {
      let bodyHtml = $(el).find(".infobox-standard-body").html();
      if (title && bodyHtml) {
         data.infoboxes.push({ title, html: bodyHtml.trim() });
      }
    }
  });

  return data;
}

module.exports = { parseDestiny };

