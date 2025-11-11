const googleTrends = require('google-trends-api');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // allow Blogspot

  const q = (req.query.q || '').trim();
  if (!q) {
    return res.status(400).json({ error: 'Missing query param: q' });
  }

  try {
    // Attempt real Google Trends fetch
    const raw = await googleTrends.interestOverTime({ keyword: q });
    const parsed = JSON.parse(raw);

    const timeseries = parsed.default.timelineData.map(p => ({
      time: p.formattedTime,
      value: p.value[0]
    }));

    const score = timeseries.length ? timeseries[timeseries.length - 1].value : 0;

    const regionsRaw = await googleTrends.interestByRegion({ keyword: q, resolution: 'COUNTRY' });
    const regionParsed = JSON.parse(regionsRaw);

    const regions = regionParsed.default.geoMapData.map(r => ({
      name: r.geoName,
      value: r.value[0]
    }));

    res.status(200).json({
      keyword: q,
      score,
      timeseries,
      regions,
      sentence: `The term "${q}" currently has a trend score of ${score}.`
    });

  } catch (err) {
    // Fallback to simulated data if Google Trends fails
    const simulatedScore = Math.floor(Math.random() * 100);
    res.status(200).json({
      keyword: q,
      score: simulatedScore,
      timeseries: Array.from({ length: 10 }, (_, i) => ({
        time: `Day ${i+1}`,
        value: Math.floor(Math.random() * 100)
      })),
      regions: [
        { name: 'USA', value: Math.floor(Math.random() * 50) },
        { name: 'UK', value: Math.floor(Math.random() * 50) },
        { name: 'India', value: Math.floor(Math.random() * 50) }
      ],
      sentence: `The term "${q}" currently has a trend score of ${simulatedScore}. (Simulated)`
    });
  }
};
