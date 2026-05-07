import { VaultList } from "@/components/vault/VaultList";

export default function VaultPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Vault</h1>
        <p className="text-sm text-muted">All entries are encrypted with AES-256-GCM in your browser.</p>
      </div>
      <VaultList />
    </div>
  );
}
