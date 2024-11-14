import React, { useEffect, useState } from "react";
import generateAvatar from "./avagen";

const AvatarDisplay: React.FC<{ inputValue: string }> = ({ inputValue }) => {
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  useEffect(() => {
    const fetchAvatar = async () => {
      if (!inputValue) return;
      const url = await generateAvatar(inputValue);
      setAvatarUrl(url);
    };

    fetchAvatar();
  }, [inputValue]);

  return (
    <div>
      {avatarUrl ? (
        <img src={avatarUrl} alt="Avatar" width={250} height={250} />
      ) : (
        <p>Генерация аватарки...</p>
      )}
    </div>
  );
};

export default AvatarDisplay;
