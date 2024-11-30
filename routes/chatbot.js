const express = require("express");
const dotenv = require("dotenv");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { XMLParser, XMLValidator } = require("fast-xml-parser");
const OpenAI = require("openai");

dotenv.config();
puppeteer.use(StealthPlugin());
const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Region mappings
const regions = [
  { id: 1029, name: "Valitse alue/teatteri" },
  { id: 1014, name: "Pääkaupunkiseutu" },
  { id: 1012, name: "Espoo" },
  { id: 1039, name: "Espoo: OMENA" },
  { id: 1038, name: "Espoo: SELLO" },
  { id: 1002, name: "Helsinki" },
  { id: 1045, name: "Helsinki: ITIS" },
  { id: 1031, name: "Helsinki: KINOPALATSI" },
  { id: 1032, name: "Helsinki: MAXIM" },
  { id: 1033, name: "Helsinki: TENNISPALATSI" },
  { id: 1013, name: "Vantaa: FLAMINGO" },
  { id: 1015, name: "Jyväskylä: FANTASIA" },
  { id: 1016, name: "Kuopio: SCALA" },
  { id: 1017, name: "Lahti: KUVAPALATSI" },
  { id: 1041, name: "Lappeenranta: STRAND" },
  { id: 1018, name: "Oulu: PLAZA" },
  { id: 1019, name: "Pori: PROMENADI" },
  { id: 1021, name: "Tampere" },
  { id: 1034, name: "Tampere: CINE ATLAS" },
  { id: 1035, name: "Tampere: PLEVNA" },
  { id: 1047, name: "Turku ja Raisio" },
  { id: 1022, name: "Turku: KINOPALATSI" },
  { id: 1046, name: "Raisio: LUXE MYLLY" },
];

// Fetch Finnkino Showtimes for a specific region
async function fetchShowtimes(regionId) {
  const API_URL = `https://www.finnkino.fi/xml/Schedule/?area=${regionId}`;
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(API_URL, { waitUntil: "networkidle2" });

    let xmlData = await page.evaluate(() => document.body.innerText);
    xmlData = xmlData.trim();

    if (!xmlData.startsWith("<")) {
      const xmlStartIndex = xmlData.indexOf("<");
      xmlData = xmlData.slice(xmlStartIndex);
    }

    const parser = new XMLParser();
    const isValid = XMLValidator.validate(xmlData);

    if (isValid) {
      const result = parser.parse(xmlData);
      const shows = result.Schedule.Shows.Show.map((show) => ({
        id: show.ID,
        title: show.Title,
        originalTitle: show.OriginalTitle,
        startTime: new Date(show.dttmShowStart).toLocaleString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
        endTime: new Date(show.dttmShowEnd).toLocaleString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
        genres: show.Genres,
        theatre: show.Theatre,
        image: show.Images?.EventMediumImagePortrait,
        url: show.ShowURL,
      }));
      await browser.close();
      return shows;
    } else {
      throw new Error("Invalid XML format");
    }
  } catch (error) {
    console.error(`Error fetching Finnkino data for region ${regionId}:`, error.message);
    return null;
  }
}

async function fetchScheduleDates() {
    const DATES_API_URL = "https://www.finnkino.fi/xml/ScheduleDates/";
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
  
      await page.goto(DATES_API_URL, { waitUntil: "networkidle2" });
  
      let xmlData = await page.evaluate(() => document.body.innerText);
      xmlData = xmlData.trim();
  
      if (!xmlData.startsWith("<")) {
        const xmlStartIndex = xmlData.indexOf("<");
        xmlData = xmlData.slice(xmlStartIndex);
      }
  
      const parser = new XMLParser();
      const isValid = XMLValidator.validate(xmlData);
  
      if (isValid) {
        const result = parser.parse(xmlData);
        const dates = result.Dates.dateTime.map((date) =>
          new Date(date).toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        );
        await browser.close();
        return dates;
      } else {
        throw new Error("Invalid XML format");
      }
    } catch (error) {
      console.error("Error fetching schedule dates:", error.message);
      return null;
    }
  }
  

// Chatbot Endpoint
router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ response: "Message is required!" });
  }

  try {
    const region = regions.find((r) => message.toLowerCase().includes(r.name.toLowerCase()));

    if (region) {
      console.log(`Showtime query detected for region: ${region.name}`);
      const showtimes = await fetchShowtimes(region.id);

      if (showtimes && showtimes.length > 0) {
        const formattedShowtimes = showtimes
          .map(
            (show) =>
              `🎬 ${show.title}\n📍 Location: ${show.theatre}\n🕒 Start Time: ${show.startTime}\n📽️ Genres: ${show.genres}\n🔗 [More Info](${show.url})\n`
          )
          .join("\n");

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a friendly and engaging movie assistant. Format responses clearly with relevant information.`,
            },
            {
              role: "user",
              content: `The user asked for showtimes in ${region.name}. Here's the data:\n${formattedShowtimes}\nWrite a friendly and informative response.`,
            },
          ],
        });

        const chatbotResponse = completion.choices[0]?.message?.content.trim();
        return res.json({ response: chatbotResponse });
      } else {
        return res.json({
          response: `Sorry, I couldn't find any showtimes for ${region.name}.`,
        });
      }
    }

    // General movie-related query
    console.log("General query detected. Using OpenAI to generate response...");
    console.log("Query sent to OpenAI:", message);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a friendly and engaging movie assistant." },
        { role: "user", content: message },
      ],
    });

    const chatbotResponse = completion.choices[0]?.message?.content.trim();
    console.log("OpenAI Response:", chatbotResponse);

    if (!chatbotResponse) {
      console.error("OpenAI returned no response.");
      return res.status(500).json({ response: "No response generated." });
    }

    res.json({ response: chatbotResponse });
  } catch (error) {
    console.error("Error in chatbot:", error.message);
    res.status(500).json({ response: "Something went wrong. Try again later." });
  }
});

module.exports = router;
