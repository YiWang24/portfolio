type Props = {
  id: string;
  title: string;
  children: React.ReactNode;
};

export default function SectionModule({ id, title, children }: Props) {
  return (
    <section id={id} className="section-module">
      <div className="section-header">
        <span className="section-tag">Section</span>
        <h2>{title}</h2>
      </div>
      <div className="section-body">{children}</div>
    </section>
  );
}
