"use client";

import UserAvatar from "@/app/(main)/profile/components/UserAvatar";
import {
  type FormActionState,
  type UserProfile,
  updateProfileAction,
} from "@/app/services/user.action";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useState,
} from "react";

const initialState: FormActionState = {
  success: false,
  message: "",
};

const inputClassName =
  "min-h-11 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-background-elevated)] px-3.5 py-2.5 text-[15px] text-[var(--app-text)] shadow-sm outline-none transition placeholder:text-[var(--app-subtle)] hover:border-[var(--app-border-strong)] focus-visible:border-[#6879e8] focus-visible:ring-2 focus-visible:ring-[#4154c8]/25";

type ProfileFields = {
  bio: string;
  fullName: string;
  gender: string;
  website: string;
};

function FieldError({
  errors,
  id,
}: {
  errors?: string[];
  id: string;
}) {
  if (!errors?.length) {
    return null;
  }

  return (
    <p className="mt-1.5 text-sm text-[#dc2626]" id={id} role="alert">
      {errors[0]}
    </p>
  );
}

export default function EditProfileForm({
  profile,
}: {
  profile: UserProfile;
}) {
  const router = useRouter();
  const [state, formAction, isSaving] = useActionState(
    updateProfileAction,
    initialState,
  );
  const [previewUrl, setPreviewUrl] = useState(
    profile.profilePicture ?? "",
  );
  const [pictureVersion, setPictureVersion] = useState(0);
  const [fields, setFields] = useState<ProfileFields>({
    bio: profile.bio ?? "",
    fullName: profile.fullName ?? "",
    gender: profile.gender ?? "",
    website: profile.website ?? "",
  });
  const [lastSubmittedFields, setLastSubmittedFields] =
    useState<ProfileFields>({
    bio: profile.bio ?? "",
    fullName: profile.fullName ?? "",
    gender: profile.gender ?? "",
    website: profile.website ?? "",
  });
  const [
    lastSubmittedPictureVersion,
    setLastSubmittedPictureVersion,
  ] = useState(0);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  useEffect(
    () => () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    },
    [previewUrl],
  );

  const comparisonFields = state.success
    ? lastSubmittedFields
    : {
        bio: profile.bio ?? "",
        fullName: profile.fullName ?? "",
        gender: profile.gender ?? "",
        website: profile.website ?? "",
      };
  const comparisonPictureVersion = state.success
    ? lastSubmittedPictureVersion
    : 0;
  const hasFormChanges =
    pictureVersion !== comparisonPictureVersion ||
    fields.fullName !== comparisonFields.fullName ||
    fields.bio !== comparisonFields.bio ||
    fields.website !== comparisonFields.website ||
    fields.gender !== comparisonFields.gender;

  function updateField<Key extends keyof ProfileFields>(
    field: Key,
    value: ProfileFields[Key],
  ) {
    setFields((currentFields) => ({
      ...currentFields,
      [field]: value,
    }));
  }

  function handlePictureChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setPictureVersion((currentVersion) => currentVersion + 1);
    }
  }

  return (
    <form
      action={formAction}
      className="space-y-6"
      noValidate
      onSubmit={() => {
        setLastSubmittedFields(fields);
        setLastSubmittedPictureVersion(pictureVersion);
      }}
    >
      <div className="space-y-2 pb-2 sm:pb-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <UserAvatar
            className="size-16 sm:size-18"
            fullName={fields.fullName}
            plain
            profilePicture={previewUrl}
            username={profile.username}
          />

          <div className="min-w-0">
            <p className="truncate text-base font-bold text-[var(--app-text)]">
              {profile.username}
            </p>
            <p className="mt-0.5 truncate text-sm text-[var(--app-text)] sm:text-base">
              {fields.fullName || profile.username}
            </p>
          </div>

          <label className="ml-auto inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[#4657f2] px-4 text-sm font-semibold text-white transition hover:bg-[#5667ff] focus-within:ring-2 focus-within:ring-[#8f9cff] focus-within:ring-offset-2 focus-within:ring-offset-[var(--app-surface)] sm:px-6">
            Đổi ảnh
            <input
              accept="image/gif,image/jpeg,image/png"
              aria-describedby={
                state.errors?.profilePicture
                  ? "profile-picture-error"
                  : undefined
              }
              aria-invalid={Boolean(state.errors?.profilePicture)}
              className="sr-only"
              name="profilePicture"
              onChange={handlePictureChange}
              type="file"
            />
          </label>
        </div>
        <FieldError
          errors={state.errors?.profilePicture}
          id="profile-picture-error"
        />
      </div>

      <div>
        <label
          className="mb-1.5 block text-sm font-semibold text-[var(--app-text)]"
          htmlFor="fullName"
        >
          Họ tên
        </label>
        <input
          aria-describedby={
            state.errors?.fullName ? "full-name-error" : undefined
          }
          aria-invalid={Boolean(state.errors?.fullName)}
          autoComplete="name"
          className={inputClassName}
          id="fullName"
          maxLength={100}
          name="fullName"
          onChange={(event) =>
            updateField("fullName", event.target.value)
          }
          placeholder="Họ tên"
          type="text"
          value={fields.fullName}
        />
        <FieldError
          errors={state.errors?.fullName}
          id="full-name-error"
        />
      </div>

      <div>
        <label
          className="mb-1.5 block text-sm font-semibold text-[var(--app-text)]"
          htmlFor="bio"
        >
          Tiểu sử
        </label>
        <textarea
          aria-describedby={state.errors?.bio ? "bio-error" : undefined}
          aria-invalid={Boolean(state.errors?.bio)}
          className={`${inputClassName} min-h-20 resize-y`}
          id="bio"
          maxLength={150}
          name="bio"
          onChange={(event) => updateField("bio", event.target.value)}
          placeholder="Tiểu sử"
          value={fields.bio}
        />
        <FieldError errors={state.errors?.bio} id="bio-error" />
      </div>

      <div>
        <label
          className="mb-1.5 block text-sm font-semibold text-[var(--app-text)]"
          htmlFor="website"
        >
          Trang web
        </label>
        <input
          aria-describedby={
            state.errors?.website ? "website-error" : undefined
          }
          aria-invalid={Boolean(state.errors?.website)}
          autoComplete="url"
          className={inputClassName}
          id="website"
          name="website"
          onChange={(event) =>
            updateField("website", event.target.value)
          }
          placeholder="Website"
          type="url"
          value={fields.website}
        />
        <FieldError
          errors={state.errors?.website}
          id="website-error"
        />
      </div>

      <div>
        <label
          className="mb-1.5 block text-sm font-semibold text-[var(--app-text)]"
          htmlFor="gender"
        >
          Giới tính
        </label>
        <select
          aria-describedby={
            state.errors?.gender ? "gender-error" : undefined
          }
          aria-invalid={Boolean(state.errors?.gender)}
          className={`${inputClassName} w-full sm:w-40`}
          id="gender"
          name="gender"
          onChange={(event) =>
            updateField("gender", event.target.value)
          }
          value={fields.gender}
        >
          <option value="">Không tiết lộ</option>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
          <option value="other">Khác</option>
        </select>
        <FieldError errors={state.errors?.gender} id="gender-error" />
      </div>

      {state.message && (
        <p
          aria-live="polite"
          className={`rounded-xl border px-4 py-3 text-sm ${
            state.success
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
              : "border-red-500/30 bg-red-500/10 text-red-600"
          }`}
          role={state.success ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}

      <div className="flex justify-center pt-1">
        <button
          className="inline-flex min-h-11 w-full max-w-56 items-center justify-center gap-2 rounded-xl bg-[#4657f2] px-5 text-base font-bold text-white shadow-sm transition enabled:hover:bg-[#5667ff] focus-visible:ring-2 focus-visible:ring-[#8f9cff] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-surface)] focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-[#59677b] disabled:text-white disabled:opacity-100"
          disabled={!hasFormChanges || isSaving}
          type="submit"
        >
          {isSaving && (
            <LoaderCircle
              aria-hidden="true"
              className="size-5 animate-spin"
            />
          )}
          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}
