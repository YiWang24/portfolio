type StackGroup = {
  category: string;
  items: string[];
};

type Props = { stack: StackGroup[] };

export default function TechStack({ stack }: Props) {
  return (
    <div className="stack-grid">
      {stack.map((group) => (
        <div key={group.category} className="stack-card">
          <h3>{group.category}</h3>
          <div className="stack-chips">
            {group.items.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
