const cheerio = require("cheerio");

function parseReports(html) {
  const $ = cheerio.load(html);
  const reports = [];

  // Prvá tabuľka s triedou delimiter obsahuje form "Označit vše jako přečtené"
  // Druhá tabuľka .delimiter obsahuje zoznam reportov
  const tables = $(".delimiter");
  if (tables.length > 1) {
    const listTable = tables.eq(1);
    listTable.find("tr").each((i, row) => {
      if (i === 0) return; // Hlavička
      
      const cols = $(row).find("td");
      if (cols.length >= 5) {
        const date = $(cols[0]).text().trim();
        const resultText = $(cols[1]).text().trim();
        const resultType = $(cols[1]).find("div").hasClass("success") ? "win" : "loss";
        const battleType = $(cols[2]).text().trim();
        const isNew = $(cols[3]).text().trim().toLowerCase() === "ano";
        
        const linkHref = $(cols[4]).find("a").attr("href");
        let id = null;
        if (linkHref) {
          const match = linkHref.match(/id=(\d+)/);
          if (match) id = match[1];
        }

        reports.push({
          id,
          date,
          resultText,
          resultType,
          battleType,
          isNew
        });
      }
    });
  }

  // Ak je to detail reportu (otvorený konkrétny id)
  let reportDetail = null;
  const contentContainer = $(".content-container");
  if (html.includes("Zpráva z bitvy") || contentContainer.find("table").eq(0).text().includes("Zpráva z bitvy")) {
    reportDetail = {
      html: contentContainer.html() // For now just return the HTML to render safely, or we can parse it
    };
  }

  return { reports, reportDetail };
}

module.exports = { parseReports };
