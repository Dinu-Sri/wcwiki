interface Reference {
  title: string;
  url?: string;
  author?: string;
  publishedDate?: string;
  accessDate?: string;
  note?: string;
}

interface Props {
  references: Reference[];
}

export function ReferencesSection({ references }: Props) {
  if (!references || references.length === 0) return null;

  return (
    <section className="mt-10 pt-8 border-t border-border">
      <h2 className="text-xl font-semibold text-foreground mb-4">References</h2>
      <ol className="list-decimal list-inside space-y-2">
        {references.map((ref, idx) => (
          <li key={idx} className="text-sm text-muted leading-relaxed">
            {ref.author && <span>{ref.author}. </span>}
            {ref.url ? (
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                &ldquo;{ref.title}&rdquo;
              </a>
            ) : (
              <span className="text-foreground">&ldquo;{ref.title}&rdquo;</span>
            )}
            {ref.publishedDate && <span>. {ref.publishedDate}</span>}
            {ref.accessDate && <span>. Accessed {ref.accessDate}</span>}
            {ref.note && <span>. {ref.note}</span>}
            <span>.</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
