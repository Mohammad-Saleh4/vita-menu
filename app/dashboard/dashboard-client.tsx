"use client";

import { useState, useTransition, type FormEvent, type InputHTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  Plus,
  FolderOpen,
  UtensilsCrossed,
  X,
  ExternalLink,
  QrCode,
} from "lucide-react";
import {
  createCategory,
  createMenuItem,
  updateRestaurantWhatsApp,
  type RestaurantWithMenu,
} from "@/actions/menu";
import { uploadMenuItemPhoto } from "@/actions/upload";
import { PhotoUploadField } from "@/components/dashboard/photo-upload-field";
import { QRCodeGenerator } from "@/components/dashboard/QRCodeGenerator";

type DashboardTab = "menu" | "qr";

function tabClassName(isActive: boolean) {
  return `inline-flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition ${
    isActive
      ? "border-emerald-600 text-emerald-700"
      : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
  }`;
}

export function DashboardClient({
  restaurant,
}: {
  restaurant: RestaurantWithMenu;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [whatsapp, setWhatsapp] = useState(restaurant.whatsappNumber);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [whatsappSaved, setWhatsappSaved] = useState(false);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>("menu");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  function refresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleWhatsAppSave(e: FormEvent) {
    e.preventDefault();
    setWhatsappError(null);
    setWhatsappSaved(false);

    const result = await updateRestaurantWhatsApp(whatsapp);
    if (!result.success) {
      setWhatsappError(result.error);
      return;
    }

    setWhatsappSaved(true);
    refresh();
  }

  async function handleCreateCategory(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const form = new FormData(e.currentTarget);

    const result = await createCategory({
      restaurantId: restaurant.id,
      nameEn: String(form.get("nameEn")),
      nameAr: String(form.get("nameAr")),
      sortOrder: Number(form.get("sortOrder") || 0),
    });

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    setCategoryModalOpen(false);
    refresh();
  }

  function clearPhotoSelection() {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  function handlePhotoChange(file: File | null, previewUrl: string | null) {
    if (photoPreview && photoPreview !== previewUrl) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(file);
    setPhotoPreview(previewUrl);
  }

  async function handleCreateMenuItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const form = new FormData(e.currentTarget);

    let imageUrl: string | undefined;

    if (photoFile) {
      setIsUploading(true);
      const uploadForm = new FormData();
      uploadForm.append("photo", photoFile);
      uploadForm.append("restaurantId", restaurant.id);

      const uploadResult = await uploadMenuItemPhoto(uploadForm);
      setIsUploading(false);

      if (!uploadResult.success) {
        setFormError(uploadResult.error);
        return;
      }

      imageUrl = uploadResult.data.url;
    }

    const result = await createMenuItem({
      categoryId: selectedCategoryId,
      nameEn: String(form.get("nameEn")),
      nameAr: String(form.get("nameAr")),
      description: String(form.get("description") || "") || undefined,
      price: Number(form.get("price")),
      imageUrl,
    });

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    clearPhotoSelection();
    setItemModalOpen(false);
    refresh();
  }

  function openItemModal(categoryId: string) {
    setSelectedCategoryId(categoryId);
    setFormError(null);
    clearPhotoSelection();
    setItemModalOpen(true);
  }

  function closeItemModal() {
    clearPhotoSelection();
    setItemModalOpen(false);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">{restaurant.name}</h1>
            {restaurant.description && (
              <p className="mt-1 text-sm text-zinc-600">
                {restaurant.description}
              </p>
            )}
            <p className="mt-2 text-xs text-zinc-500">
              Public menu: /{restaurant.slug}
            </p>
          </div>
          <a
            href={`/${restaurant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline"
          >
            View menu
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <form onSubmit={handleWhatsAppSave} className="mt-6 space-y-3">
          <label
            htmlFor="whatsapp"
            className="flex items-center gap-2 text-sm font-medium text-zinc-700"
          >
            <Phone className="h-4 w-4" />
            WhatsApp number
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="whatsapp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-500"
              placeholder="+961..."
              required
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Save
            </button>
          </div>
          {whatsappError && (
            <p className="text-sm text-red-600">{whatsappError}</p>
          )}
          {whatsappSaved && (
            <p className="text-sm text-emerald-600">WhatsApp number updated.</p>
          )}
        </form>
      </section>

      <nav
        aria-label="Dashboard sections"
        className="flex gap-6 border-b border-zinc-200"
      >
        <button
          type="button"
          onClick={() => setActiveTab("menu")}
          className={tabClassName(activeTab === "menu")}
        >
          <FolderOpen className="h-4 w-4" />
          Menu management
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("qr")}
          className={tabClassName(activeTab === "qr")}
        >
          <QrCode className="h-4 w-4" />
          QR Code Menu
        </button>
      </nav>

      {activeTab === "qr" ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            QR Code Menu
          </h2>
          <p className="mb-6 text-sm text-zinc-600">
            Share this QR code so customers can open your public menu at{" "}
            <span className="font-mono text-zinc-800">/{restaurant.slug}</span>.
          </p>
          <QRCodeGenerator slug={restaurant.slug} />
        </section>
      ) : (
        <>
      <section className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
          <FolderOpen className="h-5 w-5" />
          Menu categories
        </h2>
        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setCategoryModalOpen(true);
          }}
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Add category
        </button>
      </section>

      <div className="space-y-4">
        {restaurant.categories.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
            No categories yet. Add your first category to start building the
            menu.
          </p>
        ) : (
          restaurant.categories.map((category) => (
            <div
              key={category.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-zinc-900">{category.nameEn}</h3>
                  <p className="text-sm text-zinc-500">{category.nameAr}</p>
                </div>
                <button
                  type="button"
                  onClick={() => openItemModal(category.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  Add item
                </button>
              </div>

              {category.items.length > 0 && (
                <ul className="mt-4 divide-y divide-zinc-100 border-t border-zinc-100 pt-3">
                  {category.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between py-2 text-sm"
                    >
                      <div>
                        <span className="font-medium text-zinc-900">{item.nameEn}</span>
                        <span className="mx-2 text-zinc-400">·</span>
                        <span className="text-zinc-600">{item.nameAr}</span>
                        {!item.isAvailable && (
                          <span className="ml-2 text-xs text-amber-600">
                            (unavailable)
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-zinc-900">
                        {item.price} {restaurant.currency}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
        </>
      )}

      {categoryModalOpen && (
        <Modal title="Add category" onClose={() => setCategoryModalOpen(false)}>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <Field label="Name (English)" name="nameEn" required />
            <Field label="Name (Arabic)" name="nameAr" required />
            <Field
              label="Sort order"
              name="sortOrder"
              type="number"
              defaultValue="0"
            />
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <ModalActions
              isPending={isPending}
              onCancel={() => setCategoryModalOpen(false)}
            />
          </form>
        </Modal>
      )}

      {itemModalOpen && (
        <Modal title="Add menu item" onClose={closeItemModal}>
          <form onSubmit={handleCreateMenuItem} className="space-y-4">
            <Field label="Name (English)" name="nameEn" required />
            <Field label="Name (Arabic)" name="nameAr" required />
            <Field label="Description" name="description" />
            <Field
              label="Price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
            />
            <PhotoUploadField
              preview={photoPreview}
              onFileChange={handlePhotoChange}
            />
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <ModalActions
              isPending={isPending || isUploading}
              submitLabel={isUploading ? "Uploading photo…" : "Save"}
              onCancel={closeItemModal}
            />
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 id="modal-title" className="text-lg font-semibold text-zinc-900">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 hover:bg-zinc-100"
          >
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  ...inputProps
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-zinc-700">{label}</label>
      <input
        {...inputProps}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-500"
      />
    </div>
  );
}

function ModalActions({
  onCancel,
  isPending,
  submitLabel = "Save",
}: {
  onCancel: () => void;
  isPending: boolean;
  submitLabel?: string;
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={isPending}
        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </div>
  );
}
