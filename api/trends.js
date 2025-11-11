const googleTrends = require('google-trends-api');

// Map dropdown range values to Google Trends time periods
const rangeMap = {
  '1d': 'now 1-d',
  '7d': 'now 7-d',
  '30d': 'now 30-d',
  '12m': 'today 12-m'
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing query param: q' });

  const rangeParam = req.query.range || '7d';
  const timeRange = rangeMap[rangeParam] || 'now 7-d';

  try {
    // Interest Over Time
    const raw = await googleTrends.interestOverTime({
      keyword: q,
      time: timeRange
    });
    const parsed = JSON.parse(raw);

    const timeseries = parsed.default.timelineData.map(p => ({
      time: p.formattedTime,
      value: p.value[0]
    }));

    const score = timeseries.length ? timeseries[timeseries.length - 1].value : 0;

    // Interest by Region
    const regionsRaw = await googleTrends.interestByRegion({
      keyword: q,
      resolution: 'COUNTRY',
      time: timeRange
    });
    const regionParsed = JSON.parse(regionsRaw);

    const regions = regionParsed.default.geoMapData.map(r => ({
      name: r.geoName,
      value: r.value[0]
    }));

    // Related topics
    let relatedTopics = [];
    try {
      const relatedRaw = await googleTrends.relatedTopics({ keyword: q, time: timeRange });
      const relatedParsed = JSON.parse(relatedRaw);
      relatedTopics = relatedParsed.default.rankedList[0]?.rankedKeyword?.map(t => t.topic.title) || [];
    } catch(err) {
      relatedTopics = [];
    }

    res.status(200).json({
      keyword: q,
      score,
      timeseries,
      regions,
      relatedTopics,
      sentence: `The term "${q}" currently has a trend score of ${score}. Related topics: ${relatedTopics.slice(0,5).join(', ') || 'None'}.`
    });

  } catch (err) {
    // Fallback to simulated data
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
      relatedTopics: ['Example 1','Example 2','Example 3'],
      sentence: `The term "${q}" currently has a trend score of ${simulatedScore}. Related topics: Example 1, Example 2. (Simulated)`
    });
  }
};
