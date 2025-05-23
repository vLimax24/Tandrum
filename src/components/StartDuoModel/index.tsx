import React from "react";
import { ModalLayout } from "./ModalLayout";
import { useStartDuo } from "./useStartDuo";
import { Id } from "convex/_generated/dataModel";

type Props = {
  visible: boolean;
  onClose: () => void;
  userId: Id<"users">;
};

export const StartDuoModal = ({ visible, onClose, userId }: Props) => {
  const {
    username,
    setUsername,
    userMatch,
    inviteLink,
    copyToClipboard,
    handleSendInvite,
  } = useStartDuo(userId, onClose);

  return (
    <ModalLayout
      visible={visible}
      onClose={onClose}
      username={username}
      setUsername={setUsername}
      inviteLink={inviteLink}
      userMatch={userMatch}
      copyToClipboard={copyToClipboard}
      handleSendInvite={handleSendInvite}
    />
  );
};
