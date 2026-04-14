import Link from "next/link";

export default function Home() {
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">My App</h1>

      <Link href="/dashboard" className="text-blue-500">
        Go to Dashboard
      </Link>
    </main>
  );
}