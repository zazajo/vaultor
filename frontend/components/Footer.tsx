export default function Footer() {
  return (
    <footer className="border-t border-border-subtle">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
        <span>&copy; {new Date().getFullYear()} Vaultor. All rights reserved.</span>
        <span>Built in the vault.</span>
      </div>
    </footer>
  );
}
