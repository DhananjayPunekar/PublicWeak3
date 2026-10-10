import { parseTags } from '../../utils/tags';

/** Shows an issue's tags as small badges (or a dash when there are none). */
export function TagList({ tags }: { tags: string | null }) {
  const list = parseTags(tags);
  if (list.length === 0) {
    return <span className="text-secondary">-</span>;
  }
  return (
    <span className="d-inline-flex flex-wrap gap-1">
      {list.map((tag) => (
        <span key={tag} className="badge tag-badge">{tag}</span>
      ))}
    </span>
  );
}
