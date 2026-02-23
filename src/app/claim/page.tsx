import { Navbar } from "@/components/Navbar";
import { ClaimFlow } from "@/components/ClaimFlow";

export default function ClaimPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14 px-4 py-12">
        <h1 className="text-2xl font-bold text-white text-center mb-10">
          Claim Aftershow NFT
        </h1>
        <ClaimFlow />
      </main>
    </div>
  );
}
