import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { word } = req.query;

  if (!word) {
    return res.status(400).json({ error: 'Missing word parameter' });
  }

  try {
    // Simulated data (replace later with real Google Trends API)
    const data = {
      word: word,
      total: Math.floor(Math.random() * 1000),
      history: Array.from({ length: 10 }, (_, i) => ({
        time: i,
        count: Math.floor(Math.random() * 100)
      })),
      regions: {
        USA: Math.floor(Math.random() * 50),
        UK: Math.floor(Math.random() * 50),
        India: Math.floor(Math.random() * 50)
      }
    };

    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow your Blogspot to fetch
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

