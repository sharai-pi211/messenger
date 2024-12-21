interface Reaction {
    emoji: string;
    userId: string;
  }

interface ReactionButtonProps {
    emoji: string;
    userId: string | null;
    messageReactions: Reaction[] | undefined;
    onToggle: (emoji: string) => void;
  }

export const ReactionButton: React.FC<ReactionButtonProps> = ({
    emoji,
    userId,
    messageReactions,
    onToggle,
  }) => {
    const isActiveByUser = messageReactions?.some(
      (reaction) => reaction.emoji === emoji && reaction.userId === userId
    );
  
    const isActiveByOthers = messageReactions?.some(
      (reaction) => reaction.emoji === emoji
    );
  
    const buttonClass = isActiveByUser
      ? "reaction-blue"
      : isActiveByOthers
      ? "reaction-active"
      : "";
  
    return (
      <button
        className={`reaction-button ${buttonClass}`}
        onClick={() => onToggle(emoji)}
      >
        {emoji}
      </button>
    );
  };
  