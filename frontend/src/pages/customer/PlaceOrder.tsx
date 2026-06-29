import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createSale, listBooks, money } from "../../lib/api";
import type { Book, FulfillmentMethod } from "../../lib/api";
import type { PageProps } from "../../types/navigation";
import { Shell } from "../../components/layout";
import { Button, Card, PageHeader } from "../../components/ui";

type CartItem = {
  bookId: number;
  title: string;
  quantity: number;
  price: number;
};

export function PlaceOrder({ active, onNavigate }: PageProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<FulfillmentMethod>("PICKUP");
  const [deliveryContact, setDeliveryContact] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listBooks()
      .then(setBooks)
      .catch(() => setError("Unable to load books."));
  }, []);

  const addToCart = (book: Book) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.bookId === book.id);
      if (existing) {
        return prev.map((item) =>
          item.bookId === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        { bookId: book.id, title: book.title, quantity: 1, price: book.price },
      ];
    });
  };

  const removeFromCart = (bookId: number) => {
    setCart((prev) => prev.filter((item) => item.bookId !== bookId));
  };

  const updateQuantity = (bookId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.bookId === bookId ? { ...item, quantity } : item,
        ),
      );
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.18; // 18% tax
  const total = subtotal + tax;

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      setError("Cart is empty.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await createSale({
        status: "PENDING",
        fulfillmentMethod,
        deliveryContact: deliveryContact || undefined,
        deliveryAddress: deliveryAddress || undefined,
        customerNote,
        items: cart.map((item) => ({
          bookId: item.bookId,
          quantity: item.quantity,
        })),
      });
      setSuccess("Order submitted successfully!");
      setCart([]);
      setCustomerNote("");
      setFulfillmentMethod("PICKUP");
      setDeliveryContact("");
      setDeliveryAddress("");
      setTimeout(() => onNavigate("customer-orders"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell
      active={active}
      onNavigate={onNavigate}
      role="customer"
      title="Place Order"
    >
      <PageHeader title="Place New Order" subtitle="Add books to your order" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {error && (
            <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}
          {success && (
            <p className="mb-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </p>
          )}

          <Card>
            <div className="border-b border-slate-100 p-5">
              <h2 className="font-semibold text-slate-900">Available Books</h2>
            </div>
            <div className="space-y-3 p-5">
              {books
                .filter((b) => b.status !== "OUT_OF_STOCK")
                .map((book) => (
                  <div
                    key={book.id}
                    className="flex items-center justify-between rounded-md border border-slate-200 p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{book.title}</p>
                      <p className="text-sm text-slate-500">{book.author}</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {money(book.price)} per unit
                      </p>
                    </div>
                    <Button
                      onClick={() => addToCart(book)}
                      icon={Plus}
                      className="h-10 px-3"
                    >
                      Add
                    </Button>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <div className="border-b border-slate-100 p-5">
              <h2 className="font-semibold text-slate-900">Order Summary</h2>
            </div>
            <div className="space-y-3 p-5">
              {cart.length === 0 ? (
                <p className="text-sm text-slate-500">Cart is empty.</p>
              ) : (
                <>
                  {cart.map((item) => (
                    <div
                      key={item.bookId}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {item.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                item.bookId,
                                parseInt(e.target.value),
                              )
                            }
                            className="h-7 w-12 rounded border border-slate-300 px-2 text-xs"
                          />
                          <span className="text-slate-500">
                            {money(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.bookId)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}

                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-medium">{money(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Tax (18%)</span>
                      <span className="font-medium">{money(tax)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold">
                      <span>Total</span>
                      <span>{money(total)}</span>
                    </div>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Fulfillment
                    </span>
                    <select
                      className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
                      value={fulfillmentMethod}
                      onChange={(event) =>
                        setFulfillmentMethod(
                          event.target.value as FulfillmentMethod,
                        )
                      }
                    >
                      <option value="PICKUP">Pickup</option>
                      <option value="DELIVERY">Delivery</option>
                    </select>
                  </label>

                  {fulfillmentMethod === "DELIVERY" && (
                    <>
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">
                          Delivery Contact
                        </span>
                        <input
                          className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                          placeholder="Name and phone number"
                          value={deliveryContact}
                          onChange={(event) =>
                            setDeliveryContact(event.target.value)
                          }
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">
                          Delivery Address
                        </span>
                        <textarea
                          className="min-h-20 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                          placeholder="District, church/school/branch, street, or pickup notes..."
                          value={deliveryAddress}
                          onChange={(event) =>
                            setDeliveryAddress(event.target.value)
                          }
                        />
                      </label>
                    </>
                  )}

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Order Comment
                    </span>
                    <textarea
                      className="min-h-20 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                      placeholder="Delivery instructions, preferred pickup date, or other notes..."
                      value={customerNote}
                      onChange={(event) => setCustomerNote(event.target.value)}
                    />
                  </label>

                  <Button
                    onClick={handleSubmitOrder}
                    disabled={loading || cart.length === 0}
                    className="w-full"
                  >
                    {loading ? "Submitting..." : "Submit Order"}
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
