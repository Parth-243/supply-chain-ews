'use client';

interface NewsArticle {
  headline: string;
  publishedAt: string;
  sentiment: { score: number; label: string };
  entities: { text: string; type: string }[];
  source: string;
  category: string;
}

interface SentimentFeedProps {
  articles: NewsArticle[];
}

export default function SentimentFeed({ articles = [] }: SentimentFeedProps) {
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">📰 Geopolitical Sentiment Feed (NLP)</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>⋯</span>
      </div>
      <div className="card-body" style={{ padding: 0, maxHeight: 320, overflowY: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Headline</th>
              <th>Entities</th>
              <th>Sentiment</th>
            </tr>
          </thead>
          <tbody>
            {articles.slice(0, 15).map((article, i) => (
              <tr key={i}>
                <td style={{ whiteSpace: 'nowrap', fontSize: 11 }}>{formatTime(article.publishedAt)}</td>
                <td>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{article.headline}</span>
                  <br />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{article.source}</span>
                </td>
                <td>
                  {article.entities?.slice(0, 2).map((e, j) => (
                    <span key={j} className="entity-tag">{e.text}</span>
                  ))}
                </td>
                <td>
                  <span className={`sentiment-tag ${article.sentiment?.label || 'neutral'}`}>
                    {article.sentiment?.label === 'negative' ? '🔴' : article.sentiment?.label === 'positive' ? '🟢' : '⚪'}
                    {' '}{article.sentiment?.label || 'neutral'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
