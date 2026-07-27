/* eslint-disable @next/next/no-img-element */

import type { MessageUser } from "@/app/services/message.action";
import { getInitial } from "./message-utils";

type MessageAvatarProps = {
  size?: "large" | "medium" | "small";
  user?: MessageUser | null;
};

const sizeClasses = {
  large: "size-20 text-2xl",
  medium: "size-12 text-base",
  small: "size-10 text-sm",
};

export default function MessageAvatar({
  size = "medium",
  user,
}: MessageAvatarProps) {
  const label = user?.fullName?.trim() || user?.username || "Người dùng";

  return (
    <span
      aria-label={`Ảnh đại diện của ${label}`}
      className={`${sizeClasses[size]} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#6374ff] to-[#9b5cff] font-bold text-white`}
      role="img"
    >
      {user?.profilePicture ? (
        <img
          alt=""
          className="size-full object-cover"
          referrerPolicy="no-referrer"
          src={user.profilePicture}
        />
      ) : (
        getInitial(user)
      )}
    </span>
  );
}
