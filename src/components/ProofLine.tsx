/**
 * A case's verified proof ("3 replies in under 5 s · caught a bug 22 tests missed ·
 * live"): a line breaks between claims, and inside one only when the claim is
 * wider than the column (each is an inline block); the separator
 * travels with the claim it introduces, and a one-word last claim stays with
 * the one before it rather than ending up alone on a line.
 */
export function ProofLine({ proof, className = "" }: { proof: string; className?: string }) {
  const claims = proof.split(" · ");
  const last = claims.at(-1);
  if (claims.length > 2 && last && !last.includes(" ")) claims.splice(-2, 2, `${claims.at(-2)}\u00a0·\u00a0${last}`);
  return (
    <p data-spec="Proof" className={`t-meta text-mark ${className}`}>
      {claims.map((claim, k) => (
        <span key={k}>
          {k ? " " : null}
          <span className="inline-block">{k ? `· ${claim}` : claim}</span>
        </span>
      ))}
    </p>
  );
}
