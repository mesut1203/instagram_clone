import Header from "../Header";

export default function ProductsPage() {
  return (
    <div>
      <Header />
      <main className="mx-auto max-w-300 px-4 py-12">
        <h1 className="text-3xl font-semibold">Products</h1>
        <p className="mt-3 text-neutral-500">
          Explore the features available in this Instagram clone.
        </p>
      </main>
    </div>
  );
}
