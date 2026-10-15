interface FaqItem {
  q: string;
  a: string;
}

/** Ruled question/answer list — questions on the left (cols 1–5), answers on the right (6–12). */
function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <dl className="border-t border-[var(--foreground)]">
      {items.map((item) => (
        <div key={item.q} className="grid-12 gap-y-3 border-b border-[var(--border)] py-7">
          <dt className="col-span-12 lg:col-span-5 font-display text-[1.625rem] leading-tight tracking-[-0.01em]">
            {item.q}
          </dt>
          <dd className="col-span-12 lg:col-span-6 lg:col-start-7 text-[0.9375rem] leading-relaxed text-[var(--text-secondary)]">
            {item.a}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export { FaqList };
