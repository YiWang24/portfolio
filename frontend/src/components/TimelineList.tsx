type Item = {
  heading: string;
  subheading: string;
  period: string;
  bullets: string[];
};

type Props = { items: Item[] };

export default function TimelineList({ items }: Props) {
  return (
    <div className="timeline">
      {items.map((item) => (
        <div key={`${item.heading}-${item.period}`} className="timeline-item">
          <div className="timeline-dot" />
          <div>
            <div className="timeline-heading">{item.heading}</div>
            <div className="timeline-subheading">{item.subheading}</div>
            <div className="timeline-period">{item.period}</div>
            <ul>
              {item.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
