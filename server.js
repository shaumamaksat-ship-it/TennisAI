const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(cors());

const API_KEY = "99969bf38c505cb69d9901bada9049e431b7b22a6e71907a732c7c228efe6fcc";
const BASE = "https://api.api-tennis.com/tennis/";

app.get('/api/live', async (req, res) => {
  try {
    const url = BASE + "?method=get_livescore&APIkey=" + API_KEY;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: 0, error: error.message });
  }
});

app.get('/api/h2h', async (req, res) => {
  try {
    const p1 = req.query.p1;
    const p2 = req.query.p2;
    const url = BASE + "?method=get_H2H&APIkey=" + API_KEY + "&first_player_key=" + p1 + "&second_player_key=" + p2;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: 0, error: error.message });
  }
});

app.get('/api/player-matches', async (req, res) => {
  try {
    const playerKey = req.query.player_key;
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 120);
    const dateStart = past.toISOString().slice(0, 10);
    const dateStop = today.toISOString().slice(0, 10);
    const url = BASE + "?method=get_fixtures&APIkey=" + API_KEY +
      "&player_key=" + playerKey +
      "&date_start=" + dateStart +
      "&date_stop=" + dateStop;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: 0, error: error.message });
  }
});

app.get('/api/player', async (req, res) => {
  try {
    const playerKey = req.query.player_key;
    const url = BASE + "?method=get_players&APIkey=" + API_KEY + "&player_key=" + playerKey;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: 0, error: error.message });
  }
});


app.get('/api/player-news', async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim();
    if (!q) return res.json({ success: 0, result: [] });

    const query = encodeURIComponent(q + ' tennis injury OR retired OR withdrawal OR medical');
    const url = 'https://news.google.com/rss/search?q=' + query + '&hl=en&gl=US&ceid=US:en';
    const response = await fetch(url);
    const text = await response.text();

    const items = [];
    const parts = text.split('<item>').slice(1);
    for (let i = 0; i < Math.min(parts.length, 8); i++) {
      const part = parts[i];
      const title = (part.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || part.match(/<title>(.*?)<\/title>/) || [])[1] || '';
      const link = (part.match(/<link>(.*?)<\/link>/) || [])[1] || '';
      const pubDate = (part.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '';
      const source = (part.match(/<source[^>]*>(.*?)<\/source>/) || [])[1] || 'News';
      if (title) {
        items.push({
          title: title.replace(/&amp;/g, '&').replace(/&#39;/g, "'"),
          link,
          pubDate,
          source
        });
      }
    }
    res.json({ success: 1, result: items });
  } catch (error) {
    res.status(500).json({ success: 0, error: error.message, result: [] });
  }
});

app.listen(5001, '0.0.0.0', () => {
  console.log('Proxy server running on http://localhost:5001');
});
