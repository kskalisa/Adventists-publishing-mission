import { Heart, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { createBookRequest, listBooks, money } from "../../lib/api";
import type { Book } from "../../lib/api";
import type { PageProps } from "../../types/navigation";
import { Shell } from "../../components/layout";
import {
  Badge,
  Button,
  Card,
  Modal,
  PageHeader,
  SearchBox,
} from "../../components/ui";

function readIds(key: string) {
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]") as number[];
  } catch {
    return [];
  }
}

function writeFrontId(key: string, id: number) {
  const next = [id, ...readIds(key).filter((item) => item !== id)].slice(0, 12);
  window.localStorage.setItem(key, JSON.stringify(next));
  return next;
}

export function BrowseBooks({ active, onNavigate }: PageProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [filtered, setFiltered] = useState<Book[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [requestingBook, setRequestingBook] = useState<Book | null>(null);
  const [requestQuantity, setRequestQuantity] = useState("1");
  const [requestComment, setRequestComment] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => readIds("adventist-favorite-books"));

  useEffect(() => {
    listBooks()
      .then(setBooks)
      .catch((error) =>
        setError(
          error instanceof Error ? error.message : "Unable to load books.",
        ),
      );
  }, []);

  useEffect(() => {
    const query = search.toLowerCase();
    setFiltered(
      books.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.isbn.includes(query),
      ),
    );
  }, [search, books]);

  const inStock = filtered.filter((b) => b.status === "IN_STOCK").length;
  const lowStock = filtered.filter((b) => b.status === "LOW_STOCK").length;
  const outOfStock = filtered.filter((b) => b.status === "OUT_OF_STOCK").length;

  const toggleFavorite = (book: Book) => {
    const current = readIds("adventist-favorite-books");
    const next = current.includes(book.id) ? current.filter((id) => id !== book.id) : [book.id, ...current].slice(0, 12);
    window.localStorage.setItem("adventist-favorite-books", JSON.stringify(next));
    setFavoriteIds(next);
  };

  const openBookAction = (book: Book) => {
    writeFrontId("adventist-recent-books", book.id);
    if (book.status === "OUT_OF_STOCK") {
      setRequestingBook(book);
      setRequestQuantity("1");
      setRequestComment("");
      return;
    }
    onNavigate("customer-place-order");
  };

  const submitBookRequest = async () => {
    if (!requestingBook) return;
    setError("");
    setMessage("");
    try {
      await createBookRequest({
        bookId: requestingBook.id,
        quantity: Number(requestQuantity) || 1,
        comment: requestComment,
      });
      setMessage(`Request submitted for ${requestingBook.title}.`);
      setRequestingBook(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit book request.");
    }
  };

  return (
    <Shell
      active={active}
      onNavigate={onNavigate}
      role="customer"
      title="Browse Books"
    >
      <PageHeader
        title="Available Books"
        subtitle="Browse our catalog and request orders"
      />

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Available Titles</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {filtered.length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">In Stock</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">
            {inStock}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Low Stock</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">
            {lowStock}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Out of Stock</p>
          <p className="mt-2 text-2xl font-semibold text-red-600">
            {outOfStock}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <SearchBox
          placeholder="Search books by title, author, or ISBN..."
          value={search}
          onChange={setSearch}
        />
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((book) => (
          <Card key={book.id} className="overflow-hidden">
            {book.coverImageUrl && (
              <img
                alt={book.title}
                className="h-48 w-full object-cover"
                src={book.coverImageUrl}
              />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-slate-900">{book.title}</h3>
              <p className="text-sm text-slate-500">{book.author}</p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {money(book.price)}
                  </p>
                  <p className="text-xs text-slate-500">per unit</p>
                </div>
                <Badge
                  tone={
                    book.status === "IN_STOCK"
                      ? "green"
                      : book.status === "LOW_STOCK"
                        ? "orange"
                        : "red"
                  }
                >
                  {book.status === "IN_STOCK"
                    ? "In Stock"
                    : book.status === "LOW_STOCK"
                      ? "Low Stock"
                      : "Out of Stock"}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {book.stockQuantity} units available
              </p>
              <div className="mt-4 grid grid-cols-[44px_1fr] gap-2">
                <button
                  className={`grid h-10 place-items-center rounded-md border transition ${favoriteIds.includes(book.id) ? "border-red-200 bg-red-50 text-red-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                  onClick={() => toggleFavorite(book)}
                  type="button"
                  aria-label={`Favorite ${book.title}`}
                >
                  <Heart className="size-4" />
                </button>
                <Button
                  className="w-full"
                  icon={ShoppingCart}
                  variant={book.status === "OUT_OF_STOCK" ? "secondary" : "primary"}
                  onClick={() => openBookAction(book)}
                >
                  {book.status === "OUT_OF_STOCK" ? "Request Book" : "Order Book"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && !error && (
        <Card className="mt-6 p-8 text-center">
          <p className="text-slate-500">No books found matching your search.</p>
        </Card>
      )}
      {requestingBook && (
        <Modal
          title="Request Out-of-Stock Book"
          onClose={() => setRequestingBook(null)}
          footer={<><Button variant="secondary" onClick={() => setRequestingBook(null)}>Cancel</Button><Button onClick={submitBookRequest}>Submit Request</Button></>}
        >
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-slate-900">{requestingBook.title}</p>
              <p className="text-slate-500">{requestingBook.author}</p>
            </div>
            <label className="block">
              <span className="mb-2 block font-medium">Requested Quantity</span>
              <input className="h-10 w-full rounded-md border border-slate-200 px-3" min="1" type="number" value={requestQuantity} onChange={(event) => setRequestQuantity(event.target.value)} />
            </label>
            <label className="block">
              <span className="mb-2 block font-medium">Comments</span>
              <textarea className="min-h-24 w-full rounded-md border border-slate-200 px-3 py-2" placeholder="Tell us why or when you need this title." value={requestComment} onChange={(event) => setRequestComment(event.target.value)} />
            </label>
            <p className="rounded-md bg-blue-50 px-4 py-3 text-xs text-blue-800">This records interest only. It does not reserve stock or create an order.</p>
          </div>
        </Modal>
      )}
    </Shell>
  );
}
