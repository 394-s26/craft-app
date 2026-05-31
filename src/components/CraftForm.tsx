import { useState, useEffect, type FormEvent } from "react";
import type {
  Craft,
  CraftInput,
  CraftPhoto,
  CraftSource,
  CraftStatus,
} from "../types/Craft";
import { useAuth } from "../hooks/useAuth";
import { useCrafts } from "../hooks/useCrafts";
import { uploadCraftPhoto } from "../services/storageService";

interface CraftFormProps {
  initialCraft?: Craft;
  submitLabel: string;
  onSubmit: (input: CraftInput) => Promise<void>;
  inspirationMode?: boolean;
}

interface MaterialEntry {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

const UNIT_OPTIONS = [
  "yards",
  "meters",
  "inches",
  "cm",
  "grams",
  "oz",
  "skeins",
  "balls",
  "spools",
  "sheets",
  "pieces",
];

const parseMaterial = (s: string): MaterialEntry => {
  const match = s.match(/^(.+)\s+\((.+)\)$/);
  return match
    ? { id: crypto.randomUUID(), name: match[1], quantity: match[2], unit: "" }
    : { id: crypto.randomUUID(), name: s, quantity: "", unit: "" };
};

const serializeMaterial = (m: MaterialEntry): string => {
  const qtyUnit = [m.quantity.trim(), m.unit.trim()].filter(Boolean).join(" ");
  return qtyUnit ? `${m.name.trim()} (${qtyUnit})` : m.name.trim();
};

export const CraftForm = ({
  initialCraft,
  submitLabel,
  onSubmit,
  inspirationMode = false,
}: CraftFormProps) => {
  const { user } = useAuth();
  const { crafts } = useCrafts();

  const [title, setTitle] = useState(initialCraft?.title ?? "");
  const [description, setDescription] = useState(
    initialCraft?.description ?? "",
  );
  const [materials, setMaterials] = useState<MaterialEntry[]>(
    (initialCraft?.materials ?? []).map(parseMaterial),
  );
  const [newMaterialName, setNewMaterialName] = useState("");
  const [newMaterialQuantity, setNewMaterialQuantity] = useState("");
  const [newMaterialUnit, setNewMaterialUnit] = useState("");
  const [newMaterialCustomUnit, setNewMaterialCustomUnit] = useState("");
  const [isPublic, setIsPublic] = useState(initialCraft?.isPublic ?? false);

  const [isDragging, setIsDragging] = useState(false);
  const addMaterial = () => {
    const trimmedName = newMaterialName.trim();
    if (!trimmedName) return;
    const effectiveUnit =
      newMaterialUnit === "custom"
        ? newMaterialCustomUnit.trim()
        : newMaterialUnit;
    setMaterials((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: trimmedName,
        quantity: newMaterialQuantity.trim(),
        unit: effectiveUnit,
      },
    ]);
    setNewMaterialName("");
    setNewMaterialQuantity("");
    setNewMaterialUnit("");
    setNewMaterialCustomUnit("");
  };

