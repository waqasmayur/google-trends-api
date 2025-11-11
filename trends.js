const googleTrends = require('google-trends-api');

module.exports = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'Missing query param: q' });

    const raw = await googleTrends.interestOverTime({
      keyword: q
    });

    const parsed = JSON.parse(raw);

    const timeseries = parsed.default.timelineData.map(p => ({
      time: p.formattedTime,
      value: p.value[0]
    }));

    const score = timeseries.length ? timeseries[timeseries.length - 1].value : 0;

    const regionsRaw = await googleTrends.interestByRegion({
      keyword: q,
      resolution: 'COUNTRY'
    });

    const regionParsed = JSON.parse(regionsRaw);

    const regions = regionParsed.default.geoMapData.map(r => ({
      name: r.geoName,
      value: r.value[0]
    }));

    res.setHeader('Access-Control-Allow-Origin', '*');

    res.json({
      keyword: q,
      score,
      timeseries,
      regions,
      sentence: `The term "${q}" currently has a trend score of ${score}.`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trends', details: err.message });
  }
};
