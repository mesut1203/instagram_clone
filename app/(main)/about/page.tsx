import Header from "../Header";

export default function AboutPage() {
  return (
    <div>
      <Header />
      <main className="mx-auto max-w-300 px-4 py-12">
        <h1 className="text-3xl font-semibold">About</h1>
        <p className="mt-3 text-neutral-500">
          Learn more about this Instagram clone.
        </p>
      </main>
    </div>
  );
}
