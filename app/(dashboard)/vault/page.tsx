import { VaultList } from "@/components/vault/VaultList";

export default function VaultPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-black gradient-text mb-1">Vault</h1>
        <p className="text-sm text-muted">All credentials encrypted client-side with AES-256-GCM before reaching the server.</p>
      </div>
      <VaultList />
    </div>
  );
}