  const removeMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };
  const [sources, setSources] = useState<CraftSource[]>(
    initialCraft?.sources?.length ? initialCraft.sources : [],
  );
  const [status] = useState<CraftStatus>(
    initialCraft?.status ?? "work-in-progress",
  );
  const [photos, setPhotos] = useState<CraftPhoto[]>(
    initialCraft?.photos ?? [],
  );
  const [photoUrl, setPhotoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [
    externalImageUploadingBySourceId,
    setExternalImageUploadingBySourceId,
  ] = useState<Record<string, boolean>>({});

  const isExternalImageUploading = Object.values(
    externalImageUploadingBySourceId,
  ).some(Boolean);
  const isSubmitDisabled = saving || uploading || isExternalImageUploading;

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.files;
      if (items && items.length > 0) {
        void handleFileChange(items);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const inspirationCrafts = crafts.filter(
    (craft) => craft.status === "inspiration" && craft.id !== initialCraft?.id,
  );

  const addSource = () => {
    setSources((currentSources) => [
      ...currentSources,
      { id: crypto.randomUUID(), type: "external", url: "" },
    ]);
  };

  const updateSource = (sourceId: string, nextSource: CraftSource) => {
    setSources((currentSources) =>
      currentSources.map((source) =>
        source.id === sourceId ? nextSource : source,
      ),
    );
  };

  const removeSource = (sourceId: string) => {
    setSources((currentSources) =>
      currentSources.filter((source) => source.id !== sourceId),
    );
    setExternalImageUploadingBySourceId(
      ({ [sourceId]: _removed, ...remaining }) => remaining,
    );
  };

  const handleExternalImageUpload = async (
    sourceId: string,
    files: FileList | null,
  ) => {
    if (!files || files.length === 0 || !user) return;

    const file = files[0];
    setError(null);
    setExternalImageUploadingBySourceId((current) => ({
      ...current,
      [sourceId]: true,
    }));

    try {
      const imageUrl = await uploadCraftPhoto(file, user.uid);
      setSources((currentSources) =>
        currentSources.map((source) =>
          source.id === sourceId && source.type === "external"
            ? { ...source, imageUrl }
            : source,
        ),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Inspiration source image upload failed:", err);
      setError(`Failed to upload image for inspiration source: ${msg}`);
    } finally {
      setExternalImageUploadingBySourceId((current) => ({
        ...current,
        [sourceId]: false,
      }));
    }
  };

  const addPhotoUrl = () => {
    const trimmedUrl = photoUrl.trim();
    if (!trimmedUrl) {
      return;
    }

    setPhotos((currentPhotos) => [
      ...currentPhotos,
      {
        id: crypto.randomUUID(),
        url: trimmedUrl,
        alt: `${title || "Craft"} photo`,
      },
    ]);
    setPhotoUrl("");
  };

  const handleFileChange = async (files: FileList | null) => {
    if (!files || !user) return;

    const fileArray = Array.from(files);
    setUploading(true);
    setError(null);

    const newPhotos: CraftPhoto[] = [];
    const failed: string[] = [];

    await Promise.all(
      fileArray.map(async (file) => {
        try {
          const url = await uploadCraftPhoto(file, user.uid);
          newPhotos.push({ id: crypto.randomUUID(), url, alt: file.name });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("Photo upload failed:", err);
          failed.push(`${file.name}: ${msg}`);
        }
      }),
    );

    setPhotos((prev) => [...prev, ...newPhotos]);
    setUploading(false);

    if (failed.length > 0) {
      setError(`Failed to upload: ${failed.join(", ")}`);
    }
  };

  const removePhoto = (photoId: string) => {
    setPhotos((currentPhotos) =>
      currentPhotos.filter((photo) => photo.id !== photoId),
    );
  };

  const cleanSources = (): CraftSource[] =>
    sources
      .map((source) => {
        if (source.type === "external") {
          const trimmedUrl = source.url.trim();
          const trimmedLabel = source.label?.trim();

          return {
            id: source.id,
            type: "external" as const,
            url: trimmedUrl,
            ...(source.imageUrl ? { imageUrl: source.imageUrl } : {}),
            ...(trimmedLabel ? { label: trimmedLabel } : {}),
          };
        }

        return {
          id: source.id,
          type: "craft" as const,
          craftId: source.craftId,
        };
      })
      .filter((source) => {
        if (source.type === "external") return Boolean(source.url);
        return Boolean(source.craftId);
      });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please add a title.");
      return;
    }

    if (uploading || isExternalImageUploading) {
      setError("Please wait for all images to finish uploading before saving.");
      return;
    }

    const nextSources = cleanSources();
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        materials: materials.map(serializeMaterial),
        isPublic,
        photos,
        status,
        sources: nextSources,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save craft.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <label className="block">
        <span className="text-sm font-bold text-stone-700">Craft title</span>
        <input
          className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-ghibli-forest"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Linen summer dress"
        />
      </label>

      <label className="block">
        <span className="text-sm font-bold text-stone-700">
          Description / vision
        </span>
        <textarea
          className="mt-2 min-h-16 w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-ghibli-forest"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What are you making? What look are you going for?"
        />
      </label>
      {!inspirationMode && (
      <div className="block">
        <span className="text-sm font-bold text-stone-700">Materials</span>
        {materials.length > 0 && (
          <ul className="mt-2 space-y-2">
            {materials.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm"
              >
                <span className="flex-1 text-ghibli-deep">{m.name}</span>
                {(m.quantity || m.unit) && (
                  <span className="text-stone-500">
                    {[m.quantity, m.unit].filter(Boolean).join(" ")}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeMaterial(m.id)}
                  className="text-stone-400 hover:text-red-600"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            className="min-w-0 flex-1 rounded-2xl border border-stone-300 px-4 py-2 text-sm outline-none focus:border-ghibli-forest"
            placeholder="Material name"
            value={newMaterialName}
            onChange={(e) => setNewMaterialName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addMaterial();
              }
            }}
          />
          <input
            className="w-20 rounded-2xl border border-stone-300 px-4 py-2 text-sm outline-none focus:border-ghibli-forest"
            placeholder="Qty"
            value={newMaterialQuantity}
            onChange={(e) => setNewMaterialQuantity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addMaterial();
              }
            }}
          />
          <select
            className="rounded-2xl border border-stone-300 px-3 py-2 text-sm outline-none focus:border-ghibli-forest"
            value={newMaterialUnit}
            onChange={(e) => {
              setNewMaterialUnit(e.target.value);
              setNewMaterialCustomUnit("");
            }}
          >
            <option value="">Unit</option>
            {UNIT_OPTIONS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
            <option value="custom">Custom...</option>
          </select>
          {newMaterialUnit === "custom" && (
            <input
              className="w-28 rounded-2xl border border-stone-300 px-4 py-2 text-sm outline-none focus:border-ghibli-forest"
              placeholder="e.g. skeins"
              value={newMaterialCustomUnit}
              onChange={(e) => setNewMaterialCustomUnit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addMaterial();
                }
              }}
            />
          )}
          <button
            type="button"
            onClick={addMaterial}
            className="rounded-2xl border border-stone-300 px-4 py-2 text-sm font-bold text-stone-700 hover:border-ghibli-forest"
          >
            Add
          </button>
        </div>
      </div>
      )}

      {!inspirationMode && (
      <section className="rounded-2xl bg-ghibli-light p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-ghibli-deep">Inspiration sources</h3>
            <p className="text-sm text-stone-600">
              Add an external link or attach an existing inspiration.
            </p>
          </div>
          <button
            className="rounded-full bg-ghibli-deep px-4 py-2 text-sm font-bold text-white hover:bg-ghibli-forest"
            type="button"
            onClick={addSource}
          >
            + Add
          </button>
        </div>

        {sources.length > 0 ? (
          <div className="mt-4 space-y-3">
            {sources.map((source) => (
              <div
                className="grid gap-3 rounded-2xl bg-white p-3 md:grid-cols-[160px_1fr_auto]"
                key={source.id}
              >
                <select
                  className="rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-ghibli-forest"
                  value={source.type}
                  onChange={(event) => {
                    const nextType = event.target.value as CraftSource["type"];
                    updateSource(
                      source.id,
                      nextType === "external"
                        ? {
                            id: source.id,
                            type: "external",
                            url: "",
                            imageUrl: "",
                          }
                        : { id: source.id, type: "craft", craftId: "" },
                    );
                  }}
                >
                  <option value="external">External link</option>
                  <option value="craft">Existing inspo</option>
                </select>

                {source.type === "external" ? (
                  <div className="flex flex-col gap-2">
                    <input
                      className="rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-ghibli-forest"
                      value={source.url}
                      onChange={(event) =>
                        updateSource(source.id, {
                          ...source,
                          url: event.target.value,
                        })
                      }
                      placeholder="Instagram, Etsy, blog, Pinterest..."
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="file"
                        accept="image/*,.heic,.heif"
                        id={`external-image-upload-${source.id}`}
                        style={{ display: "none" }}
                        disabled={Boolean(
                          externalImageUploadingBySourceId[source.id],
                        )}
                        onChange={(event) => {
                          void handleExternalImageUpload(
                            source.id,
                            event.target.files,
                          );
                          event.target.value = "";
                        }}
                      />
                      <label
                        htmlFor={`external-image-upload-${source.id}`}
                        className={`rounded-2xl border border-stone-300 px-4 py-2 text-sm bg-white hover:border-ghibli-forest ${externalImageUploadingBySourceId[source.id] ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                      >
                        {externalImageUploadingBySourceId[source.id]
                          ? "Uploading..."
                          : source.imageUrl
                            ? "Change Image/Screenshot"
                            : "Upload Image/Screenshot"}
                      </label>
                      {source.imageUrl && (
                        <img
                          src={source.imageUrl}
                          alt="Preview"
                          className="h-10 w-10 rounded object-cover border border-stone-200"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <select
                    className="rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-ghibli-forest"
                    value={source.craftId}
                    onChange={(event) =>
                      updateSource(source.id, {
                        ...source,
                        craftId: event.target.value,
                      })
                    }
                  >
                    <option value="">Choose an inspiration craft</option>
                    {inspirationCrafts.map((craft) => (
                      <option key={craft.id} value={craft.id}>
                        {craft.title}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  className="rounded-2xl border border-red-200 px-4 py-3 font-semibold text-red-700 hover:bg-red-50"
                  type="button"
                  onClick={() => removeSource(source.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-stone-600">
            No inspiration sources added yet.
          </p>
        )}
      </section>
      )}
      
      <section className="rounded-2xl bg-ghibli-light p-4">
        <h3 className="font-bold text-ghibli-deep">Photos</h3>
        <div
          className={`mt-3 rounded-2xl border-2 border-dashed p-4 transition ${
            isDragging
              ? "border-ghibli-forest bg-ghibli-light ring-2 ring-ghibli-forest/30"
              : "border-stone-300"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            void handleFileChange(e.dataTransfer.files);
          }}
        >
          <p className="mb-3 text-sm font-medium text-stone-600">
            Drag & drop images here, paste from clipboard, or upload files
            below.
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              className="rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-ghibli-forest"
              value={photoUrl}
              onChange={(event) => setPhotoUrl(event.target.value)}
              placeholder="Paste image URL"
            />
            <button
              className="rounded-2xl border border-stone-300 bg-white px-5 py-3 font-semibold text-ghibli-deep hover:bg-ghibli-light"
              type="button"
              onClick={addPhotoUrl}
            >
              Add URL
            </button>
          </div>
          <label className="mt-3 block">
            <span className="sr-only">Upload photos</span>
            <input
              className="block w-full text-sm text-stone-700 file:mr-4 file:rounded-full file:border-0 file:bg-ghibli-deep file:px-4 file:py-2 file:font-semibold file:text-white disabled:opacity-50"
              type="file"
              accept="image/*,.heic,.heif"
              multiple
              disabled={uploading}
              onChange={(event) => void handleFileChange(event.target.files)}
            />
          </label>
          {uploading ? (
            <p className="mt-2 text-sm text-ghibli-forest">
              Uploading photos...
            </p>
          ) : null}
          {isExternalImageUploading ? (
            <p className="mt-2 text-sm text-ghibli-forest">
              Uploading inspiration image...
            </p>
          ) : null}
          {photos.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white"
                >
                  <img
                    className="h-32 w-full object-cover"
                    src={photo.url}
                    alt={photo.alt}
                  />
                  <button
                    className="absolute right-2 top-2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-ghibli-deep"
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <div className="flex items-center justify-between rounded-2xl border border-stone-200 px-4 py-3">
        <div>
          <span className="text-sm font-bold text-stone-700">
            Visibility: {isPublic ? "Public" : "Private"}
          </span>
          <p className="text-xs text-stone-500">
            {isPublic
              ? "Anyone can view this craft"
              : "Only you can see this craft"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsPublic((prev) => !prev)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublic ? "bg-ghibli-forest" : "bg-stone-300"}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? "translate-x-6" : "translate-x-1"}`}
          />
        </button>
      </div>

      {error ? (
        <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <button
        className="w-full rounded-full bg-ghibli-deep px-5 py-3 font-bold text-white hover:bg-ghibli-forest disabled:cursor-not-allowed disabled:bg-ghibli-sage"
        type="submit"
        disabled={isSubmitDisabled}
      >
        {saving
          ? "Saving..."
          : uploading || isExternalImageUploading
            ? "Uploading images..."
            : submitLabel}
      </button>
    </form>
  );
};